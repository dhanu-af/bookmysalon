import "server-only";
import { Resend } from "resend";

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "BookMySalon <no-reply@bookmysalon.test>";

/**
 * Sends via Resend when RESEND_API_KEY is configured; otherwise logs to the
 * server console. Lets the notification pipeline (and its Notification-row
 * bookkeeping) be built and tested end-to-end before a real API key exists —
 * swap in the key later and emails start actually sending with no code change.
 */
export async function sendEmail(params: { to: string; subject: string; html: string }): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email:dev-mode] To: ${params.to} | Subject: ${params.subject}\n${params.html}`);
    return { sent: false, error: "RESEND_API_KEY not configured (logged instead)" };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({ from: FROM_ADDRESS, to: params.to, subject: params.subject, html: params.html });
    if (result.error) return { sent: false, error: result.error.message };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "Unknown email error" };
  }
}
