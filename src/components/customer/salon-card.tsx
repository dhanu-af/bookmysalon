import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import type { SalonSearchResult } from "@/lib/salon-search";
import { formatPriceCents } from "@/lib/format";
import { RUNNING_STATUS_LABELS } from "@/lib/salon-status";
import { fraunces } from "@/lib/fonts";

export function SalonCard({ salon }: { salon: SalonSearchResult }) {
  return (
    <div className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-stone-100 bg-white p-4 transition-all duration-200 hover:border-stone-200 hover:shadow-md hover:shadow-stone-200/60">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/salons/${salon.slug}`} className={`${fraunces.className} font-semibold text-stone-900 hover:text-[#7C2D3E]`}>
            {salon.name}
          </Link>
          <div className="mt-0.5 flex items-center gap-2 text-sm text-stone-500">
            {salon.distanceKm != null && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {salon.distanceKm.toFixed(1)} km away
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {salon.avgRating > 0 ? salon.avgRating.toFixed(1) : "New"}
              {salon.reviewCount > 0 && ` (${salon.reviewCount})`}
            </span>
          </div>
        </div>
        {salon.fromPriceCents != null && (
          <div className="text-right text-sm text-stone-500">
            from <span className={`${fraunces.className} font-semibold text-stone-900`}>{formatPriceCents(salon.fromPriceCents)}</span>
          </div>
        )}
      </div>

      {salon.runningStatus !== "ON_TIME" && (
        <p className="text-xs font-medium text-amber-700">{RUNNING_STATUS_LABELS[salon.runningStatus]}</p>
      )}

      {salon.todaySlots.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-stone-400">Available today</p>
          <div className="flex flex-wrap gap-1.5">
            {salon.todaySlots.map((slot) => (
              <span key={slot} className="rounded-md border border-stone-200 px-2 py-1 text-xs font-medium text-stone-700">
                {slot}
              </span>
            ))}
          </div>
        </div>
      )}

      <Link
        href={`/salons/${salon.slug}/book`}
        className="w-full rounded-xl bg-[#7C2D3E] py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98]"
      >
        Book
      </Link>
    </div>
  );
}
