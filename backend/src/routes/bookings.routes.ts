import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { sendEmail } from "../lib/mailer.js";
import {
  getClientConfirmationEmailTemplate,
  getAdminNotificationTemplate,
  getConsultantNotificationTemplate,
} from "../lib/templates/bookingEmails.js";
import { requireAdmin, requireStaff, AuthedRequest } from "../middleware/auth.middleware.js";

const router = Router();

// Public: POST /api/bookings
router.post("/", async (req, res) => {
  try {
    const { clientName, clientEmail, clientPhone, message, serviceId } = req.body as {
      clientName?: string;
      clientEmail?: string;
      clientPhone?: string;
      message?: string;
      serviceId?: string;
    };

    if (!clientName || !clientEmail || !serviceId) {
      return res.status(400).json({ message: "clientName, clientEmail, serviceId are required" });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Find a consultant assigned to this service
    let assignedConsultant = null;
    assignedConsultant = await prisma.teamMember.findFirst({
      where: {
        assignedServices: {
          has: serviceId,
        },
        isActive: true,
        passwordHash: { not: null }, // Must be a staff member (has login)
      },
    });

    // Generate unique booking reference (short and memorable)
    const bookingRef = `FECASC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        clientName,
        clientEmail,
        clientPhone: clientPhone || null,
        message: message || null,
        serviceId,
        assignedConsultantId: assignedConsultant?.id || null,
        status: assignedConsultant ? "ASSIGNED" : "NEW",
        consultantNotifiedAt: assignedConsultant ? new Date() : null,
      },
      include: { 
        service: true,
        assignedConsultant: true,
      },
    });

    // Email setup
    const adminEmail = process.env.COMPANY_NOTIFY_EMAIL;
    const companyPhone = process.env.COMPANY_PHONE || "+1 (555) 000-0000";
    const resendFromEmail = process.env.RESEND_FROM_EMAIL || "noreply@fecasc.com";
    const canEmail = adminEmail && process.env.RESEND_API_KEY;

    if (canEmail) {
      try {
        // 1. IMMEDIATE confirmation email to CLIENT
        const { html: clientHtml, text: clientText } = getClientConfirmationEmailTemplate(
          clientName,
          booking.bookingRef,
          booking.service.title,
          preferredDate || null,
          preferredTime || null,
          clientEmail,
          clientPhone || null,
          adminEmail,
          companyPhone
        );

        await sendEmail({
          from: resendFromEmail,
          to: clientEmail,
          subject: `We Received Your Request - Ref: ${booking.bookingRef}`,
          html: clientHtml,
          text: clientText,
        });

        // Update booking to mark confirmation email as sent
        await prisma.booking.update({
          where: { id: booking.id },
          data: { clientConfirmEmailSent: new Date() },
        });

        // 2. Admin notification
        const { html: adminHtml, text: adminText } = getAdminNotificationTemplate(
          booking.bookingRef,
          booking.service.title,
          booking.clientName,
          booking.clientEmail,
          booking.clientPhone || null,
          booking.message || null,
          assignedConsultant ? { name: assignedConsultant.name, title: assignedConsultant.title } : null,
          booking.createdAt
        );

        await sendEmail({
          from: resendFromEmail,
          to: adminEmail,
          subject: `New Booking: ${booking.service.title} (${booking.bookingRef})${assignedConsultant ? ` - Assigned to ${assignedConsultant.name}` : ""}`,
          html: adminHtml,
          text: adminText,
        });

        // 3. Consultant notification (if assigned)
        if (assignedConsultant?.email) {
          const { html: consultantHtml, text: consultantText } = getConsultantNotificationTemplate(
            booking.bookingRef,
            booking.service.title,
            booking.clientName,
            booking.clientEmail,
            booking.clientPhone || null,
            booking.message || null
          );

          await sendEmail({
            from: resendFromEmail,
            to: assignedConsultant.email,
            subject: `New Client Inquiry: ${booking.service.title} (${booking.bookingRef})`,
            html: consultantHtml,
            text: consultantText,
          });
        }
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        // Don't fail the booking if email fails, just log it
      }
    }

    return res.status(201).json({ 
      message: "Booking submitted successfully. Confirmation email sent to client.",
      booking: {
        ...booking,
        bookingRef: booking.bookingRef,
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to submit booking" });
  }
});

// Admin: GET /api/bookings
router.get("/", requireAdmin, async (_req, res) => {
  const bookings = await prisma.booking.findMany({
    include: { 
      service: true,
      assignedConsultant: {
        select: {
          id: true,
          name: true,
          title: true,
          email: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(bookings);
});

// Staff: GET /api/bookings/my-bookings (Consultant's assigned bookings)
router.get("/my-bookings", requireStaff, async (req: AuthedRequest, res) => {
  try {
    const staffId = req.staff?.staffId;
    if (!staffId) {
      return res.status(401).json({ message: "Staff ID not found in token" });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        assignedConsultantId: staffId,
      },
      include: {
        service: true,
        assignedConsultant: {
          select: {
            id: true,
            name: true,
            title: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(bookings);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch your bookings" });
  }
});

// Admin: PATCH /api/bookings/:id/status
router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { 
      status?: "NEW" | "ASSIGNED" | "AWAITING_CLIENT" | "COMPLETED"
    };

    if (!status) return res.status(400).json({ message: "status is required" });

    // Track when consultant first reaches out to client
    const consultantRepliedAt = (status === "AWAITING_CLIENT") ? new Date() : undefined;

    const updated = await prisma.booking.update({
      where: { id: String(id) },
      data: { 
        status,
        ...(consultantRepliedAt && { consultantRepliedAt }),
      },
      include: { 
        service: true,
        assignedConsultant: {
          select: {
            id: true,
            name: true,
            title: true,
            email: true,
          }
        }
      },
    });

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to update booking status" });
  }
});

// Staff: PATCH /api/bookings/:id/notes - Add internal notes about client contact
router.patch("/:id/notes", requireStaff, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { note, contactMethod } = req.body as { note?: string; contactMethod?: string };

    if (!note) return res.status(400).json({ message: "note is required" });
    if (!contactMethod || !["WHATSAPP", "EMAIL", "PHONE"].includes(contactMethod)) {
      return res.status(400).json({ message: "contactMethod must be WHATSAPP, EMAIL, or PHONE" });
    }

    // Get existing booking
    const booking = await prisma.booking.findUnique({
      where: { id: String(id) },
      select: { 
        id: true,
        assignedConsultantId: true,
        internalNotes: true,
      }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if staff member is assigned to this booking
    if (booking.assignedConsultantId !== req.staff?.staffId) {
      return res.status(403).json({ message: "You are not assigned to this booking" });
    }

    // Append note with timestamp and contact method emoji
    const emoji = contactMethod === "WHATSAPP" ? "💬" : contactMethod === "EMAIL" ? "📧" : "☎️";
    const timestamp = new Date().toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const newNote = `[${timestamp}] ${emoji} ${contactMethod}: ${note}`;
    const updatedNotes = booking.internalNotes 
      ? `${booking.internalNotes}\n\n${newNote}`
      : newNote;

    const updated = await prisma.booking.update({
      where: { id: String(id) },
      data: { 
        internalNotes: updatedNotes,
        consultantRepliedAt: new Date(), // Mark as contacted
        lastContactMethod: contactMethod, // Track contact method
        status: "AWAITING_CLIENT", // Auto-update status when note is added
      },
      include: { 
        service: true,
        assignedConsultant: {
          select: {
            id: true,
            name: true,
            title: true,
            email: true,
          }
        }
      },
    });

    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to add note" });
  }
});

export default router;
