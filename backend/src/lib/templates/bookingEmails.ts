export function getClientConfirmationEmailTemplate(
  clientName: string,
  bookingRef: string,
  serviceTitle: string,
  preferredDate: string | null,
  preferredTime: string | null,
  clientEmail: string,
  clientPhone: string | null,
  companyEmail: string,
  companyPhone: string
): { html: string; text: string } {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0b3d2e, #11624a); color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">✓ Request Received</h1>
      </div>
      
      <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <p>Dear <strong>${clientName}</strong>,</p>
        
        <p>Thank you for choosing FECASC! We have received your service request and appreciate your interest in our environmental consulting services.</p>
        
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 12px 0;"><strong>Request Details:</strong></p>
          <p style="margin: 6px 0;"><strong>Reference Number:</strong> ${bookingRef}</p>
          <p style="margin: 6px 0;"><strong>Service:</strong> ${serviceTitle}</p>
          ${preferredDate ? `<p style="margin: 6px 0;"><strong>Preferred Date:</strong> ${preferredDate}</p>` : ""}
          ${preferredTime ? `<p style="margin: 6px 0;"><strong>Preferred Time:</strong> ${preferredTime}</p>` : ""}
          <p style="margin: 6px 0;"><strong>Contact Email:</strong> ${clientEmail}</p>
          ${clientPhone ? `<p style="margin: 6px 0;"><strong>Contact Phone:</strong> ${clientPhone}</p>` : ""}
        </div>
        
        <p>Our team will review your request and contact you shortly with next steps. Typically, we respond within 24-48 hours during business days.</p>
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            <strong>Contact Information:</strong><br>
            📞 ${companyPhone}<br>
            📧 ${companyEmail}<br>
            🌐 www.fecasc.com
          </p>
        </div>
        
        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
          We look forward to working with you.<br><br>
          Best regards,<br>
          FECASC Team<br>
          <strong>Green Thinking, Brighter Future</strong>
        </p>
      </div>
    </div>
  `;

  const text = `Dear ${clientName},

Thank you for choosing FECASC! We have received your service request and appreciate your interest in our environmental consulting services.

REQUEST DETAILS:
Reference Number: ${bookingRef}
Service: ${serviceTitle}
${preferredDate ? `Preferred Date: ${preferredDate}` : ""}
${preferredTime ? `Preferred Time: ${preferredTime}` : ""}
Contact Email: ${clientEmail}
${clientPhone ? `Contact Phone: ${clientPhone}` : ""}

Our team will review your request and contact you shortly with next steps. Typically, we respond within 24-48 hours during business days.

CONTACT INFORMATION:
📞 ${companyPhone}
📧 ${companyEmail}
🌐 www.fecasc.com

We look forward to working with you.

Best regards,
FECASC Team
Green Thinking, Brighter Future
  `;

  return { html, text };
}

export function getAdminNotificationTemplate(
  bookingRef: string,
  serviceTitle: string,
  clientName: string,
  clientEmail: string,
  clientPhone: string | null,
  clientMessage: string | null,
  assignedConsultant: { name: string; title: string } | null,
  createdAt: Date
): { html: string; text: string } {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0b3d2e, #11624a); color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🔔 New Booking</h1>
      </div>
      
      <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <p><strong>New booking received</strong></p>
        
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 12px 0;"><strong>Booking Details:</strong></p>
          <p style="margin: 6px 0;"><strong>Booking Ref:</strong> ${bookingRef}</p>
          <p style="margin: 6px 0;"><strong>Service:</strong> ${serviceTitle}</p>
          <p style="margin: 6px 0;"><strong>Client Name:</strong> ${clientName}</p>
          <p style="margin: 6px 0;"><strong>Email:</strong> ${clientEmail}</p>
          <p style="margin: 6px 0;"><strong>Phone:</strong> ${clientPhone || "-"}</p>
          <p style="margin: 6px 0;"><strong>Date:</strong> ${createdAt.toLocaleString()}</p>
        </div>
        
        ${clientMessage ? `<div style="background: #fff3cd; padding: 12px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #ffc107;">
          <strong>Client Message:</strong><br>
          ${clientMessage}
        </div>` : ""}
        
        <div style="margin-top: 20px; padding: 16px; background: #e7f3ff; border-left: 4px solid #2196F3; border-radius: 4px;">
          ${assignedConsultant ? `
            <p style="margin: 0;"><strong>✓ Assigned to:</strong> ${assignedConsultant.name} (${assignedConsultant.title})</p>
          ` : `
            <p style="margin: 0; color: #d32f2f;"><strong>⚠ Status:</strong> Awaiting assignment</p>
          `}
        </div>
        
        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
          Log in to the admin panel to manage this booking.
        </p>
      </div>
    </div>
  `;

  const text = `New booking received

BOOKING DETAILS:
Booking Ref: ${bookingRef}
Service: ${serviceTitle}
Client Name: ${clientName}
Email: ${clientEmail}
Phone: ${clientPhone || "-"}
Date: ${createdAt.toLocaleString()}

${clientMessage ? `CLIENT MESSAGE:\n${clientMessage}\n\n` : ""}

${assignedConsultant ? `ASSIGNED TO: ${assignedConsultant.name} (${assignedConsultant.title})` : "STATUS: Awaiting assignment"}

Log in to the admin panel to manage this booking.
  `;

  return { html, text };
}

export function getConsultantNotificationTemplate(
  bookingRef: string,
  serviceTitle: string,
  clientName: string,
  clientEmail: string,
  clientPhone: string | null,
  clientMessage: string | null
): { html: string; text: string } {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0b3d2e, #11624a); color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">👤 New Client Inquiry</h1>
      </div>
      
      <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <p>You have been assigned a new client inquiry!</p>
        
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 12px 0;"><strong>Inquiry Details:</strong></p>
          <p style="margin: 6px 0;"><strong>Booking Ref:</strong> ${bookingRef}</p>
          <p style="margin: 6px 0;"><strong>Service:</strong> ${serviceTitle}</p>
          <p style="margin: 6px 0;"><strong>Client Name:</strong> ${clientName}</p>
          <p style="margin: 6px 0;"><strong>Email:</strong> ${clientEmail}</p>
          <p style="margin: 6px 0;"><strong>Phone:</strong> ${clientPhone || "-"}</p>
        </div>
        
        ${clientMessage ? `<div style="background: #e8f5e9; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <p style="margin: 0 0 12px 0;"><strong>Client Message:</strong></p>
          <p style="margin: 0; white-space: pre-wrap;">${clientMessage}</p>
        </div>` : ""}
        
        <div style="margin: 24px 0; padding: 16px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #1976d2;">
          <p style="margin: 0;"><strong>⏰ Action Required:</strong></p>
          <p style="margin: 8px 0 0 0; font-size: 14px;">Please reach out to the client at your earliest convenience. Update the booking status in your consultant dashboard when you have contacted them.</p>
        </div>
        
        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
          Thank you for your attention to this inquiry!
        </p>
      </div>
    </div>
  `;

  const text = `You have been assigned a new client inquiry!

INQUIRY DETAILS:
Booking Ref: ${bookingRef}
Service: ${serviceTitle}
Client Name: ${clientName}
Email: ${clientEmail}
Phone: ${clientPhone || "-"}

${clientMessage ? `CLIENT MESSAGE:\n${clientMessage}\n\n` : ""}

ACTION REQUIRED:
Please reach out to the client at your earliest convenience. Update the booking status in your consultant dashboard when you have contacted them.

Thank you for your attention to this inquiry!
  `;

  return { html, text };
}
