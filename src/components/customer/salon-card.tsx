import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SalonSearchResult } from "@/lib/salon-search";
import { formatPriceCents } from "@/lib/format";

export function SalonCard({ salon }: { salon: SalonSearchResult }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/salons/${salon.slug}`} className="font-semibold hover:underline">
              {salon.name}
            </Link>
            <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
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
            <div className="text-right text-sm text-muted-foreground">
              from <span className="font-semibold text-foreground">{formatPriceCents(salon.fromPriceCents)}</span>
            </div>
          )}
        </div>

        {salon.todaySlots.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Available today</p>
            <div className="flex flex-wrap gap-1.5">
              {salon.todaySlots.map((slot) => (
                <span key={slot} className="rounded-md border px-2 py-1 text-xs font-medium">
                  {slot}
                </span>
              ))}
            </div>
          </div>
        )}

        <Link href={`/salons/${salon.slug}/book`}>
          <Button className="w-full" size="sm">
            Book
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
