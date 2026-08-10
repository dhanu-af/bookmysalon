import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { formatPriceCents } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function BookingConfirmationPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;

  const booking = await db.booking.findUnique({
    where: { reference },
    include: { salon: true, barber: true },
  });
  if (!booking) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      <CheckCircle2 className="mx-auto size-12 text-green-600" />
      <h1 className="mt-4 text-2xl font-bold">Booking confirmed!</h1>
      <p className="mt-1 text-muted-foreground">Your booking reference</p>
      <p className="mt-1 text-3xl font-bold tracking-wide">{booking.reference}</p>

      <Card className="mt-6 text-left">
        <CardContent className="space-y-2 p-4 text-sm">
          <Row label="Salon" value={booking.salon.name} />
          <Row label="Barber" value={booking.barber.name} />
          <Row label="Service" value={booking.serviceNameSnapshot} />
          <Row label="When" value={formatDateTime(booking.startAt, booking.salon.timezone)} />
          <Row label="Price" value={formatPriceCents(booking.priceCentsSnapshot)} />
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-2">
        <Link href={`/salons/${booking.salon.slug}`}>
          <Button variant="outline" className="w-full">
            View Salon
          </Button>
        </Link>
        <Link href="/register">
          <Button className="w-full">Create an account to manage this booking</Button>
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-1 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function formatDateTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
