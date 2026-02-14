export function getInvoiceEmailTemplate(
  clientName: string,
  invoiceNumber: string,
  invoiceAmount: number,
  dueDate: Date,
  bankName: string,
  accountNumber: string,
  accountName: string,
  consultantName: string,
  consultantEmail: string,
  lineItems?: Array<{ description: string; quantity: number; unitPrice: number; total: number }>
) {
  const lineItemsHtml = lineItems
    ? lineItems
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
        .join("")
    : "";

  const dueDate_formatted = new Date(dueDate).toLocaleDateString();

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
        .invoice-meta { background: #f0f7ff; padding: 15px; border-left: 4px solid #2a5298; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .invoice-meta-item p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        table th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #2a5298; font-weight: 600; }
        .total-row { background: #f5f5f5; font-weight: bold; font-size: 16px; }
        .total-row td { padding: 15px 12px; }
        .bank-details { background: #fff8e1; border: 2px solid #ff9800; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .bank-details h4 { color: #ff9800; margin-top: 0; }
        .bank-details p { margin: 8px 0; font-size: 14px; }
        .alert { background: #e3f2fd; border: 1px solid #90caf9; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .alert strong { display: block; color: #1565c0; margin-bottom: 8px; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        .contact-info { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>INVOICE</h1>
          <p style="margin-top: 10px; font-size: 14px;">Payment Request</p>
        </div>
        
        <div class="content">
          <p>Dear ${clientName},</p>
          
          <p>Thank you for your approval of our quote. Below is the invoice for the professional services we'll be providing.</p>
          
          <div class="invoice-meta">
            <div class="invoice-meta-item">
              <p><strong>Invoice No:</strong> ${invoiceNumber}</p>
              <p><strong>Date Issued:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="invoice-meta-item">
              <p><strong>Due Date:</strong> ${dueDate_formatted}</p>
              <p><strong>Amount Due:</strong> <span style="color: #d32f2f; font-weight: bold;">₦${invoiceAmount.toLocaleString()}</span></p>
            </div>
          </div>

          ${
            lineItemsHtml
              ? `
          <h3 style="color: #2a5298; margin-top: 25px;">Services Breakdown</h3>
          <table>
            <thead>
              <tr>
                <th>Service/Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lineItemsHtml}
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">TOTAL:</td>
                <td style="text-align: right;">₦${invoiceAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          `
              : `
          <h3 style="color: #2a5298;">Invoice Details</h3>
          <p style="font-size: 18px; color: #d32f2f; font-weight: bold;">Total Amount Due: ₦${invoiceAmount.toLocaleString()}</p>
          `
          }

          <div class="bank-details">
            <h4>💳 Bank Transfer Details</h4>
            <p><strong>Bank Name:</strong> ${bankName}</p>
            <p><strong>Account Name:</strong> ${accountName}</p>
            <p><strong>Account Number:</strong> <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px;">${accountNumber}</code></p>
          </div>

          <div class="alert">
            <strong>📋 Please Note:</strong>
            <p>Once you complete the bank transfer, please upload the payment receipt in the secure portal link. We'll verify it and confirm payment receipt within 1-2 business days.</p>
          </div>

          <p style="color: #666; font-size: 13px;">
            <strong>Payment Terms:</strong> Payment is due by ${dueDate_formatted}. Please include invoice number ${invoiceNumber} as payment reference in your bank transfer to help us match your payment quickly.
          </p>

          <div class="contact-info">
            <h4 style="color: #2a5298;">Questions About This Invoice?</h4>
            <p>Please reach out to:</p>
            <p>
              <strong>${consultantName}</strong><br>
              Email: <a href="mailto:${consultantEmail}" style="color: #2a5298; text-decoration: none;">${consultantEmail}</a>
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>FECASC Platform</strong></p>
          <p>Technology & Business Consulting Services</p>
          <p style="margin-top: 10px; color: #999;">This is an automated message. Please save this for your records.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
INVOICE
Payment Request

Dear ${clientName},

Thank you for your approval of our quote. Below is the invoice for the professional services we'll be providing.

Invoice No: ${invoiceNumber}
Date Issued: ${new Date().toLocaleDateString()}
Due Date: ${dueDate_formatted}
Amount Due: ₦${invoiceAmount.toLocaleString()}

${
  lineItems
    ? `
SERVICES BREAKDOWN

${lineItems.map((item) => `${item.description}: ${item.quantity} × ₦${item.unitPrice.toLocaleString()} = ₦${item.total.toLocaleString()}`).join("\n")}

TOTAL: ₦${invoiceAmount.toLocaleString()}
`
    : ""
}

BANK TRANSFER DETAILS
Bank Name: ${bankName}
Account Name: ${accountName}
Account Number: ${accountNumber}

PLEASE NOTE:
Once you complete the bank transfer, please upload the payment receipt in the secure portal. We'll verify it and confirm payment receipt within 1-2 business days.

PAYMENT TERMS:
Payment is due by ${dueDate_formatted}. Please include invoice number ${invoiceNumber} as payment reference in your bank transfer to help us match your payment quickly.

QUESTIONS ABOUT THIS INVOICE?
Please reach out to:
${consultantName}
Email: ${consultantEmail}

---
FECASC Platform
Technology & Business Consulting Services
  `;

  return { html, text };
}

export function getPaymentConfirmationTemplate(
  clientName: string,
  invoiceNumber: string,
  invoiceAmount: number,
  transactionDate: Date
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
        .header { background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; }
        .success-box { background: #e8f5e9; border: 2px solid #4caf50; padding: 20px; text-align: center; border-radius: 4px; margin: 20px 0; }
        .success-box h3 { color: #2e7d32; margin-top: 0; }
        .details { background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Payment Confirmed</h1>
        </div>
        
        <div class="content">
          <p>Dear ${clientName},</p>
          
          <div class="success-box">
            <h3>Thank you for your payment!</h3>
            <p>We've received and verified your payment. Your invoice is now marked as paid.</p>
          </div>

          <h3 style="color: #2e7d32;">Payment Details</h3>
          <div class="details">
            <div class="detail-row">
              <span><strong>Invoice Number:</strong></span>
              <span>${invoiceNumber}</span>
            </div>
            <div class="detail-row">
              <span><strong>Amount Paid:</strong></span>
              <span style="color: #2e7d32; font-weight: bold;">₦${invoiceAmount.toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span><strong>Transaction Date:</strong></span>
              <span>${new Date(transactionDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span><strong>Status:</strong></span>
              <span style="color: #2e7d32; font-weight: bold;">PAID ✓</span>
            </div>
          </div>

          <p>Our team will now proceed with the project. You'll receive updates on progress and next steps shortly.</p>

          <p style="color: #666; font-size: 13px; margin-top: 30px;">
            Thank you for working with FECASC. We look forward to delivering excellent results for your project.
          </p>
        </div>
        
        <div class="footer">
          <p><strong>FECASC Platform</strong></p>
          <p>Technology & Business Consulting Services</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
PAYMENT CONFIRMED

Dear ${clientName},

Thank you for your payment! We've received and verified your payment. Your invoice is now marked as paid.

PAYMENT DETAILS
Invoice Number: ${invoiceNumber}
Amount Paid: ₦${invoiceAmount.toLocaleString()}
Transaction Date: ${new Date(transactionDate).toLocaleDateString()}
Status: PAID ✓

Our team will now proceed with the project. You'll receive updates on progress and next steps shortly.

Thank you for working with FECASC. We look forward to delivering excellent results for your project.

---
FECASC Platform
Technology & Business Consulting Services
  `;

  return { html, text };
}
