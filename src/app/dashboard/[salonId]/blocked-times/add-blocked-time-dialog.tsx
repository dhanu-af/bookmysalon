"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBlockedTime } from "@/lib/actions/blocked-times";
import { localDateStr } from "@/lib/date";

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
      <DialogTrigger render={<Button>Block Time</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block Time</DialogTitle>
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
          <Button disabled={submitting} onClick={onSubmit}>
            {submitting ? "Saving..." : "Block Time"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
