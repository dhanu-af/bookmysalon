"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { formatPriceCents } from "@/lib/format";
import { updateBookingStatus } from "@/lib/actions/dashboard-bookings";
import { fraunces } from "@/lib/fonts";
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
    <div className="flex flex-col gap-2 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <p className={`${fraunces.className} font-semibold text-stone-900`}>{booking.guestName}</p>
          <Badge variant={STATUS_VARIANT[booking.status] ?? "outline"}>{booking.status}</Badge>
          {booking.source === "WALK_IN" && <Badge variant="outline">Walk-in</Badge>}
        </div>
        <p className="text-sm text-stone-500">
          {booking.serviceNameSnapshot} with {booking.barber.name} · {formatDateTime(booking.startAt, timezone)} ·{" "}
          {formatPriceCents(booking.priceCentsSnapshot)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            disabled={pending}
            onClick={() => setStatus(a.next)}
            className="rounded-lg border-2 border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition-all duration-150 hover:border-stone-400 hover:text-stone-900 disabled:pointer-events-none disabled:opacity-50"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function formatDateTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-AU", { timeZone, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(
    date
  );
}
