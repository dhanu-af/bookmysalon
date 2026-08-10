import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendBookingReminderEmail } from "@/lib/notifications/booking-emails";

/**
 * Sends a reminder email for every booking starting in the next 24-48h that
 * hasn't already gotten one. Not on a schedule yet (no vercel.json cron entry) —
 * per the spec, reminders should be architected now and wired up to actually
 * fire later. Trigger manually with `curl -H "Authorization: Bearer $CRON_SECRET" .../api/cron/reminders`
 * once ready, or add a Vercel Cron entry pointing here.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const candidates = await db.booking.findMany({
    where: { status: { in: ["PENDING", "CONFIRMED"] }, startAt: { gte: in24h, lt: in48h }, guestEmail: { not: null } },
    select: { id: true },
  });

  // No Booking<->Notification relation in the schema (bookingId is a plain
  // field, not a FK) — check for an existing reminder per booking manually.
  const alreadyReminded = await db.notification.findMany({
    where: { type: "REMINDER", bookingId: { in: candidates.map((b) => b.id) } },
    select: { bookingId: true },
  });
  const remindedIds = new Set(alreadyReminded.map((n) => n.bookingId));
  const bookings = candidates.filter((b) => !remindedIds.has(b.id));

  const results = await Promise.allSettled(bookings.map((b) => sendBookingReminderEmail(b.id)));
  const sent = results.filter((r) => r.status === "fulfilled" && r.value.sent).length;

  return NextResponse.json({ attempted: bookings.length, sent });
}
