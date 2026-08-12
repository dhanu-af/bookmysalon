"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelBooking } from "@/lib/actions/bookings";
import { formatPriceCents } from "@/lib/format";
import { fraunces } from "@/lib/fonts";
import { RescheduleDialog } from "./reschedule-dialog";
import { ReviewDialog } from "./review-dialog";
import type { getMyBookings } from "@/lib/booking/my-bookings";

type Booking = Awaited<ReturnType<typeof getMyBookings>>["upcoming"][number];

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: "bg-[#7C2D3E]/10 text-[#7C2D3E]",
  PENDING: "bg-amber-100 text-amber-800",
  ARRIVED: "bg-amber-100 text-amber-800",
  IN_SERVICE: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-stone-100 text-stone-600",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-red-100 text-red-700",
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
    <div className="flex flex-col gap-2 rounded-2xl border border-stone-100 bg-white p-4 transition-all duration-200 hover:border-stone-200 hover:shadow-md hover:shadow-stone-200/60 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Link href={`/salons/${booking.salon.slug}`} className={`${fraunces.className} font-semibold text-stone-900 hover:text-[#7C2D3E]`}>
            {booking.salon.name}
          </Link>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[booking.status] ?? "bg-stone-100 text-stone-600"}`}>
            {booking.status}
          </span>
        </div>
        <p className="text-sm text-stone-500">
          {booking.serviceNameSnapshot} with {booking.barber.name} · {formatDateTime(booking.startAt, booking.salon.timezone)} ·{" "}
          {formatPriceCents(booking.priceCentsSnapshot)}
        </p>
        <p className="text-xs text-stone-400">Ref: {booking.reference}</p>
        {booking.status === "ARRIVED" && queuePosition != null && (
          <p className="mt-1 text-sm font-medium text-amber-700">
            {queuePosition === 1 ? "You're next!" : `Position in queue: ${queuePosition}`}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tab === "upcoming" && (
          <>
            <button
              type="button"
              onClick={() => setRescheduleOpen(true)}
              className="rounded-xl border-2 border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-all duration-150 hover:border-stone-400 hover:text-stone-900"
            >
              Reschedule
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={onCancel}
              className="rounded-xl border-2 border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-all duration-150 hover:border-stone-400 hover:text-stone-900 disabled:opacity-50"
            >
              Cancel
            </button>
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
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="rounded-xl border-2 border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-all duration-150 hover:border-stone-400 hover:text-stone-900"
            >
              Leave a Review
            </button>
            <ReviewDialog bookingId={booking.id} open={reviewOpen} onOpenChange={setReviewOpen} />
          </>
        )}
        {(tab === "past" || tab === "cancelled") && (
          <Link
            href={`/salons/${booking.salon.slug}/book?barberId=${booking.barberId}&serviceId=${booking.serviceId}`}
            className="rounded-xl bg-[#7C2D3E] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98]"
          >
            Book Again
          </Link>
        )}
      </div>
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
