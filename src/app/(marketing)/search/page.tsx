import { searchSalons } from "@/lib/salon-search";
import { SalonCard } from "@/components/customer/salon-card";
import { SearchFilters } from "./search-filters";
import { fraunces, outfit } from "@/lib/fonts";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lat?: string; lng?: string; radiusKm?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const lat = sp.lat ? Number(sp.lat) : undefined;
  const lng = sp.lng ? Number(sp.lng) : undefined;
  const radiusKm = sp.radiusKm ? Number(sp.radiusKm) : undefined;
  const sort = (sp.sort as "distance" | "rating" | "price" | undefined) ?? undefined;

  const salons = await searchSalons({ query: sp.q, lat, lng, radiusKm, sort });

  return (
    <div className={`${outfit.className} min-h-full bg-[#FAF8F5] px-4 py-10 sm:py-14`}>
      <div className="mx-auto max-w-6xl">
        <h1 className={`${fraunces.className} mb-6 text-3xl font-semibold text-stone-900`}>
          {sp.q ? `Results for "${sp.q}"` : "All salons"}
        </h1>

        <SearchFilters hasLocation={lat != null && lng != null} />

        {salons.length === 0 ? (
          <p className="mt-8 text-stone-500">No salons found. Try widening your search radius.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {salons.map((s) => (
              <SalonCard key={s.id} salon={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
