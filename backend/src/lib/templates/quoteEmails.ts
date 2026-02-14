export function getQuoteEmailTemplate(
  clientName: string,
  quoteNumber: string,
  lineItems: Array<{ description: string; quantity: number; unitPrice: number; total: number }>,
  totalAmount: number,
  consultantName: string,
  consultantEmail: string,
  consultantPhone?: string,
  notes?: string,
  secureLink?: string
) {
  const lineItemsHtml = lineItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.description}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₦${item.unitPrice.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₦${item.total.toLocaleString()}</td>
    </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .header { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; }
        .quote-meta { background: #f0f7ff; padding: 15px; border-left: 4px solid #2a5298; margin-bottom: 20px; }
        .quote-meta p { margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        table th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #2a5298; font-weight: 600; }
        .total-row { background: #f5f5f5; font-weight: bold; font-size: 16px; }
        .total-row td { padding: 15px 12px; }
        .notes { background: #fffbf0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .cta-button { display: inline-block; background: #2a5298; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 600; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        .contact-info { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>QUOTE #${quoteNumber}</h1>
          <p style="margin-top: 10px; font-size: 14px;">Professional Services Proposal</p>
        </div>
        
        <div class="content">
          <p>Dear ${clientName},</p>
          
          <p>Thank you for your interest in FECASC's services. We're pleased to present this quote for the project requirements you've discussed with us.</p>
          
          <div class="quote-meta">
            <p><strong>Quote Number:</strong> ${quoteNumber}</p>
            <p><strong>Date Issued:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Prepared By:</strong> ${consultantName}</p>
          </div>

          <h3 style="color: #2a5298; margin-top: 25px;">Proposed Services & Charges</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lineItemsHtml}
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">TOTAL AMOUNT:</td>
                <td style="text-align: right;">₦${totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          ${
            notes
              ? `
          <div class="notes">
            <strong>Additional Notes:</strong>
            <p>${notes}</p>
          </div>
          `
              : ""
          }

          ${
            secureLink
              ? `
          <p style="text-align: center;">
            <a href="${secureLink}" class="cta-button">Review & Respond to Quote</a>
          </p>
          <p style="text-align: center; font-size: 12px; color: #666;">You can approve, reject, or send a counter-offer through the secure link above.</p>
          `
              : ""
          }

          <div class="contact-info">
            <h4 style="color: #2a5298;">Have Questions?</h4>
            <p>Feel free to reach out:</p>
            <p>
              <strong>${consultantName}</strong><br>
              Email: <a href="mailto:${consultantEmail}" style="color: #2a5298; text-decoration: none;">${consultantEmail}</a><br>
              ${consultantPhone ? `Phone: ${consultantPhone}` : ""}
            </p>
          </div>

          <p style="color: #666; font-size: 13px; margin-top: 30px;">
            This quote is valid for 30 days from the date of issue. Terms and conditions apply as per our standard agreement.
          </p>
        </div>
        
        <div class="footer">
          <p><strong>FECASC Platform</strong></p>
          <p>Technology & Business Consulting Services</p>
          <p style="margin-top: 10px; color: #999;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
QUOTE #${quoteNumber}
Professional Services Proposal

Dear ${clientName},

Thank you for your interest in FECASC's services. We're pleased to present this quote for the project requirements you've discussed with us.

Quote Number: ${quoteNumber}
Date Issued: ${new Date().toLocaleDateString()}
Prepared By: ${consultantName}

PROPOSED SERVICES & CHARGES

${lineItems.map((item) => `${item.description}: ${item.quantity} × ₦${item.unitPrice.toLocaleString()} = ₦${item.total.toLocaleString()}`).join("\n")}

TOTAL AMOUNT: ₦${totalAmount.toLocaleString()}

${notes ? `Additional Notes:\n${notes}\n` : ""}

${secureLink ? `Review this quote: ${secureLink}\n\nYou can approve, reject, or send a counter-offer through the link above.\n` : ""}

QUESTIONS?
Feel free to reach out:
${consultantName}
Email: ${consultantEmail}
${consultantPhone ? `Phone: ${consultantPhone}` : ""}

This quote is valid for 30 days from the date of issue.

---
FECASC Platform
Technology & Business Consulting Services
  `;

  return { html, text };
}

export function getQuoteStatusUpdateTemplate(
  clientName: string,
  quoteNumber: string,
  action: "APPROVED" | "REJECTED" | "AWAITING_PAYMENT",
  consultantName: string,
  nextSteps?: string
) {
  let statusMessage = "";
  let statusColor = "#2a5298";

  switch (action) {
    case "APPROVED":
      statusMessage =
        "Thank you! Your quote has been approved. Our team will proceed with preparing the agreement and invoice.";
      statusColor = "#4caf50";
      break;
    case "REJECTED":
      statusMessage = "We understand you've declined this proposal. Please feel free to reach out if you'd like to discuss alternatives.";
      statusColor = "#f44336";
      break;
    case "AWAITING_PAYMENT":
      statusMessage = "We've received your signed agreement. An invoice has been generated and payment details are below.";
      statusColor = "#ff9800";
      break;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .header { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; }
        .status-box { background: ${statusColor}20; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">Quote #${quoteNumber} - Status Update</h2>
        </div>
        
        <div class="content">
          <p>Hi ${clientName},</p>
          
          <div class="status-box">
            <p style="margin: 0; color: ${statusColor}; font-weight: bold; font-size: 16px;">${statusMessage}</p>
          </div>

          ${nextSteps ? `<p>${nextSteps}</p>` : ""}

          <p>If you have any questions, please don't hesitate to contact ${consultantName}.</p>
        </div>
        
        <div class="footer">
          <p><strong>FECASC Platform</strong></p>
          <p>Technology & Business Consulting Services</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Quote #${quoteNumber} - Status Update

Hi ${clientName},

${statusMessage}

${nextSteps ? `${nextSteps}\n` : ""}

If you have any questions, please contact ${consultantName}.

---
FECASC Platform
Technology & Business Consulting Services
  `;

  return { html, text };
}
