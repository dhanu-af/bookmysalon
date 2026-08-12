import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { getPublicSalonBySlug, WEEKDAY_LABELS } from "@/lib/salon-profile";
import { formatPriceCents, formatDuration } from "@/lib/format";
import { FavouriteSalonButton } from "@/components/customer/favourite-buttons";
import { RUNNING_STATUS_LABELS } from "@/lib/salon-status";
import { fraunces } from "@/lib/fonts";

export default async function SalonProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const salon = await getPublicSalonBySlug(slug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`${fraunces.className} text-3xl font-semibold text-stone-900`}>{salon.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-stone-500">
            <span className="flex items-center gap-1">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {salon.avgRating > 0 ? salon.avgRating.toFixed(1) : "New"}
              {salon.reviewCount > 0 && ` (${salon.reviewCount} reviews)`}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-4" />
              {salon.suburb}, {salon.state}
            </span>
          </div>
          {salon.runningStatus !== "ON_TIME" && (
            <p className="mt-2 text-sm font-medium text-amber-700">{RUNNING_STATUS_LABELS[salon.runningStatus]}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <FavouriteSalonButton salonId={salon.id} />
          <Link
            href={`/salons/${salon.slug}/book`}
            className="rounded-xl bg-[#7C2D3E] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98]"
          >
            Book Now
          </Link>
        </div>
      </div>

      {salon.description && <p className="mt-4 text-stone-600">{salon.description}</p>}

      <section className="mt-10">
        <h2 className={`${fraunces.className} mb-4 text-lg font-semibold text-stone-900`}>Services</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {salon.services.map((service) => (
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

      <section className="mt-10">
        <h2 className={`${fraunces.className} mb-4 text-lg font-semibold text-stone-900`}>Barbers</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {salon.barbers.map((barber) => (
            <Link
              key={barber.id}
              href={`/salons/${salon.slug}/barbers/${barber.id}`}
              className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-4 transition-all duration-200 hover:border-stone-200 hover:shadow-md hover:shadow-stone-200/60"
            >
              <div className={`${fraunces.className} flex size-10 shrink-0 items-center justify-center rounded-full bg-[#7C2D3E]/10 text-sm font-bold text-[#7C2D3E]`}>
                {barber.name.slice(0, 1)}
              </div>
              <div>
                <p className="font-medium text-stone-900">{barber.name}</p>
                <p className="text-sm text-stone-500">{barber.title ?? "Barber"}</p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-sm text-stone-500">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {barber.avgRating > 0 ? barber.avgRating.toFixed(1) : "New"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className={`${fraunces.className} mb-4 text-lg font-semibold text-stone-900`}>Opening Hours</h2>
        <div className="max-w-sm space-y-1 text-sm">
          {salon.openingHours.map((oh) => (
            <div key={oh.dayOfWeek} className="flex justify-between border-b border-stone-200 py-2 last:border-0">
              <span className="text-stone-700">{WEEKDAY_LABELS[oh.dayOfWeek]}</span>
              <span className="text-stone-500">
                {oh.isClosed ? "Closed" : `${formatHHmm(oh.openMin!)} – ${formatHHmm(oh.closeMin!)}`}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10">
        <Link
          href={`/salons/${salon.slug}/book`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#7C2D3E] px-8 py-4 text-base font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98] sm:w-auto"
        >
          View Available Appointments
        </Link>
      </div>
    </div>
  );
}

function formatHHmm(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}
