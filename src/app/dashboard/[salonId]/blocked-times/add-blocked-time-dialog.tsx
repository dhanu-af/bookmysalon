"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBlockedTime } from "@/lib/actions/blocked-times";
import { localDateStr } from "@/lib/date";
import { fraunces } from "@/lib/fonts";

const primaryButtonClassName =
  "rounded-xl bg-[#7C2D3E] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export function AddBlockedTimeDialog({ salonId, barbers }: { salonId: string; barbers: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [barberId, setBarberId] = useState<string>("all");
  const [date, setDate] = useState(() => localDateStr(new Date()));
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("13:00");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setSubmitting(true);
    const result = await createBlockedTime(salonId, {
      barberId: barberId === "all" ? undefined : barberId,
      startAt: new Date(`${date}T${startTime}:00`),
      endAt: new Date(`${date}T${endTime}:00`),
      reason: reason || "Blocked",
    });
    setSubmitting(false);
    if ("error" in result) {
      toast.error(result.error as string);
      return;
    }
    toast.success("Time blocked");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className={primaryButtonClassName}>Block Time</button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={fraunces.className}>Block Time</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Applies to</Label>
            <Select value={barberId} onValueChange={(v) => v && setBarberId(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Whole salon</SelectItem>
                {barbers.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>End</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lunch, Meeting, Equipment issue..." />
          </div>
        </div>
        <DialogFooter>
          <button className={primaryButtonClassName} disabled={submitting} onClick={onSubmit}>
            {submitting ? "Saving..." : "Block Time"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
