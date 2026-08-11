"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cancelBooking } from "@/lib/actions/bookings";
import { formatPriceCents } from "@/lib/format";
import { RescheduleDialog } from "./reschedule-dialog";
import { ReviewDialog } from "./review-dialog";
import type { getMyBookings } from "@/lib/booking/my-bookings";

type Booking = Awaited<ReturnType<typeof getMyBookings>>["upcoming"][number];

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CONFIRMED: "default",
  PENDING: "secondary",
  ARRIVED: "secondary",
  IN_SERVICE: "secondary",
  COMPLETED: "outline",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
};

export function BookingRow({
  booking,
  tab,
  queuePosition,
}: {
  booking: Booking;
  tab: "upcoming" | "past" | "cancelled";
  queuePosition?: number | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  function onCancel() {
    startTransition(async () => {
      const result = await cancelBooking(booking.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Booking cancelled");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/salons/${booking.salon.slug}`} className="font-medium hover:underline">
              {booking.salon.name}
            </Link>
            <Badge variant={STATUS_VARIANT[booking.status] ?? "outline"}>{booking.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {booking.serviceNameSnapshot} with {booking.barber.name} · {formatDateTime(booking.startAt, booking.salon.timezone)} ·{" "}
            {formatPriceCents(booking.priceCentsSnapshot)}
          </p>
          <p className="text-xs text-muted-foreground">Ref: {booking.reference}</p>
          {booking.status === "ARRIVED" && queuePosition != null && (
            <p className="mt-1 text-sm font-medium text-amber-700 dark:text-amber-400">
              {queuePosition === 1 ? "You're next!" : `Position in queue: ${queuePosition}`}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {tab === "upcoming" && (
            <>
              <Button variant="outline" size="sm" onClick={() => setRescheduleOpen(true)}>
                Reschedule
              </Button>
              <Button variant="outline" size="sm" disabled={pending} onClick={onCancel}>
                Cancel
              </Button>
              <RescheduleDialog
                bookingId={booking.id}
                salonId={booking.salonId}
                serviceId={booking.serviceId}
                barberId={booking.barberId}
                timezone={booking.salon.timezone}
                open={rescheduleOpen}
                onOpenChange={setRescheduleOpen}
              />
            </>
          )}
          {tab === "past" && !booking.review && (
            <>
              <Button variant="outline" size="sm" onClick={() => setReviewOpen(true)}>
                Leave a Review
              </Button>
              <ReviewDialog bookingId={booking.id} open={reviewOpen} onOpenChange={setReviewOpen} />
            </>
          )}
          {(tab === "past" || tab === "cancelled") && (
            <Link href={`/salons/${booking.salon.slug}/book?barberId=${booking.barberId}&serviceId=${booking.serviceId}`}>
              <Button size="sm">Book Again</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
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
