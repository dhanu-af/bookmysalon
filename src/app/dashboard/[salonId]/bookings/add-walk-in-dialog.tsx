"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addWalkIn } from "@/lib/actions/dashboard-bookings";
import { localDateStr } from "@/lib/date";
import { fraunces } from "@/lib/fonts";

const primaryButtonClassName =
  "rounded-xl bg-[#7C2D3E] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export function AddWalkInDialog({
  salonId,
  barbers,
  services,
}: {
  salonId: string;
  barbers: { id: string; name: string }[];
  services: { id: string; name: string; durationMinutes: number }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [barberId, setBarberId] = useState(barbers[0]?.id ?? "");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [guestName, setGuestName] = useState("Walk-in");
  const [date, setDate] = useState(() => localDateStr(new Date()));
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setSubmitting(true);
    const result = await addWalkIn(salonId, {
      barberId,
      serviceId,
      startAt: new Date(`${date}T${time}:00`),
      guestName,
    });
    setSubmitting(false);
    if ("error" in result) {
      toast.error(result.error as string);
      return;
    }
    toast.success("Walk-in added");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className={primaryButtonClassName}>Add Walk-In</button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={fraunces.className}>Add Walk-In</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Customer name</Label>
            <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Barber</Label>
            <Select value={barberId} onValueChange={(v) => v && setBarberId(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {barbers.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Service</Label>
            <Select value={serviceId} onValueChange={(v) => v && setServiceId(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.durationMinutes} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <button className={primaryButtonClassName} disabled={!barberId || !serviceId || submitting} onClick={onSubmit}>
            {submitting ? "Adding..." : "Add Walk-In"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
