import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireStaff, requireAdminOrStaff } from "../middleware/auth.middleware.js";
import { sendEmail } from "../lib/mailer.js";

const router = Router();

// Admin/Consultant: POST /api/invoices - Generate invoice from approved quote
router.post("/", requireAdminOrStaff, async (req, res) => {
  try {
    const { quoteId, dueDate, bankDetails } = req.body as {
      quoteId: string;
      dueDate?: string;
      bankDetails?: { bank: string; accountNumber: string; accountName: string };
    };

    if (!quoteId) {
      return res.status(400).json({ message: "quoteId is required" });
    }

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        booking: true,
        lineItems: true,
      },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    if (quote.status !== "APPROVED") {
      return res.status(409).json({ message: "Can only create invoice from approved quotes" });
    }

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { quoteId },
    });

    if (existingInvoice) {
      return res.status(409).json({ message: "Invoice already exists for this quote" });
    }

    // Determine due date (default 14 days from now)
    const invoiceDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        quoteId,
        bookingId: quote.bookingId,
        totalAmount: quote.totalAmount,
        dueDate: invoiceDueDate,
        status: "GENERATED",
        bankAccount: bankDetails?.bank || "GTBANK",
        accountNumber: bankDetails?.accountNumber || "",
        accountName: bankDetails?.accountName || "FECASC",
      },
      include: {
        quote: {
          include: { lineItems: true },
        },
        booking: true,
        paymentProofs: true,
      },
    });

    res.status(201).json(invoice);
  } catch (e: any) {
    console.error("POST /invoices Error:", e);
    res.status(500).json({ message: "Failed to create invoice", error: e.message });
  }
});

// Admin/Consultant: GET /api/invoices - Get all invoices (with optional filters)
router.get("/", requireAdminOrStaff, async (req: any, res) => {
  try {
    const { status, bookingId } = req.query;
    const isAdmin = !!req.admin;
    const staffId = req.staff?.staffId;

    const where: any = {};
    if (status) where.status = status;
    if (bookingId) where.bookingId = bookingId;

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
        where.quote = { booking: { id: { in: bookingIds } } };
      } else {
        // Consultant has no assigned services, return empty array
        return res.json([]);
      }
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        quote: {
          include: { lineItems: true },
        },
        booking: true,
        paymentProofs: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(invoices);
  } catch (e: any) {
    console.error("GET /invoices Error:", e);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
});

// Admin/Consultant: GET /api/invoices/:invoiceId - Get specific invoice
router.get("/:invoiceId", async (req, res) => {
  try {
    const invoiceId = String(req.params.invoiceId);

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        quote: {
          include: { lineItems: true },
        },
        booking: true,
        paymentProofs: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (e: any) {
    console.error("GET /invoices/:invoiceId Error:", e);
    res.status(500).json({ message: "Failed to fetch invoice" });
  }
});

// Admin/Consultant: POST /api/invoices/:invoiceId/send - Send invoice to client
router.post("/:invoiceId/send", requireAdminOrStaff, async (req, res) => {
  try {
    const invoiceId = String(req.params.invoiceId);
    const { message } = req.body as { message?: string };

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        quote: {
          include: { booking: true, lineItems: true },
        },
        booking: true,
        paymentProofs: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status === "PAID") {
      return res.status(409).json({ message: "Cannot send paid invoice" });
    }

    // Update invoice status
    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
      include: {
        quote: {
          include: { lineItems: true },
        },
        booking: true,
        paymentProofs: true,
      },
    });

    // TODO: Send email to client with invoice details and bank transfer instructions
    console.log(
      `Invoice ${invoiceId} sent to ${invoice.booking.clientEmail}`,
      message
    );

    res.json({
      message: "Invoice sent successfully",
      invoice: updated,
    });
  } catch (e: any) {
    console.error("POST /invoices/:invoiceId/send Error:", e);
    res.status(500).json({ message: "Failed to send invoice" });
  }
});

// Admin: PATCH /api/invoices/:invoiceId - Update invoice details
router.patch("/:invoiceId", requireAdmin, async (req, res) => {
  try {
    const invoiceId = String(req.params.invoiceId);
    const { dueDate, bankName, accountNumber, accountName } = req.body;

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.status === "PAID") {
      return res.status(409).json({ message: "Cannot modify paid invoice" });
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(bankName && { bankAccount: bankName }),
        ...(accountNumber && { accountNumber }),
        ...(accountName && { accountName }),
      },
      include: {
        quote: {
          include: { lineItems: true },
        },
        booking: true,
        paymentProofs: true,
      },
    });

    res.json(updated);
  } catch (e: any) {
    console.error("PATCH /invoices/:invoiceId Error:", e);
    res.status(500).json({ message: "Failed to update invoice" });
  }
});

// Public: POST /api/invoices/:invoiceId/payment-proof - Client upload payment proof
router.post("/:invoiceId/payment-proof", async (req, res) => {
  try {
    const invoiceId = String(req.params.invoiceId);
    const { email, proofUrl } = req.body as {
      email: string;
      proofUrl: string;
    };

    if (!email || !proofUrl) {
      return res.status(400).json({ message: "email and proofUrl are required" });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { booking: true },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Verify email matches booking
    if (invoice.booking.clientEmail !== email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (invoice.status === "PAID") {
      return res.status(409).json({ message: "Invoice already marked as paid" });
    }

    // Create payment proof record
    const paymentProof = await prisma.paymentProof.create({
      data: {
        invoiceId,
        proofUrl,
        uploadedAt: new Date(),
      },
    });

    // Update invoice status to pending verification
    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "SENT",  // Keep as SENT until admin verifies payment
      },
      include: {
        quote: {
          include: { lineItems: true },
        },
        booking: true,
        paymentProofs: true,
      },
    });

    res.json({
      message: "Payment proof uploaded successfully. Awaiting admin verification.",
      invoice: updated,
      paymentProof,
    });
  } catch (e: any) {
    console.error("POST /invoices/:invoiceId/payment-proof Error:", e);
    res.status(500).json({ message: "Failed to upload payment proof" });
  }
});

// Admin: PATCH /api/invoices/:invoiceId/verify-payment - Admin verify payment
router.patch("/:invoiceId/verify-payment", requireAdmin, async (req, res) => {
  try {
    const invoiceId = String(req.params.invoiceId);
    const { verified, notes } = req.body as { verified: boolean; notes?: string };

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { paymentProofs: true },
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (!invoice.paymentProofs || invoice.paymentProofs.length === 0) {
      return res.status(400).json({ message: "No payment proof to verify" });
    }

    if (verified) {
      const updated = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
        include: {
          quote: {
            include: { lineItems: true },
          },
          booking: true,
          paymentProofs: true,
        },
      });

      // Update payment proof as verified
      await prisma.paymentProof.updateMany({
        where: { invoiceId },
        data: {
          verifiedAt: new Date(),
          verifiedById: (req as any).user?.id,
          verificationNotes: notes || null,
        },
      });

      res.json({
        message: "Payment verified and invoice marked as paid",
        invoice: updated,
      });
    } else {
      // Mark payment proof as rejected but keep invoice status
      await prisma.paymentProof.updateMany({
        where: { invoiceId },
        data: {
          verificationNotes: notes || "Payment proof rejected",
        },
      });

      res.json({
        message: "Payment verification rejected",
        invoice,
      });
    }
  } catch (e: any) {
    console.error("PATCH /invoices/:invoiceId/verify-payment Error:", e);
    res.status(500).json({ message: "Failed to verify payment" });
  }
});

// Admin/Consultant: GET /api/invoices/dashboard/summary - Get financial dashboard summary
router.get("/dashboard/summary", requireAdminOrStaff, async (req: any, res) => {
  try {
    // Check if user is admin or staff
    const isAdmin = !!req.admin;
    const staffId = req.staff?.staffId;

    let whereClause: any = {};

    if (!isAdmin && staffId) {
      // For staff/consultants, only show revenue from their assigned services
      const consultant = await prisma.teamMember.findUnique({
        where: { id: staffId },
        select: { assignedServices: true },
      });

      if (!consultant || !consultant.assignedServices || consultant.assignedServices.length === 0) {
        // Consultant has no assigned services
        return res.json({
          totalRevenue: 0,
          totalPaidCount: 0,
          pendingRevenue: 0,
          pendingCount: 0,
          overdueRevenue: 0,
          overdueCount: 0,
          invoiceStats: [],
          quoteStats: [],
        });
      }

      // Get all bookings with the consultant's assigned services
      const bookingsWithServices = await prisma.booking.findMany({
        where: {
          serviceId: {
            in: consultant.assignedServices,
          },
        },
        select: { id: true },
      });

      const bookingIds = bookingsWithServices.map((b) => b.id);

      // Filter invoices to only those related to these bookings
      whereClause = {
        quote: {
          booking: {
            id: {
              in: bookingIds,
            },
          },
        },
      };
    }

    // Get invoice statistics
    const stats = await prisma.invoice.groupBy({
      by: ["status"],
      where: whereClause,
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get total revenue (paid invoices)
    const paidInvoices = await prisma.invoice.aggregate({
      where: { ...whereClause, status: "PAID" },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    // Get pending revenue (sent but not paid)
    const pendingInvoices = await prisma.invoice.aggregate({
      where: {
        ...whereClause,
        status: {
          in: ["SENT"],
        },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    // Get overdue invoices (past due date and unpaid)
    const now = new Date();
    const overdueInvoices = await prisma.invoice.aggregate({
      where: {
        ...whereClause,
        dueDate: { lt: now },
        status: {
          in: ["GENERATED", "SENT"],
        },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    // Get quotes statistics
    const quoteStatsQuery: any = { by: ["status"] };
    if (!isAdmin && staffId) {
      quoteStatsQuery.where = {
        createdById: staffId,
      };
    }

    const quoteStats = await prisma.quote.groupBy(quoteStatsQuery);

    res.json({
      totalRevenue: paidInvoices._sum?.totalAmount || 0,
      totalPaidCount: paidInvoices._count || 0,
      pendingRevenue: pendingInvoices._sum?.totalAmount || 0,
      pendingCount: pendingInvoices._count || 0,
      overdueRevenue: overdueInvoices._sum?.totalAmount || 0,
      overdueCount: overdueInvoices._count || 0,
      invoiceStats: stats,
      quoteStats,
    });
  } catch (e: any) {
    console.error("GET /invoices/dashboard/summary Error:", e);
    res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
});

export default router;
