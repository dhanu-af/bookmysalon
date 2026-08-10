import Link from "next/link";
import { Star } from "lucide-react";
import { getPublicBarber } from "@/lib/salon-profile";
import { getNextAvailableSlot } from "@/lib/booking/next-available";
import { formatPriceCents, formatDuration } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FavouriteBarberButton } from "@/components/customer/favourite-buttons";

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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-xl">{barber.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{barber.name}</h1>
            <p className="text-muted-foreground">{barber.title ?? "Barber"}</p>
            <p className="flex items-center gap-1 text-sm">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {barber.avgRating > 0 ? barber.avgRating.toFixed(1) : "New"}
              {barber.reviewCount > 0 && ` (${barber.reviewCount})`}
            </p>
          </div>
        </div>
        <FavouriteBarberButton barberId={barber.id} />
      </div>

      {barber.bio && <p className="mt-4 text-muted-foreground">{barber.bio}</p>}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Services</h2>
        <div className="space-y-2">
          {barber.barberServices.map(({ service }) => (
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

      <div className="mt-8 flex items-center justify-between rounded-xl border bg-card p-4">
        <div>
          <p className="text-sm text-muted-foreground">Next available</p>
          <p className="font-semibold">
            {nextSlot ? formatSlotLabel(nextSlot.startAt, salon.timezone) : "No upcoming availability"}
          </p>
        </div>
        <Link href={`/salons/${salon.slug}/book?barberId=${barber.id}`}>
          <Button size="lg">Book with {barber.name}</Button>
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
