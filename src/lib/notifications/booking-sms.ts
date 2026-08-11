import "server-only";
import { db } from "@/lib/db";
import { sendSms } from "./sms";

/**
 * SMS confirmation, gated behind the salon's plan (spec: SMS is a paid-tier
 * feature). No-ops for salons not on a plan with smsEnabled — this is the
 * plan-gating hook other SMS/WhatsApp features (reminders, etc.) should
 * reuse once real Twilio credentials exist.
 */
export async function sendBookingConfirmationSms(bookingId: string) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { salon: { include: { subscription: { include: { plan: true } } } }, barber: true },
  });
  if (!booking) return { sent: false, error: "Booking not found" };
  if (!booking.salon.subscription?.plan.smsEnabled) {
    return { sent: false, error: "Salon's plan does not include SMS" };
  }

  const when = new Intl.DateTimeFormat("en-AU", {
    timeZone: booking.salon.timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(booking.startAt);

  return sendSms({
    to: booking.guestPhone,
    body: `${booking.salon.name}: your ${booking.serviceNameSnapshot} with ${booking.barber.name} is confirmed for ${when}. Ref: ${booking.reference}`,
  });
}
