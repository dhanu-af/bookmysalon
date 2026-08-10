"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { formatPriceCents, formatDuration } from "@/lib/format";
import { getAvailableSlotsAction } from "@/lib/actions/availability";
import { createBooking } from "@/lib/booking/create-booking";
import { localDateStr } from "@/lib/date";

type Service = { id: string; name: string; priceCents: number; durationMinutes: number };
type Barber = { id: string; name: string; title: string | null };
type Slot = { startAt: string; endAt: string; barberId: string; barberName: string };

const STEPS = ["Service", "Barber", "Date", "Time", "Your details", "Confirm"] as const;

export function BookingWizard({
  salon,
  services,
  barbers,
  initialBarberId,
  initialServiceId,
  loggedInUser,
}: {
  salon: { id: string; slug: string; name: string; timezone: string };
  services: Service[];
  barbers: Barber[];
  initialBarberId?: string;
  initialServiceId?: string;
  loggedInUser: { id: string; name: string; email: string } | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(initialServiceId ?? "");
  const [barberId, setBarberId] = useState<string | "any">(initialBarberId ?? "any");
  const [dateStr, setDateStr] = useState(() => localDateStr(new Date()));
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [name, setName] = useState(loggedInUser?.name ?? "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(loggedInUser?.email ?? "");
  const [submitting, setSubmitting] = useState(false);

  const selectedService = services.find((s) => s.id === serviceId) ?? null;

  useEffect(() => {
    if (step !== 3 || !serviceId) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    getAvailableSlotsAction({
      salonId: salon.id,
      serviceId,
      dateStr,
      barberId: barberId === "any" ? undefined : barberId,
    })
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [step, serviceId, barberId, dateStr, salon.id]);

  // De-duplicated time labels for display (union across barbers when "any" is selected).
  const timeLabels = useMemo(() => {
    if (!slots) return [];
    const map = new Map<string, Slot>();
    for (const s of slots) {
      const label = formatTime(s.startAt, salon.timezone);
      if (!map.has(label)) map.set(label, s);
    }
    return [...map.entries()];
  }, [slots, salon.timezone]);

  async function onConfirm() {
    if (!selectedSlot || !selectedService) return;
    setSubmitting(true);
    const result = await createBooking({
      salonId: salon.id,
      serviceId: selectedService.id,
      barberId: barberId === "any" ? undefined : barberId,
      dateStr,
      startAt: new Date(selectedSlot.startAt),
      customerId: loggedInUser?.id,
      guestName: name,
      guestPhone: phone,
      guestEmail: email || undefined,
      source: "ONLINE",
    });
    setSubmitting(false);
    if ("error" in result) {
      toast.error(result.error);
      setStep(3); // bounce back to time selection — slot may have just been taken
      return;
    }
    router.push(`/booking/${result.booking.reference}`);
  }

  return (
    <div>
      <ol className="mb-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {STEPS.map((label, i) => (
          <li key={label} className={i === step ? "font-semibold text-foreground" : ""}>
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-2">
          {services.map((s) => (
            <Card
              key={s.id}
              className={`cursor-pointer transition ${serviceId === s.id ? "border-foreground" : ""}`}
              onClick={() => setServiceId(s.id)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{formatDuration(s.durationMinutes)}</p>
                </div>
                <p className="font-semibold">{formatPriceCents(s.priceCents)}</p>
              </CardContent>
            </Card>
          ))}
          <Button className="mt-4 w-full" disabled={!serviceId} onClick={() => setStep(1)}>
            Continue
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2">
          <Card className={`cursor-pointer transition ${barberId === "any" ? "border-foreground" : ""}`} onClick={() => setBarberId("any")}>
            <CardContent className="p-4 font-medium">Any Available Barber</CardContent>
          </Card>
          {barbers.map((b) => (
            <Card key={b.id} className={`cursor-pointer transition ${barberId === b.id ? "border-foreground" : ""}`} onClick={() => setBarberId(b.id)}>
              <CardContent className="p-4">
                <p className="font-medium">{b.name}</p>
                <p className="text-sm text-muted-foreground">{b.title ?? "Barber"}</p>
              </CardContent>
            </Card>
          ))}
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button className="flex-1" onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <Calendar
            mode="single"
            selected={new Date(`${dateStr}T00:00:00`)}
            onSelect={(d) => d && setDateStr(localDateStr(d))}
            disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
            className="rounded-md border"
          />
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button className="flex-1" onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          {loadingSlots && <p className="text-sm text-muted-foreground">Checking availability...</p>}
          {!loadingSlots && timeLabels.length === 0 && (
            <p className="text-sm text-muted-foreground">No availability on this date. Try another date.</p>
          )}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {timeLabels.map(([label, slot]) => (
              <Button
                key={label}
                variant={selectedSlot?.startAt === slot.startAt ? "default" : "outline"}
                onClick={() => setSelectedSlot(slot)}
              >
                {label}
              </Button>
            ))}
          </div>
          {barberId === "any" && selectedSlot && (
            <p className="mt-3 text-sm text-muted-foreground">Assigned barber: {selectedSlot.barberName}</p>
          )}
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button className="flex-1" disabled={!selectedSlot} onClick={() => setStep(4)}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile</Label>
            <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button className="flex-1" disabled={!name || !phone} onClick={() => setStep(5)}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 5 && selectedService && selectedSlot && (
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-2 p-4 text-sm">
              <Row label="Salon" value={salon.name} />
              <Row label="Service" value={`${selectedService.name} (${formatDuration(selectedService.durationMinutes)})`} />
              <Row label="Barber" value={barberId === "any" ? `${selectedSlot.barberName} (auto-assigned)` : selectedSlot.barberName} />
              <Row label="When" value={formatDateTime(selectedSlot.startAt, salon.timezone)} />
              <Row label="Price" value={formatPriceCents(selectedService.priceCents)} />
              <Row label="Name" value={name} />
              <Row label="Mobile" value={phone} />
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(4)} disabled={submitting}>
              Back
            </Button>
            <Button className="flex-1" onClick={onConfirm} disabled={submitting}>
              {submitting ? "Confirming..." : "Confirm Booking"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-1 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function formatTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-AU", { timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

function formatDateTime(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
