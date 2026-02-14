import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireStaff, requireAdminOrStaff } from "../middleware/auth.middleware.js";
import { sendEmail } from "../lib/mailer.js";

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
      include: {
        lineItems: true,
        createdBy: {
          select: { id: true, name: true, email: true, title: true },
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
      },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    // Update quote status and delivery method
    const updated = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: "SENT",
        deliveryMethod,
        deliveryTime: new Date(),
      },
      include: {
        lineItems: true,
        booking: true,
      },
    });

    // TODO: Send email/message based on delivery method
    // For now, just log it
    console.log(
      `Quote ${quoteId} sent via ${deliveryMethod} to ${quote.booking?.clientEmail}`
    );

    res.json({
      message: `Quote sent via ${deliveryMethod}`,
      quote: updated,
    });
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

// Public: POST /api/quotes/:quoteId/upload-signed-pdf - Client upload signed PDF
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
      },
    });

    res.json({
      message: "Signed PDF uploaded successfully",
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
    const verifiedById = (req as any).user?.id;

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

export default router;
