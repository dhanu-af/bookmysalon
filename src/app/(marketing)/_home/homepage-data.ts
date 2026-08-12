import { db } from "@/lib/db";
import { searchSalons, type SalonSearchResult } from "@/lib/salon-search";
import { getAvailableSlots } from "@/lib/booking/availability";
import { dateStrInZone } from "@/lib/date";

export interface TopSalon extends SalonSearchResult {
  badge: "Top rated" | "Trending" | null;
}

/** Top-rated approved salons for the "Salons near you" section, with a simple derived badge. */
export async function getTopSalons(limit: number): Promise<TopSalon[]> {
  const results = await searchSalons({ sort: "rating" });
  const withReviews = results.filter((s) => s.reviewCount > 0);
  const topByReviews = [...withReviews].sort((a, b) => b.reviewCount - a.reviewCount)[0];

  return results.slice(0, limit).map((salon, i) => ({
    ...salon,
    badge: i === 0 ? "Top rated" : salon.id === topByReviews?.id ? "Trending" : null,
  }));
}

export interface RightNowCard {
  salonName: string;
  salonSlug: string;
  barberName: string;
  serviceName: string;
  priceCents: number;
  time: string;
}

function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(date);
}

/** Salons with a real bookable slot today, for the "Need a haircut today?" section. */
export async function getRightNowCards(limit: number): Promise<RightNowCard[]> {
  const salons = await db.salon.findMany({
    where: { approvalStatus: "APPROVED" },
    include: { services: { where: { active: true }, orderBy: { priceCents: "asc" }, take: 1 } },
    orderBy: { avgRating: "desc" },
  });

  const cards: RightNowCard[] = [];
  for (const salon of salons) {
    if (cards.length >= limit) break;
    const service = salon.services[0];
    if (!service) continue;

    const todayStr = dateStrInZone(new Date(), salon.timezone);
    const slots = await getAvailableSlots({ salonId: salon.id, serviceId: service.id, dateStr: todayStr });
    const next = slots.sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0];
    if (!next) continue;

    cards.push({
      salonName: salon.name,
      salonSlug: salon.slug,
      barberName: next.barberName,
      serviceName: service.name,
      priceCents: service.priceCents,
      time: formatTime(next.startAt, salon.timezone),
    });
  }

  return cards;
}

export interface TopBarber {
  id: string;
  name: string;
  title: string | null;
  photoUrl: string | null;
  avgRating: number;
  reviewCount: number;
  salonName: string;
  salonSuburb: string;
}

/** Top-rated bookable barbers across all salons, for the "Barber profiles" section. */
export async function getTopBarbers(limit: number): Promise<TopBarber[]> {
  const barbers = await db.barber.findMany({
    where: { active: true, bookableOnline: true, salon: { approvalStatus: "APPROVED" } },
    orderBy: { avgRating: "desc" },
    take: limit,
    include: { salon: { select: { name: true, suburb: true } } },
  });

  return barbers.map((b) => ({
    id: b.id,
    name: b.name,
    title: b.title,
    photoUrl: b.photoUrl,
    avgRating: b.avgRating,
    reviewCount: b.reviewCount,
    salonName: b.salon.name,
    salonSuburb: b.salon.suburb,
  }));
}

export interface Testimonial {
  quote: string;
  name: string;
  location: string;
}

/** Real 5-star reviews with a comment, for the "Customer reviews" section. */
export async function getTestimonials(limit: number): Promise<Testimonial[]> {
  const reviews = await db.review.findMany({
    where: { rating: 5, comment: { not: null } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { customer: { select: { name: true } } },
  });

  return reviews
    .filter((r) => r.comment)
    .map((r) => ({
      quote: r.comment!,
      name: r.customer?.name ?? "Verified customer",
      location: "",
    }));
}
