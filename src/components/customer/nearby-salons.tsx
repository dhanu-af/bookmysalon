"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SalonCard } from "./salon-card";
import { searchSalonsAction } from "@/lib/actions/search";
import type { SalonSearchResult } from "@/lib/salon-search";

const RADII = [1, 5, 10, 20];

export function NearbySalons() {
  const [salons, setSalons] = useState<SalonSearchResult[] | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [status, setStatus] = useState<"idle" | "locating" | "denied" | "ready">("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("denied");
      loadFallback();
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setStatus("ready");
      },
      () => {
        setStatus("denied");
        loadFallback();
      },
      { timeout: 8000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === "ready" && coords) {
      searchSalonsAction({ lat: coords.lat, lng: coords.lng, radiusKm, sort: "distance" }).then(setSalons);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, coords, radiusKm]);

  function loadFallback() {
    searchSalonsAction({ sort: "rating" }).then(setSalons);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">{status === "ready" ? "Nearby Salons" : "Popular Salons"}</h2>
        {status === "ready" && (
          <Select value={String(radiusKm)} onValueChange={(v) => v && setRadiusKm(Number(v))}>
            <SelectTrigger className="w-28">
              <SelectValue />
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

      {status === "locating" && <p className="text-sm text-muted-foreground">Finding salons near you...</p>}

      {status === "denied" && !salons && <p className="text-sm text-muted-foreground">Loading popular salons...</p>}

      {salons && salons.length === 0 && (
        <p className="text-sm text-muted-foreground">No salons found in this area yet.</p>
      )}

      {salons && salons.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {salons.map((s) => (
            <SalonCard key={s.id} salon={s} />
          ))}
        </div>
      )}

      {status === "denied" && (
        <Button variant="link" className="mt-2 px-0" onClick={() => window.location.reload()}>
          Enable location to see distances
        </Button>
      )}
    </section>
  );
}
