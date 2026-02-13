import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  try {
    const result = await resend.emails.send({
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    if (result.error) {
      throw new Error(`Resend error: ${result.error.message}`);
    }

    console.log(`Email sent successfully to ${payload.to}:`, result.data?.id);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
