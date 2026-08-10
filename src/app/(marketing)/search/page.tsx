import { searchSalons } from "@/lib/salon-search";
import { SalonCard } from "@/components/customer/salon-card";
import { SearchFilters } from "./search-filters";

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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">
        {sp.q ? `Results for "${sp.q}"` : "All salons"}
      </h1>

      <SearchFilters hasLocation={lat != null && lng != null} />

      {salons.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No salons found. Try widening your search radius.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {salons.map((s) => (
            <SalonCard key={s.id} salon={s} />
          ))}
        </div>
      )}
    </div>
  );
}
