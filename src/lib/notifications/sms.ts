import "server-only";

/**
 * Sends via Twilio's REST API (plain fetch, no SDK dependency needed) when
 * TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER are configured;
 * otherwise logs to the server console. Mirrors email.ts's dev-mode
 * fallback so the notification pipeline is fully wired and testable before
 * real credentials exist — add the three env vars later and it starts
 * actually sending, no code change needed.
 *
 * WhatsApp uses the same Twilio API, just with a "whatsapp:"-prefixed
 * from/to number (Twilio's WhatsApp Business API convention) — pass
 * channel: "whatsapp" once a Twilio WhatsApp sender is configured.
 */
export async function sendSms(params: {
  to: string;
  body: string;
  channel?: "sms" | "whatsapp";
}): Promise<{ sent: boolean; error?: string }> {
  const { accountSid, authToken, fromNumber } = getTwilioConfig();
  const channel = params.channel ?? "sms";

  if (!accountSid || !authToken || !fromNumber) {
    console.log(`[${channel}:dev-mode] To: ${params.to} | ${params.body}`);
    return { sent: false, error: `Twilio credentials not configured (logged instead)` };
  }

  const prefix = channel === "whatsapp" ? "whatsapp:" : "";
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: `${prefix}${params.to}`,
        From: `${prefix}${fromNumber}`,
        Body: params.body,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { sent: false, error: `Twilio error ${response.status}: ${text}` };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "Unknown SMS/WhatsApp error" };
  }
}

function getTwilioConfig() {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
  };
}
