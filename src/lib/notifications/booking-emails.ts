import "server-only";
import { db } from "@/lib/db";
import { sendEmail } from "./email";
import { formatPriceCents } from "@/lib/format";

async function recordAndSend(params: {
  bookingId: string;
  userId?: string | null;
  type: "BOOKING_CONFIRMATION" | "REMINDER" | "CANCELLATION" | "RESCHEDULE";
  to: string;
  subject: string;
  html: string;
}) {
  const notification = await db.notification.create({
    data: { userId: params.userId ?? undefined, bookingId: params.bookingId, channel: "EMAIL", type: params.type, status: "PENDING" },
  });

  const result = await sendEmail({ to: params.to, subject: params.subject, html: params.html });

  await db.notification.update({
    where: { id: notification.id },
    data: { status: result.sent ? "SENT" : "FAILED", sentAt: result.sent ? new Date() : null, payload: result.error ? { error: result.error } : undefined },
  });

  return result;
}

function formatWhen(startAt: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(startAt);
}

/** Fired right after a booking is created — the one email actually wired up end-to-end for MVP. */
export async function sendBookingConfirmationEmail(bookingId: string) {
  const booking = await db.booking.findUnique({ where: { id: bookingId }, include: { salon: true, barber: true } });
  if (!booking?.guestEmail) return { sent: false, error: "No email on file for this booking" };

  const when = formatWhen(booking.startAt, booking.salon.timezone);
  return recordAndSend({
    bookingId,
    userId: booking.customerId,
    type: "BOOKING_CONFIRMATION",
    to: booking.guestEmail,
    subject: `Booking confirmed at ${booking.salon.name}`,
    html: `<p>Hi ${booking.guestName},</p>
<p>Your <strong>${booking.serviceNameSnapshot}</strong> at <strong>${booking.salon.name}</strong> is confirmed.</p>
<p>${when} with ${booking.barber.name}<br/>${formatPriceCents(booking.priceCentsSnapshot)}</p>
<p>Booking reference: <strong>${booking.reference}</strong></p>`,
  });
}

/**
 * Reminder emails (e.g. "your appointment is tomorrow at 5:30 PM") are
 * architected end-to-end — this function, the Notification bookkeeping, and
 * the /api/cron/reminders route that calls it for tomorrow's bookings — but
 * isn't scheduled to actually fire yet (no Vercel Cron entry wired up),
 * matching the spec's "architect for later, don't fully implement" note for
 * this feature. Call it manually, or wire up a cron schedule, to activate it.
 */
export async function sendBookingReminderEmail(bookingId: string) {
  const booking = await db.booking.findUnique({ where: { id: bookingId }, include: { salon: true, barber: true } });
  if (!booking?.guestEmail) return { sent: false, error: "No email on file for this booking" };

  const when = formatWhen(booking.startAt, booking.salon.timezone);
  return recordAndSend({
    bookingId,
    userId: booking.customerId,
    type: "REMINDER",
    to: booking.guestEmail,
    subject: `Reminder: your appointment at ${booking.salon.name} is coming up`,
    html: `<p>Hi ${booking.guestName},</p>
<p>Reminder: your <strong>${booking.serviceNameSnapshot}</strong> at <strong>${booking.salon.name}</strong> is ${when} with ${booking.barber.name}.</p>
<p>Booking reference: <strong>${booking.reference}</strong></p>`,
  });
}
