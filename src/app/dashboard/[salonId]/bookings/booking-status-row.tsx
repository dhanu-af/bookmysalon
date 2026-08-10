"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPriceCents } from "@/lib/format";
import { updateBookingStatus } from "@/lib/actions/dashboard-bookings";
import type { BookingStatus } from "@/generated/prisma/client";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CONFIRMED: "default",
  PENDING: "secondary",
  ARRIVED: "secondary",
  IN_SERVICE: "secondary",
  COMPLETED: "outline",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
};

const NEXT_ACTIONS: Partial<Record<BookingStatus, { label: string; next: BookingStatus }[]>> = {
  CONFIRMED: [
    { label: "I'm Here", next: "ARRIVED" },
    { label: "No-show", next: "NO_SHOW" },
    { label: "Cancel", next: "CANCELLED" },
  ],
  ARRIVED: [{ label: "Start Service", next: "IN_SERVICE" }],
  IN_SERVICE: [{ label: "Complete", next: "COMPLETED" }],
};

export function BookingStatusRow({
  booking,
  salonId,
  timezone,
}: {
  booking: {
    id: string;
    status: BookingStatus;
    guestName: string;
    serviceNameSnapshot: string;
    priceCentsSnapshot: number;
    startAt: Date;
    source: string;
    barber: { name: string };
  };
  salonId: string;
  timezone: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setStatus(next: BookingStatus) {
    startTransition(async () => {
      const result = await updateBookingStatus(booking.id, salonId, next);
      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  const actions = NEXT_ACTIONS[booking.status] ?? [];

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{booking.guestName}</p>
            <Badge variant={STATUS_VARIANT[booking.status] ?? "outline"}>{booking.status}</Badge>
            {booking.source === "WALK_IN" && <Badge variant="outline">Walk-in</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            {booking.serviceNameSnapshot} with {booking.barber.name} · {formatDateTime(booking.startAt, timezone)} ·{" "}
            {formatPriceCents(booking.priceCentsSnapshot)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <Button key={a.label} variant="outline" size="sm" disabled={pending} onClick={() => setStatus(a.next)}>
              {a.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatDateTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-AU", { timeZone, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(
    date
  );
}
