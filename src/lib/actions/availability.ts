"use server";

import { getAvailableSlots } from "@/lib/booking/availability";

export async function getAvailableSlotsAction(params: {
  salonId: string;
  serviceId: string;
  dateStr: string;
  barberId?: string;
}) {
  const slots = await getAvailableSlots(params);
  // Dates don't survive the server-action serialization boundary as Date
  // instances — send ISO strings, the client re-hydrates them.
  return slots.map((s) => ({ ...s, startAt: s.startAt.toISOString(), endAt: s.endAt.toISOString() }));
}
