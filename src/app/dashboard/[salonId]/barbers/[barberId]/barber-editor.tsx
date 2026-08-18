"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateBarber, setBarberWorkingHours, setBarberBreak, setBarberServices } from "@/lib/actions/barbers";
import { minutesToHHmm } from "@/lib/booking/slots";
import { fraunces } from "@/lib/fonts";

const primaryButtonClassName =
  "rounded-xl bg-[#7C2D3E] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type WorkingHour = { dayOfWeek: number; isOff: boolean; startMin: number | null; endMin: number | null };
type BreakRow = { dayOfWeek: number; startMin: number; endMin: number; label: string | null };

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function BarberEditor({
  salonId,
  barber,
  services,
  selectedServiceIds,
}: {
  salonId: string;
  barber: { id: string; name: string; title: string | null; bio: string | null; bookableOnline: boolean; active: boolean; workingHours: WorkingHour[]; breaks: BreakRow[] };
  services: { id: string; name: string }[];
  selectedServiceIds: string[];
}) {
  const router = useRouter();
  const [name, setName] = useState(barber.name);
  const [title, setTitle] = useState(barber.title ?? "");
  const [bookableOnline, setBookableOnline] = useState(barber.bookableOnline);
  const [active, setActive] = useState(barber.active);
  const [savingInfo, setSavingInfo] = useState(false);

  const [hours, setHours] = useState<WorkingHour[]>(
    Array.from({ length: 7 }, (_, d) => barber.workingHours.find((h) => h.dayOfWeek === d) ?? { dayOfWeek: d, isOff: true, startMin: null, endMin: null })
  );
  const [breaks, setBreaks] = useState<Record<number, { startMin: number; endMin: number } | null>>(
    Object.fromEntries(Array.from({ length: 7 }, (_, d) => [d, barber.breaks.find((b) => b.dayOfWeek === d) ?? null]))
  );
  const [savingSchedule, setSavingSchedule] = useState(false);

  const [serviceIds, setServiceIds] = useState<string[]>(selectedServiceIds);
  const [savingServices, setSavingServices] = useState(false);

  async function saveInfo() {
    setSavingInfo(true);
    const result = await updateBarber(barber.id, salonId, { name, title: title || undefined, bookableOnline, active });
    setSavingInfo(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Saved");
    router.refresh();
  }

  async function saveSchedule() {
    setSavingSchedule(true);
    await setBarberWorkingHours(barber.id, salonId, hours);
    for (const dayOfWeek of Array.from({ length: 7 }, (_, d) => d)) {
      const brk = breaks[dayOfWeek];
      await setBarberBreak(barber.id, salonId, dayOfWeek, brk ? { ...brk, label: "Break" } : null);
    }
    setSavingSchedule(false);
    toast.success("Schedule saved");
    router.refresh();
  }

  async function saveServices() {
    setSavingServices(true);
    await setBarberServices(barber.id, salonId, serviceIds);
    setSavingServices(false);
    toast.success("Services saved");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <h1 className={`${fraunces.className} mb-6 text-2xl font-semibold text-stone-900`}>{barber.name}</h1>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info" className="data-active:text-[#7C2D3E]">
            Info
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-active:text-[#7C2D3E]">
            Schedule
          </TabsTrigger>
          <TabsTrigger value="services" className="data-active:text-[#7C2D3E]">
            Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3">
            <p className="text-sm font-medium text-stone-900">Online booking</p>
            <Switch checked={bookableOnline} onCheckedChange={setBookableOnline} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3">
            <p className="text-sm font-medium text-stone-900">Active</p>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
          <button className={primaryButtonClassName} disabled={savingInfo} onClick={saveInfo}>
            {savingInfo ? "Saving..." : "Save"}
          </button>
        </TabsContent>

        <TabsContent value="schedule" className="mt-4 space-y-3">
          {hours.map((h, i) => (
            <div key={h.dayOfWeek} className="rounded-2xl border border-stone-100 bg-white shadow-sm">
              <div className="flex flex-wrap items-center gap-3 p-3">
                <span className="w-24 text-sm font-medium text-stone-900">{WEEKDAY_LABELS[h.dayOfWeek]}</span>
                <label className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={!h.isOff}
                    onCheckedChange={(checked) => {
                      const next = [...hours];
                      next[i] = { ...h, isOff: !checked, startMin: checked ? 540 : null, endMin: checked ? 1020 : null };
                      setHours(next);
                    }}
                  />
                  Working
                </label>
                {!h.isOff && (
                  <>
                    <Input
                      type="time"
                      className="w-28"
                      value={h.startMin != null ? minutesToHHmm(h.startMin) : ""}
                      onChange={(e) => {
                        const next = [...hours];
                        next[i] = { ...h, startMin: hhmmToMinutes(e.target.value) };
                        setHours(next);
                      }}
                    />
                    <span className="text-sm text-stone-500">to</span>
                    <Input
                      type="time"
                      className="w-28"
                      value={h.endMin != null ? minutesToHHmm(h.endMin) : ""}
                      onChange={(e) => {
                        const next = [...hours];
                        next[i] = { ...h, endMin: hhmmToMinutes(e.target.value) };
                        setHours(next);
                      }}
                    />
                    <span className="ml-4 text-xs text-stone-500">Break:</span>
                    <Input
                      type="time"
                      className="w-24"
                      value={breaks[h.dayOfWeek] ? minutesToHHmm(breaks[h.dayOfWeek]!.startMin) : ""}
                      onChange={(e) =>
                        setBreaks({
                          ...breaks,
                          [h.dayOfWeek]: { startMin: hhmmToMinutes(e.target.value), endMin: breaks[h.dayOfWeek]?.endMin ?? hhmmToMinutes(e.target.value) + 30 },
                        })
                      }
                    />
                    <span className="text-xs text-stone-500">to</span>
                    <Input
                      type="time"
                      className="w-24"
                      value={breaks[h.dayOfWeek] ? minutesToHHmm(breaks[h.dayOfWeek]!.endMin) : ""}
                      onChange={(e) => setBreaks({ ...breaks, [h.dayOfWeek]: { startMin: breaks[h.dayOfWeek]?.startMin ?? 0, endMin: hhmmToMinutes(e.target.value) } })}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
          <button className={primaryButtonClassName} disabled={savingSchedule} onClick={saveSchedule}>
            {savingSchedule ? "Saving..." : "Save Schedule"}
          </button>
        </TabsContent>

        <TabsContent value="services" className="mt-4 space-y-2">
          {services.map((s) => (
            <label key={s.id} className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white p-3 text-sm text-stone-900">
              <Checkbox
                checked={serviceIds.includes(s.id)}
                onCheckedChange={(checked) =>
                  setServiceIds(checked ? [...serviceIds, s.id] : serviceIds.filter((id) => id !== s.id))
                }
              />
              {s.name}
            </label>
          ))}
          <button className={primaryButtonClassName} disabled={savingServices} onClick={saveServices}>
            {savingServices ? "Saving..." : "Save Services"}
          </button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
