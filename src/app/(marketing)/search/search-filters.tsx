"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RADII = [1, 5, 10, 20];

export function SearchFilters({ hasLocation }: { hasLocation: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select defaultValue={searchParams.get("sort") ?? (hasLocation ? "distance" : "rating")} onValueChange={(v) => update("sort", v)}>
        <SelectTrigger className="w-40 rounded-xl border-2 border-stone-200 bg-white py-2.5 hover:border-stone-300">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {hasLocation && <SelectItem value="distance">Distance</SelectItem>}
          <SelectItem value="rating">Rating</SelectItem>
          <SelectItem value="price">Price</SelectItem>
        </SelectContent>
      </Select>

      {hasLocation && (
        <Select defaultValue={searchParams.get("radiusKm") ?? "10"} onValueChange={(v) => update("radiusKm", v)}>
          <SelectTrigger className="w-32 rounded-xl border-2 border-stone-200 bg-white py-2.5 hover:border-stone-300">
            <SelectValue placeholder="Radius" />
          </SelectTrigger>
          <SelectContent>
            {RADII.map((r) => (
              <SelectItem key={r} value={String(r)}>
                {r} km
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
