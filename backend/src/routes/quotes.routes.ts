import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireStaff, requireAdminOrStaff } from "../middleware/auth.middleware.js";
import { sendEmail } from "../lib/mailer.js";
import { getQuoteEmailTemplate } from "../lib/templates/quoteEmails.js";

const router = Router();

// Admin/Consultant: POST /api/quotes - Create a new quote
router.post("/", requireAdminOrStaff, async (req, res) => {
  try {
    const { bookingId, lineItems, notes, internalNotes } = req.body as {
      bookingId: string;
      lineItems: Array<{ description: string; quantity: number; unitPrice: number }>;
      notes?: string;
      internalNotes?: string;
    };

    if (!bookingId || !lineItems || lineItems.length === 0) {
      return res.status(400).json({ message: "bookingId and lineItems are required" });
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if quote already exists for this booking
    const existingQuote = await prisma.quote.findUnique({
      where: { bookingId },
    });

    if (existingQuote) {
      return res.status(409).json({ message: "Quote already exists for this booking" });
    }

    // Get authenticated user ID from request (from middleware)
    const adminId = (req as any).admin?.adminId;
    const staffId = (req as any).staff?.staffId;

    if (!adminId && !staffId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Calculate total amount
    const totalAmount = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    // Create quote with line items
    const quote = await prisma.quote.create({
      data: {
        bookingId,
        createdById: staffId || undefined,
        adminCreatedById: adminId || undefined,
        notes: notes || null,
        internalNotes: internalNotes || null,
        totalAmount,
        status: "DRAFT",
        lineItems: {
          create: lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        lineItems: true,
        createdBy: true,
        adminCreatedBy: true,
        booking: {
          include: { service: true },
        },
      },
    });

    res.status(201).json(quote);
  } catch (e: any) {
    console.error("POST /quotes Error:", e);
    res.status(500).json({ message: "Failed to create quote", error: e.message });
  }
});

// Admin/Consultant: GET /api/quotes/booking/:bookingId - Get quote for a booking
router.get("/booking/:bookingId", async (req, res) => {
  try {
    const bookingId = String(req.params.bookingId);

    const quote = await prisma.quote.findUnique({
      where: { bookingId },
      include: {
        lineItems: true,
        createdBy: {
          select: { id: true, name: true, email: true, title: true },
        },
        booking: {
          include: { service: true },
        },
      },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    res.json(quote);
  } catch (e: any) {
    console.error("GET /quotes/booking/:bookingId Error:", e);
    res.status(500).json({ message: "Failed to fetch quote" });
  }
});

// Admin/Consultant: GET /api/quotes/:quoteId - Get specific quote
router.get("/:quoteId", async (req, res) => {
  try {
    const quoteId = String(req.params.quoteId);

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      select: {
        id: true,
        bookingId: true,
        createdById: true,
        adminCreatedById: true,
        lineItems: true,
        totalAmount: true,
        notes: true,
        internalNotes: true,
        deliveryMethod: true,
        deliveryTime: true,
        clientResponse: true,
        clientMessage: true,
        responseTime: true,
        status: true,
        agreedAt: true,
        signedPdfUrl: true,
        verifiedAt: true,
        verifiedById: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: { id: true, name: true, email: true, title: true },
        },
        adminCreatedBy: {
          select: { id: true, email: true, name: true },
        },
        booking: {
          include: { service: true },
        },
      },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    res.json(quote);
  } catch (e: any) {
    console.error("GET /quotes/:quoteId Error:", e);
    res.status(500).json({ message: "Failed to fetch quote" });
  }
});

// Admin/Consultant: GET /api/quotes - Get all quotes
router.get("/", requireAdminOrStaff, async (req: any, res) => {
  try {
    const isAdmin = !!req.admin;
    const staffId = req.staff?.staffId;

    const where: any = {};

    // For staff/consultants, filter by their assigned services
    if (!isAdmin && staffId) {
      const consultant = await prisma.teamMember.findUnique({
        where: { id: staffId },
        select: { assignedServices: true },
      });

      if (consultant?.assignedServices && consultant.assignedServices.length > 0) {
        // Get bookings with the consultant's assigned services
        const bookingsWithServices = await prisma.booking.findMany({
          where: {
            serviceId: {
              in: consultant.assignedServices,
            },
          },
          select: { id: true },
        });

        const bookingIds = bookingsWithServices.map((b) => b.id);
        where.booking = { id: { in: bookingIds } };
      } else {
        // Consultant has no assigned services, return empty array
        return res.json([]);
      }
    }

    const quotes = await prisma.quote.findMany({
      where,
      select: {
        id: true,
        bookingId: true,
        createdById: true,
        adminCreatedById: true,
        lineItems: true,
        totalAmount: true,
        notes: true,
        internalNotes: true,
        deliveryMethod: true,
        deliveryTime: true,
        clientResponse: true,
        clientMessage: true,
        responseTime: true,
        status: true,
        agreedAt: true,
        signedPdfUrl: true,
        verifiedAt: true,
        verifiedById: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: { id: true, name: true, email: true, title: true },
        },
        adminCreatedBy: {
          select: { id: true, email: true, name: true },
        },
        booking: {
          include: { service: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(quotes);
  } catch (e: any) {
    console.error("GET /quotes Error:", e);
    res.status(500).json({ message: "Failed to fetch quotes" });
  }
});

// Admin/Consultant: PATCH /api/quotes/:quoteId - Update quote (only in DRAFT status)
router.patch("/:quoteId", requireAdminOrStaff, async (req, res) => {
  try {
    const quoteId = String(req.params.quoteId);
    const { lineItems, notes, internalNotes } = req.body;

    const quote = await prisma.quote.findUnique({ where: { id: quoteId } });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    if (quote.status !== "DRAFT") {
      return res.status(409).json({ message: "Can only edit quotes in DRAFT status" });
    }

    // If lineItems provided, update them
    if (lineItems && Array.isArray(lineItems)) {
      // Delete existing line items
      await prisma.lineItem.deleteMany({ where: { quoteId } });

      // Calculate new total
      const totalAmount = lineItems.reduce(
        (sum: number, item: any) => sum + item.quantity * item.unitPrice,
        0
      );

      // Update quote and create new line items
      const updated = await prisma.quote.update({
        where: { id: quoteId },
        data: {
          totalAmount,
          notes: notes || undefined,
          internalNotes: internalNotes || undefined,
          lineItems: {
            create: lineItems.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          lineItems: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      res.json(updated);
    } else {
      // Just update notes
      const updated = await prisma.quote.update({
        where: { id: quoteId },
        data: {
          notes: notes || undefined,
          internalNotes: internalNotes || undefined,
        },
        include: {
          lineItems: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      res.json(updated);
    }
  } catch (e: any) {
    console.error("PATCH /quotes/:quoteId Error:", e);
    res.status(500).json({ message: "Failed to update quote" });
  }
});

// Admin/Consultant: POST /api/quotes/:quoteId/send - Send quote to client
router.post("/:quoteId/send", requireAdminOrStaff, async (req, res) => {
  try {
    const quoteId = String(req.params.quoteId);
    const { deliveryMethod } = req.body as {
      deliveryMethod: "EMAIL" | "WHATSAPP" | "SECURE_LINK";
    };

    if (!deliveryMethod || !["EMAIL", "WHATSAPP", "SECURE_LINK"].includes(deliveryMethod)) {
      return res.status(400).json({ message: "Valid deliveryMethod required: EMAIL, WHATSAPP, or SECURE_LINK" });
    }

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        lineItems: true,
        booking: {
          include: { service: true },
        },
        createdBy: {
          select: { name: true, email: true, title: true },
        },
        adminCreatedBy: {
          select: { name: true, email: true },
        },
      },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    // Get creator info
    const creatorName = quote.createdBy?.name || quote.adminCreatedBy?.name || "Our Team";
    const creatorEmail = quote.createdBy?.email || quote.adminCreatedBy?.email || process.env.COMPANY_NOTIFY_EMAIL;

    // Update quote status and delivery method(s)
    // Track all delivery methods used
    const currentMethods = quote.deliveryMethods || [];
    const updatedMethods = currentMethods.includes(deliveryMethod) 
      ? currentMethods 
      : [...currentMethods, deliveryMethod];

    const updated = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: "SENT",
        deliveryMethod,
        deliveryTime: new Date(),
        deliveryMethods: updatedMethods,
      },
      include: {
        lineItems: true,
        booking: true,
      },
    });

    // Build approval link
    const approvalLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/quote-approval/${quoteId}`;

    // Send email based on delivery method
    try {
      const resendFromEmail = process.env.RESEND_FROM_EMAIL || "noreply@fecasc.com";
      
      if (deliveryMethod === "EMAIL") {
        // Send HTML email with approval link
        const { html, text } = getQuoteEmailTemplate(
          quote.booking.clientName,
          quoteId,
          quote.lineItems,
          quote.totalAmount,
          creatorName,
          creatorEmail,
          undefined,
          quote.notes,
          approvalLink
        );

        await sendEmail({
          from: resendFromEmail,
          to: quote.booking.clientEmail,
          subject: `Quote from ${creatorName} - Reference: ${quoteId.substring(0, 8)}`,
          html,
          text,
        });
      } else if (deliveryMethod === "WHATSAPP") {
        // Check if phone number exists
        if (!quote.booking.clientPhone) {
          return res.status(400).json({ 
            message: "Client phone number is not available. Please add it to the booking first." 
          });
        }

        // Validate phone number format (should be international format like +1234567890 or without +)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format or similar
        if (!phoneRegex.test(quote.booking.clientPhone.replace(/\D/g, ''))) {
          return res.status(400).json({ 
            message: `Invalid phone number format: ${quote.booking.clientPhone}. Please use international format like +1234567890` 
          });
        }

        // Generate WhatsApp link with pre-filled message
        const whatsappMessage = `Hi ${quote.booking.clientName}, I've prepared a quote for you. Please review and approve it here: ${approvalLink}`;
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappLink = `https://wa.me/${quote.booking.clientPhone}?text=${encodedMessage}`;

        // Send email with WhatsApp link button
        const whatsappHtml = `
          <html>
            <body style="font-family: Arial, sans-serif;">
              <h2 style="color: #25d366;">📲 Quote Ready - Open in WhatsApp</h2>
              <p>Hi ${quote.booking.clientName},</p>
              <p>Your quote is ready! Click the button below to open it in WhatsApp:</p>
              <p>
                <a href="${whatsappLink}" style="background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 600;">
                  📱 Open in WhatsApp
                </a>
              </p>
              <p style="color: #666; font-size: 12px;">Or view here: <a href="${approvalLink}">${approvalLink}</a></p>
              <p>Best regards,<br>${creatorName}</p>
            </body>
          </html>
        `;

        await sendEmail({
          from: resendFromEmail,
          to: quote.booking.clientEmail,
          subject: `Quote from ${creatorName} - Open in WhatsApp`,
          html: whatsappHtml,
        });

        console.log(`✓ [WHATSAPP] Quote ${quoteId} sent to ${quote.booking.clientPhone}`);
      } else if (deliveryMethod === "SECURE_LINK") {
        // Send simple email with just the link
        const simpleHtml = `
          <html>
            <body style="font-family: Arial, sans-serif;">
              <h2>Quote Ready for Review</h2>
              <p>Hi ${quote.booking.clientName},</p>
              <p>Your quote is ready for review. Click the link below to view and approve:</p>
              <p><a href="${approvalLink}" style="background: #2a5298; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View Quote & Approve
              </a></p>
              <p>Best regards,<br>${creatorName}</p>
            </body>
          </html>
        `;

        await sendEmail({
          from: resendFromEmail,
          to: quote.booking.clientEmail,
          subject: `Quote Ready for Review - Reference: ${quoteId.substring(0, 8)}`,
          html: simpleHtml,
        });
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Continue - don't fail the endpoint if email fails
    }

    // Build response with link information for WHATSAPP and SECURE_LINK methods
    let responseData: Record<string, any> = {
      message: deliveryMethod === "WHATSAPP" && !quote.booking.clientPhone
        ? "WhatsApp delivery failed - client phone not provided"
        : `✓ Quote sent via ${deliveryMethod}`,
      quote: updated,
      deliveryMethodsSent: updatedMethods,
      canSendAgain: true,
    };

    if (deliveryMethod === "WHATSAPP" && quote.booking.clientPhone) {
      const whatsappMessage = `Hi ${quote.booking.clientName}, I've prepared a quote for you. Please review and approve it here: ${approvalLink}`;
      const encodedMessage = encodeURIComponent(whatsappMessage);
      responseData.whatsappLink = `https://wa.me/${quote.booking.clientPhone}?text=${encodedMessage}`;
      responseData.info = "WhatsApp link sent via email ✓ Client can click the button to open WhatsApp.";
    } else if (deliveryMethod === "SECURE_LINK") {
      responseData.approvalLink = approvalLink;
      responseData.info = "Link sent via email ✓";
    } else if (deliveryMethod === "EMAIL") {
      responseData.info = "Email sent ✓";
    }

    res.json(responseData);
  } catch (e: any) {
    console.error("POST /quotes/:quoteId/send Error:", e);
    res.status(500).json({ message: "Failed to send quote" });
  }
});

// Public: POST /api/quotes/:quoteId/approve - Client approve quote
router.post("/:quoteId/approve", async (req, res) => {
  try {
    const quoteId = String(req.params.quoteId);
    const { email } = req.body as { email: string };

    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { booking: true },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    // Verify email matches booking
    if (quote.booking.clientEmail !== email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Update quote status
    const updated = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: "APPROVED",
        clientResponse: "PORTAL_APPROVAL",
        responseTime: new Date(),
      },
      include: {
        lineItems: true,
        booking: true,
      },
    });

    res.json({
      message: "Quote approved successfully",
      quote: updated,
    });
  } catch (e: any) {
    console.error("POST /quotes/:quoteId/approve Error:", e);
    res.status(500).json({ message: "Failed to approve quote" });
  }
});

// Public: POST /api/quotes/:quoteId/reject - Client reject quote
router.post("/:quoteId/reject", async (req, res) => {
  try {
    const quoteId = String(req.params.quoteId);
    const { email } = req.body as { email: string };

    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { booking: true },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    if (quote.booking.clientEmail !== email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updated = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: "REJECTED",
        clientResponse: "PORTAL_REJECTION",
        responseTime: new Date(),
      },
    });

    res.json({
      message: "Quote rejected",
      quote: updated,
    });
  } catch (e: any) {
    console.error("POST /quotes/:quoteId/reject Error:", e);
    res.status(500).json({ message: "Failed to reject quote" });
  }
});

// Public: POST /api/quotes/:quoteId/message - Client send message about quote
router.post("/:quoteId/message", async (req, res) => {
  try {
    const quoteId = String(req.params.quoteId);
    const { email, message } = req.body as { email: string; message: string };

    if (!email || !message) {
      return res.status(400).json({ message: "email and message are required" });
    }

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { booking: true },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    if (quote.booking.clientEmail !== email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updated = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: "NEGOTIATING",
        clientResponse: "PORTAL_MESSAGE",
        clientMessage: message,
        responseTime: new Date(),
      },
    });

    res.json({
      message: "Message sent successfully",
      quote: updated,
    });
  } catch (e: any) {
    console.error("POST /quotes/:quoteId/message Error:", e);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// Public: GET /api/quotes/:quoteId/public - View quote details (public, no auth required)
router.get("/:quoteId/public", async (req, res) => {
  try {
    const quoteId = String(req.params.quoteId);

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        lineItems: true,
        booking: {
          select: { clientName: true, clientEmail: true, service: true },
        },
        createdBy: {
          select: { name: true, email: true, title: true },
        },
        adminCreatedBy: {
          select: { name: true, email: true },
        },
      },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    res.json(quote);
  } catch (e: any) {
    console.error("GET /quotes/:quoteId/public Error:", e);
    res.status(500).json({ message: "Failed to fetch quote" });
  }
});

// Public: POST /api/quotes/:quoteId/client-approve - Client approve/reject quote
router.post("/:quoteId/client-approve", async (req, res) => {
  try {
    const quoteId = String(req.params.quoteId);
    const { email, status, clientMessage, agreedAt } = req.body as {
      email: string;
      status: "APPROVED" | "REJECTED" | "NEGOTIATING";
      clientMessage?: string;
      agreedAt?: string;
    };

    if (!email || !status) {
      return res.status(400).json({ message: "email and status are required" });
    }

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { booking: true },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    if (quote.booking.clientEmail !== email) {
      return res.status(401).json({ message: "Unauthorized - email mismatch" });
    }

    // Update quote with client response
    const updated = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: status === "APPROVED" ? "APPROVED" : status === "REJECTED" ? "REJECTED" : "NEGOTIATING",
        clientResponse: status === "APPROVED" ? "PORTAL_APPROVAL" : status === "REJECTED" ? "PORTAL_REJECTION" : "PORTAL_MESSAGE",
        clientMessage: clientMessage || null,
        responseTime: new Date(),
        agreedAt: status === "APPROVED" && agreedAt ? new Date(agreedAt) : new Date(),
      },
      include: {
        lineItems: true,
        booking: true,
        createdBy: true,
        adminCreatedBy: true,
      },
    });

    // Send confirmation email to client
    try {
      const resendFromEmail = process.env.RESEND_FROM_EMAIL || "noreply@fecasc.com";
      
      const statusText = status === "APPROVED" ? "approved" : status === "REJECTED" ? "rejected" : "responded to";
      const html = `
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h2>Quote ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}</h2>
            <p>Hi ${quote.booking.clientName},</p>
            <p>We have received your response to the quote. A member of our team will be in touch shortly.</p>
            ${clientMessage ? `<p><strong>Your message:</strong><br>${clientMessage}</p>` : ""}
            <p>Best regards,<br>Our Team</p>
          </body>
        </html>
      `;

      await sendEmail({
        from: resendFromEmail,
        to: quote.booking.clientEmail,
        subject: `Quote ${statusText.charAt(0).toUpperCase() + statusText.slice(1)} - Reference: ${quoteId.substring(0, 8)}`,
        html,
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    res.json({
      message: `Quote ${statusText} successfully`,
      quote: updated,
    });
  } catch (e: any) {
    console.error("POST /quotes/:quoteId/client-approve Error:", e);
    res.status(500).json({ message: "Failed to update quote status", error: e.message });
  }
});
router.post("/:quoteId/upload-signed-pdf", async (req, res) => {
  try {
    const quoteId = String(req.params.quoteId);
    const { email, pdfUrl } = req.body as { email: string; pdfUrl: string };

    if (!email || !pdfUrl) {
      return res.status(400).json({ message: "email and pdfUrl are required" });
    }

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { booking: true },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    if (quote.booking.clientEmail !== email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updated = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        signedPdfUrl: pdfUrl,
        agreedAt: new Date(),
        status: "APPROVED", // Automatically approve when signed PDF is uploaded
        responseTime: new Date(),
        clientResponse: "PORTAL_APPROVAL",
      },
      include: {
        lineItems: true,
        booking: true,
      },
    });

    res.json({
      message: "Signed PDF uploaded successfully and quote approved",
      quote: updated,
    });
  } catch (e: any) {
    console.error("POST /quotes/:quoteId/upload-signed-pdf Error:", e);
    res.status(500).json({ message: "Failed to upload signed PDF" });
  }
});

// Admin: PATCH /api/quotes/:quoteId/verify - Admin verify signed PDF and lock agreement
router.patch("/:quoteId/verify", requireAdmin, async (req, res) => {
  try {
    const quoteId = String(req.params.quoteId);
    const verifiedById = (req as any).admin?.adminId;

    if (!verifiedById) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const quote = await prisma.quote.findUnique({ where: { id: quoteId } });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    if (!quote.signedPdfUrl) {
      return res.status(400).json({ message: "No signed PDF found to verify" });
    }

    const updated = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: "APPROVED",
        verifiedAt: new Date(),
        verifiedById,
        isLocked: true,
      },
      include: {
        lineItems: true,
        booking: true,
      },
    });

    res.json({
      message: "Quote agreement verified and locked",
      quote: updated,
    });
  } catch (e: any) {
    console.error("PATCH /quotes/:quoteId/verify Error:", e);
    res.status(500).json({ message: "Failed to verify quote" });
  }
});

// Public/Admin: GET /api/quotes/:quoteId/download - Download quote as HTML/PDF
router.get("/:quoteId/download", async (req, res) => {
  try {
    const quoteId = String(req.params.quoteId);
    const { email } = req.query as { email?: string };

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        lineItems: true,
        booking: {
          select: { clientName: true, clientEmail: true, service: true },
        },
        createdBy: {
          select: { name: true, email: true, title: true },
        },
        adminCreatedBy: {
          select: { name: true, email: true },
        },
      },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    // Verify email if provided
    if (email && quote.booking.clientEmail !== email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const totalAmount = quote.lineItems.reduce((sum, item) => sum + item.total, 0);
    const creatorName = quote.createdBy?.name || quote.adminCreatedBy?.name || "FECASC Team";
    const creatorEmail = quote.createdBy?.email || quote.adminCreatedBy?.email || "contact@fecasc.com";

    const lineItemsHtml = quote.lineItems
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.description}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">L$${item.unitPrice.toLocaleString()}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">L$${item.total.toLocaleString()}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Quote - ${quoteId.substring(0, 8)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
          .header { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 40px; border-radius: 8px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 32px; }
          .header p { margin: 8px 0 0 0; opacity: 0.9; }
          .quote-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f9f9f9; padding: 20px; border-radius: 4px; }
          .info-group { }
          .info-group label { display: block; font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
          .info-group p { margin: 0; color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          th { background: #f5f5f5; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #2a5298; }
          .total-row { background: #f5f5f5; font-weight: bold; font-size: 16px; }
          .total-row td { padding: 15px 12px; border-top: 2px solid #2a5298; }
          .total-amount { font-size: 20px; text-align: right; }
          .notes-section { background: #fffbf0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .contact-info { margin-top: 10px; }
          @media print {
            body { margin: 0; padding: 20px; }
            .container { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 Service Quote</h1>
            <p>Reference: ${quoteId.substring(0, 8).toUpperCase()}</p>
          </div>

          <div class="quote-info">
            <div class="info-group">
              <label>Quote For</label>
              <p>${quote.booking.clientName}</p>
            </div>
            <div class="info-group">
              <label>Service</label>
              <p>${quote.booking.service.title}</p>
            </div>
            <div class="info-group">
              <label>Quote From</label>
              <p>${creatorName}</p>
            </div>
            <div class="info-group">
              <label>Quote Date</label>
              <p>${new Date(quote.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lineItemsHtml}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3">TOTAL AMOUNT</td>
                <td class="total-amount">L$${totalAmount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          ${quote.notes ? `<div class="notes-section"><strong>Notes:</strong><p>${quote.notes}</p></div>` : ""}

          <div class="footer">
            <p><strong>Payment Terms:</strong> Please submit payment proof when ready to proceed.</p>
            <p><strong>Validity:</strong> This quote is valid for 30 days from the date above.</p>
            <div class="contact-info">
              <p><strong>Questions?</strong> Contact ${creatorName} at ${creatorEmail}</p>
              <p><strong>Company:</strong> FECASC | Email: contact@fecasc.com | Phone: +1 (555) 000-0000</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="quote-${quoteId.substring(0, 8)}.html"`);
    res.send(html);
  } catch (e: any) {
    console.error("GET /quotes/:quoteId/download Error:", e);
    res.status(500).json({ message: "Failed to download quote" });
  }
});

export default router;
