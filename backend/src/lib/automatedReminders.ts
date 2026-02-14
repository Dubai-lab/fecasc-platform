import { prisma } from "./prisma.js";
import { sendEmail } from "./mailer.js";

/**
 * Send follow-up reminders for quotes awaiting client response
 * Sends reminder if quote was sent more than 3 days ago and not yet approved
 */
export async function sendQuoteFollowUpReminders() {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const pendingQuotes = await prisma.quote.findMany({
      where: {
        status: "SENT",
        deliveryTime: {
          lt: threeDaysAgo,
        },
        // Exclude quotes that have already sent a reminder (optional: add a reminderSentAt field to schema if needed)
      },
      include: {
        booking: { include: { service: true } },
        createdBy: { select: { name: true, email: true } },
        adminCreatedBy: { select: { name: true, email: true } },
      },
    });

    const resendFromEmail = process.env.RESEND_FROM_EMAIL || "noreply@fecasc.com";

    for (const quote of pendingQuotes) {
      const creatorName = quote.createdBy?.name || quote.adminCreatedBy?.name || "Our Team";
      const approvalLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/quote-approval/${quote.id}`;

      const html = `
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h2 style="color: #f59e0b;">📬 Quote Review Reminder</h2>
            <p>Hi ${quote.booking.clientName},</p>
            <p>We sent you a quote for <strong>${quote.booking.service?.title}</strong> a few days ago, and we wanted to check in.</p>
            <p>If you have any questions or need clarification, please don't hesitate to reach out. You can also review and approve the quote using the link below:</p>
            <p>
              <a href="${approvalLink}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 600;">
                Review Quote Now
              </a>
            </p>
            <p>We're here to help!<br>Best regards,<br>${creatorName}</p>
          </body>
        </html>
      `;

      try {
        await sendEmail({
          from: resendFromEmail,
          to: quote.booking.clientEmail,
          subject: `Reminder: Your Quote is Ready for Review - ${quote.id.substring(0, 8).toUpperCase()}`,
          html,
        });

        console.log(`✓ Follow-up reminder sent for quote ${quote.id} to ${quote.booking.clientEmail}`);
      } catch (emailError) {
        console.error(`✗ Failed to send follow-up reminder for quote ${quote.id}:`, emailError);
      }
    }

    return pendingQuotes.length;
  } catch (error) {
    console.error("Error sending quote follow-up reminders:", error);
    throw error;
  }
}

/**
 * Send overdue invoice reminders
 * Sends reminder if invoice is SENT and due date has passed
 */
export async function sendOverdueInvoiceReminders() {
  try {
    const now = new Date();

    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: "SENT",
        dueDate: {
          lt: now,
        },
      },
      include: {
        booking: true,
        quote: { include: { createdBy: true, adminCreatedBy: true } },
      },
    });

    const resendFromEmail = process.env.RESEND_FROM_EMAIL || "noreply@fecasc.com";

    for (const invoice of overdueInvoices) {
      const creatorName = invoice.quote.createdBy?.name || invoice.quote.adminCreatedBy?.name || "Our Team";
      const daysOverdue = Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));

      const html = `
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h2 style="color: #ef5350;">🔴 Invoice Overdue - Immediate Action Required</h2>
            <p>Hi ${invoice.booking.clientName},</p>
            <p>Your invoice <strong>${invoice.id.substring(0, 8).toUpperCase()}</strong> was due <strong>${daysOverdue} day${daysOverdue > 1 ? "s" : ""} ago</strong>.</p>
            <p><strong>Amount Due:</strong> L$${invoice.totalAmount.toLocaleString()}</p>
            <p>Please arrange payment at your earliest convenience. If you have any questions or need to discuss payment terms, please contact us immediately.</p>
            <p><strong>Bank Details:</strong><br>
              Bank: ${invoice.bankAccount}<br>
              Account Name: ${invoice.accountName}<br>
              Account Number: ${invoice.accountNumber}
            </p>
            <p>Best regards,<br>${creatorName}</p>
          </body>
        </html>
      `;

      try {
        await sendEmail({
          from: resendFromEmail,
          to: invoice.booking.clientEmail,
          subject: `URGENT: Invoice Overdue - ${invoice.id.substring(0, 8).toUpperCase()}`,
          html,
        });

        console.log(`✓ Overdue invoice reminder sent for invoice ${invoice.id} to ${invoice.booking.clientEmail}`);
      } catch (emailError) {
        console.error(`✗ Failed to send overdue reminder for invoice ${invoice.id}:`, emailError);
      }
    }

    return overdueInvoices.length;
  } catch (error) {
    console.error("Error sending overdue invoice reminders:", error);
    throw error;
  }
}

/**
 * Run all automated reminders
 * Call this periodically (e.g., via a scheduled job)
 */
export async function runAutomatedReminders() {
  console.log("[Automated Reminders] Starting reminder job...");

  const quoteReminders = await sendQuoteFollowUpReminders();
  const invoiceReminders = await sendOverdueInvoiceReminders();

  console.log(`[Automated Reminders] Sent ${quoteReminders} quote reminders and ${invoiceReminders} invoice reminders`);
}
