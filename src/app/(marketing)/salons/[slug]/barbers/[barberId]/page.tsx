import Link from "next/link";
import { Star } from "lucide-react";
import { getPublicBarber } from "@/lib/salon-profile";
import { getNextAvailableSlot } from "@/lib/booking/next-available";
import { formatPriceCents, formatDuration } from "@/lib/format";
import { FavouriteBarberButton } from "@/components/customer/favourite-buttons";
import { fraunces } from "@/lib/fonts";

export default async function BarberProfilePage({
  params,
}: {
  params: Promise<{ slug: string; barberId: string }>;
}) {
  const { slug, barberId } = await params;
  const { salon, barber } = await getPublicBarber(slug, barberId);

  const firstService = barber.barberServices[0]?.service;
  const nextSlot = firstService
    ? await getNextAvailableSlot({ salonId: salon.id, serviceId: firstService.id, barberId: barber.id, timezone: salon.timezone })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`${fraunces.className} flex size-16 shrink-0 items-center justify-center rounded-full bg-[#7C2D3E] text-xl font-bold text-white`}>
            {barber.name.slice(0, 1)}
          </div>
          <div>
            <h1 className={`${fraunces.className} text-2xl font-semibold text-stone-900`}>{barber.name}</h1>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#7C2D3E]">{barber.title ?? "Barber"}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {barber.avgRating > 0 ? barber.avgRating.toFixed(1) : "New"}
              {barber.reviewCount > 0 && ` (${barber.reviewCount})`}
            </p>
          </div>
        </div>
        <FavouriteBarberButton barberId={barber.id} />
      </div>

      {barber.bio && <p className="mt-4 text-stone-600">{barber.bio}</p>}

      <section className="mt-10">
        <h2 className={`${fraunces.className} mb-4 text-lg font-semibold text-stone-900`}>Services</h2>
        <div className="space-y-3">
          {barber.barberServices.map(({ service }) => (
            <div
              key={service.id}
              className="flex items-center justify-between rounded-2xl border border-stone-100 bg-white p-4 transition-all duration-200 hover:border-stone-200 hover:shadow-md hover:shadow-stone-200/60"
            >
              <div>
                <p className="font-medium text-stone-900">{service.name}</p>
                <p className="text-sm text-stone-500">{formatDuration(service.durationMinutes)}</p>
              </div>
              <p className={`${fraunces.className} font-semibold text-stone-900`}>{formatPriceCents(service.priceCents)}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 flex items-center justify-between rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm text-stone-500">Next available</p>
          <p className={`${fraunces.className} font-semibold text-stone-900`}>
            {nextSlot ? formatSlotLabel(nextSlot.startAt, salon.timezone) : "No upcoming availability"}
          </p>
        </div>
        <Link
          href={`/salons/${salon.slug}/book?barberId=${barber.id}`}
          className="rounded-xl bg-[#7C2D3E] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98]"
        >
          Book with {barber.name}
        </Link>
      </div>
    </div>
  );
}

function formatSlotLabel(startAt: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(startAt);
}
