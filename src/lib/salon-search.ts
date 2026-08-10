import { db } from "@/lib/db";
import { haversineKm } from "@/lib/geo/distance";
import { getAvailableSlots } from "@/lib/booking/availability";
import { minutesToHHmm } from "@/lib/booking/slots";
import { dateStrInZone } from "@/lib/date";

export interface SalonSearchResult {
  id: string;
  slug: string;
  name: string;
  suburb: string;
  state: string;
  avgRating: number;
  reviewCount: number;
  fromPriceCents: number | null;
  distanceKm: number | null;
  todaySlots: string[]; // first few "HH:mm" slots today, across all barbers
}

export interface SalonSearchParams {
  /** Matches salon name, suburb, or service name (case-insensitive substring). */
  query?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sort?: "distance" | "rating" | "price";
}

// Only APPROVED salons are ever visible to public search — this is the one
// place that filter must not be forgotten, so every public query goes
// through here rather than each page re-writing its own `where`.
export function publicSalonWhere() {
  return { approvalStatus: "APPROVED" as const };
}

export async function searchSalons(params: SalonSearchParams): Promise<SalonSearchResult[]> {
  const salons = await db.salon.findMany({
    where: {
      ...publicSalonWhere(),
      ...(params.query
        ? {
            OR: [
              { name: { contains: params.query, mode: "insensitive" } },
              { suburb: { contains: params.query, mode: "insensitive" } },
              { services: { some: { name: { contains: params.query, mode: "insensitive" }, active: true } } },
            ],
          }
        : {}),
    },
    include: {
      services: { where: { active: true }, orderBy: { priceCents: "asc" }, take: 1 },
    },
  });

  const results: SalonSearchResult[] = [];
  for (const salon of salons) {
    const distanceKm =
      params.lat != null && params.lng != null ? haversineKm(params.lat, params.lng, salon.lat, salon.lng) : null;

    if (params.radiusKm != null && distanceKm != null && distanceKm > params.radiusKm) continue;

    // "Available today" preview — cheapest active service, first barber found.
    // "Today" is evaluated in each salon's own timezone, not the server's.
    let todaySlots: string[] = [];
    const cheapestService = salon.services[0];
    if (cheapestService) {
      const todayInSalonZone = dateStrInZone(new Date(), salon.timezone);
      const slots = await getAvailableSlots({ salonId: salon.id, serviceId: cheapestService.id, dateStr: todayInSalonZone });
      todaySlots = [...new Set(slots.map((s) => minutesFromSlot(s.startAt, salon.timezone)))].slice(0, 3);
    }

    results.push({
      id: salon.id,
      slug: salon.slug,
      name: salon.name,
      suburb: salon.suburb,
      state: salon.state,
      avgRating: salon.avgRating,
      reviewCount: salon.reviewCount,
      fromPriceCents: cheapestService?.priceCents ?? null,
      distanceKm,
      todaySlots,
    });
  }

  const sort = params.sort ?? (params.lat != null ? "distance" : "rating");
  results.sort((a, b) => {
    if (sort === "distance") return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
    if (sort === "price") return (a.fromPriceCents ?? Infinity) - (b.fromPriceCents ?? Infinity);
    return b.avgRating - a.avgRating;
  });

  return results;
}

function minutesFromSlot(startAt: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(
    startAt
  );
  const hour = parts.find((p) => p.type === "hour")!.value;
  const minute = parts.find((p) => p.type === "minute")!.value;
  return minutesToHHmm(Number(hour) * 60 + Number(minute));
}
