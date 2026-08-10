"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { getAvailableSlotsAction } from "@/lib/actions/availability";
import { rescheduleBooking } from "@/lib/actions/bookings";
import { localDateStr } from "@/lib/date";

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
          <DialogTitle>Reschedule booking</DialogTitle>
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
          {slots?.map((s) => (
            <Button key={s.startAt} variant={selected === s.startAt ? "default" : "outline"} size="sm" onClick={() => setSelected(s.startAt)}>
              {formatTime(s.startAt, timezone)}
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button disabled={!selected || submitting} onClick={onConfirm}>
            {submitting ? "Saving..." : "Confirm new time"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-AU", { timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}
