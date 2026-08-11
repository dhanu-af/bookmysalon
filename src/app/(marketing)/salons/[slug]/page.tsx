import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { getPublicSalonBySlug, WEEKDAY_LABELS } from "@/lib/salon-profile";
import { formatPriceCents, formatDuration } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FavouriteSalonButton } from "@/components/customer/favourite-buttons";
import { RUNNING_STATUS_LABELS } from "@/lib/salon-status";

export default async function SalonProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const salon = await getPublicSalonBySlug(slug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{salon.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
            <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-400">
              {RUNNING_STATUS_LABELS[salon.runningStatus]}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <FavouriteSalonButton salonId={salon.id} />
          <Link href={`/salons/${salon.slug}/book`}>
            <Button size="lg">Book Now</Button>
          </Link>
        </div>
      </div>

      {salon.description && <p className="mt-4 text-muted-foreground">{salon.description}</p>}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Services</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {salon.services.map((service) => (
            <Card key={service.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">{formatDuration(service.durationMinutes)}</p>
                </div>
                <p className="font-semibold">{formatPriceCents(service.priceCents)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Barbers</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {salon.barbers.map((barber) => (
            <Link key={barber.id} href={`/salons/${salon.slug}/barbers/${barber.id}`}>
              <Card className="transition hover:border-foreground/30">
                <CardContent className="flex items-center gap-3 p-4">
                  <Avatar>
                    <AvatarFallback>{barber.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{barber.name}</p>
                    <p className="text-sm text-muted-foreground">{barber.title ?? "Barber"}</p>
                  </div>
                  <span className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    {barber.avgRating > 0 ? barber.avgRating.toFixed(1) : "New"}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Opening Hours</h2>
        <div className="max-w-sm space-y-1 text-sm">
          {salon.openingHours.map((oh) => (
            <div key={oh.dayOfWeek} className="flex justify-between border-b py-1.5 last:border-0">
              <span>{WEEKDAY_LABELS[oh.dayOfWeek]}</span>
              <span className="text-muted-foreground">
                {oh.isClosed ? "Closed" : `${formatHHmm(oh.openMin!)} – ${formatHHmm(oh.closeMin!)}`}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link href={`/salons/${salon.slug}/book`}>
          <Button size="lg" className="w-full sm:w-auto">
            View Available Appointments
          </Button>
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
