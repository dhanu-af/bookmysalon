"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { getAvailableSlotsAction } from "@/lib/actions/availability";
import { rescheduleBooking } from "@/lib/actions/bookings";
import { localDateStr } from "@/lib/date";
import { fraunces } from "@/lib/fonts";

export function RescheduleDialog({
  bookingId,
  salonId,
  serviceId,
  barberId,
  timezone,
  open,
  onOpenChange,
}: {
  bookingId: string;
  salonId: string;
  serviceId: string;
  barberId: string;
  timezone: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [dateStr, setDateStr] = useState(() => localDateStr(new Date()));
  const [slots, setSlots] = useState<{ startAt: string }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelected(null);
    getAvailableSlotsAction({ salonId, serviceId, barberId, dateStr })
      .then(setSlots)
      .finally(() => setLoading(false));
  }, [open, dateStr, salonId, serviceId, barberId]);

  async function onConfirm() {
    if (!selected) return;
    setSubmitting(true);
    const result = await rescheduleBooking(bookingId, dateStr, new Date(selected));
    setSubmitting(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Booking rescheduled");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={fraunces.className}>Reschedule booking</DialogTitle>
        </DialogHeader>
        <Calendar
          mode="single"
          selected={new Date(`${dateStr}T00:00:00`)}
          onSelect={(d) => d && setDateStr(localDateStr(d))}
          disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
          className="rounded-md border"
        />
        {loading && <p className="text-sm text-muted-foreground">Checking availability...</p>}
        {!loading && slots && slots.length === 0 && <p className="text-sm text-muted-foreground">No availability on this date.</p>}
        <div className="grid grid-cols-4 gap-2">
          {slots?.map((s) => {
            const active = selected === s.startAt;
            return (
              <button
                key={s.startAt}
                type="button"
                onClick={() => setSelected(s.startAt)}
                className={`rounded-lg border-2 px-2 py-1.5 text-sm font-medium transition-all duration-150 ${
                  active ? "border-[#7C2D3E] bg-[#7C2D3E] text-white" : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                }`}
              >
                {formatTime(s.startAt, timezone)}
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <button
            type="button"
            disabled={!selected || submitting}
            onClick={onConfirm}
            className="rounded-xl bg-[#7C2D3E] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Confirm new time"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-AU", { timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}
