import { getAvailableSlots } from "./availability";
import { dateStrInZone } from "@/lib/date";

/** Scans forward up to `maxDays` local calendar days for the first available slot. */
export async function getNextAvailableSlot(params: {
  salonId: string;
  serviceId: string;
  barberId?: string;
  timezone: string;
  maxDays?: number;
}) {
  const maxDays = params.maxDays ?? 14;
  for (let offset = 0; offset < maxDays; offset++) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dateStr = dateStrInZone(d, params.timezone);
    const slots = await getAvailableSlots({
      salonId: params.salonId,
      serviceId: params.serviceId,
      barberId: params.barberId,
      dateStr,
    });
    if (slots.length > 0) return slots[0];
  }
  return null;
}
