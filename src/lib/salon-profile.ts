import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { publicSalonWhere } from "@/lib/salon-search";

export async function getPublicSalonBySlug(slug: string) {
  const salon = await db.salon.findFirst({
    where: { slug, ...publicSalonWhere() },
    include: {
      services: { where: { active: true }, orderBy: { name: "asc" } },
      barbers: { where: { active: true, bookableOnline: true }, orderBy: { name: "asc" } },
      openingHours: { orderBy: { dayOfWeek: "asc" } },
    },
  });
  if (!salon) notFound();
  return salon;
}

export async function getPublicBarber(salonSlug: string, barberId: string) {
  const salon = await getPublicSalonBySlug(salonSlug);
  const barber = await db.barber.findFirst({
    where: { id: barberId, salonId: salon.id, active: true },
    include: { barberServices: { include: { service: true } } },
  });
  if (!barber) notFound();
  return { salon, barber };
}

export const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
