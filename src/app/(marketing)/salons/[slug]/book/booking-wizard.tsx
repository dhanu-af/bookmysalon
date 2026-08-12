"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { formatPriceCents, formatDuration } from "@/lib/format";
import { getAvailableSlotsAction } from "@/lib/actions/availability";
import { createBooking } from "@/lib/booking/create-booking";
import { localDateStr } from "@/lib/date";
import { fraunces } from "@/lib/fonts";

type Service = { id: string; name: string; priceCents: number; durationMinutes: number };
type Barber = { id: string; name: string; title: string | null };
type Slot = { startAt: string; endAt: string; barberId: string; barberName: string };

const STEPS = ["Service", "Barber", "Date", "Time", "Your details", "Confirm"] as const;

function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`rounded-xl bg-[#7C2D3E] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function OutlineButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`rounded-xl border-2 border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 transition-all duration-150 hover:border-stone-400 hover:text-stone-900 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function SelectableCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-150 ${
        selected ? "border-[#7C2D3E] bg-[#7C2D3E]/5" : "border-stone-100 bg-white hover:border-stone-200"
      }`}
    >
      {children}
    </div>
  );
}

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
      <ol className="mb-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400">
        {STEPS.map((label, i) => (
          <li key={label} className={i === step ? "font-semibold text-[#7C2D3E]" : ""}>
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-2">
          {services.map((s) => (
            <SelectableCard key={s.id} selected={serviceId === s.id} onClick={() => setServiceId(s.id)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-900">{s.name}</p>
                  <p className="text-sm text-stone-500">{formatDuration(s.durationMinutes)}</p>
                </div>
                <p className={`${fraunces.className} font-semibold text-stone-900`}>{formatPriceCents(s.priceCents)}</p>
              </div>
            </SelectableCard>
          ))}
          <PrimaryButton className="mt-4 w-full justify-center" disabled={!serviceId} onClick={() => setStep(1)}>
            Continue
          </PrimaryButton>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2">
          <SelectableCard selected={barberId === "any"} onClick={() => setBarberId("any")}>
            <p className="font-medium text-stone-900">Any Available Barber</p>
          </SelectableCard>
          {barbers.map((b) => (
            <SelectableCard key={b.id} selected={barberId === b.id} onClick={() => setBarberId(b.id)}>
              <p className="font-medium text-stone-900">{b.name}</p>
              <p className="text-sm text-stone-500">{b.title ?? "Barber"}</p>
            </SelectableCard>
          ))}
          <div className="mt-4 flex gap-2">
            <OutlineButton onClick={() => setStep(0)}>Back</OutlineButton>
            <PrimaryButton className="flex-1 justify-center" onClick={() => setStep(2)}>
              Continue
            </PrimaryButton>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="inline-block rounded-2xl border border-stone-100 bg-white p-2 shadow-sm">
            <Calendar
              mode="single"
              selected={new Date(`${dateStr}T00:00:00`)}
              onSelect={(d) => d && setDateStr(localDateStr(d))}
              disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <OutlineButton onClick={() => setStep(1)}>Back</OutlineButton>
            <PrimaryButton className="flex-1 justify-center" onClick={() => setStep(3)}>
              Continue
            </PrimaryButton>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          {loadingSlots && <p className="text-sm text-stone-500">Checking availability...</p>}
          {!loadingSlots && timeLabels.length === 0 && (
            <p className="text-sm text-stone-500">No availability on this date. Try another date.</p>
          )}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {timeLabels.map(([label, slot]) => {
              const active = selectedSlot?.startAt === slot.startAt;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    active ? "border-[#7C2D3E] bg-[#7C2D3E] text-white" : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {barberId === "any" && selectedSlot && (
            <p className="mt-3 text-sm text-stone-500">Assigned barber: {selectedSlot.barberName}</p>
          )}
          <div className="mt-4 flex gap-2">
            <OutlineButton onClick={() => setStep(2)}>Back</OutlineButton>
            <PrimaryButton className="flex-1 justify-center" disabled={!selectedSlot} onClick={() => setStep(4)}>
              Continue
            </PrimaryButton>
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
            <OutlineButton onClick={() => setStep(3)}>Back</OutlineButton>
            <PrimaryButton className="flex-1 justify-center" disabled={!name || !phone} onClick={() => setStep(5)}>
              Continue
            </PrimaryButton>
          </div>
        </div>
      )}

      {step === 5 && selectedService && selectedSlot && (
        <div className="space-y-4">
          <div className="space-y-2 rounded-2xl border border-stone-100 bg-white p-5 text-sm shadow-sm">
            <Row label="Salon" value={salon.name} />
            <Row label="Service" value={`${selectedService.name} (${formatDuration(selectedService.durationMinutes)})`} />
            <Row label="Barber" value={barberId === "any" ? `${selectedSlot.barberName} (auto-assigned)` : selectedSlot.barberName} />
            <Row label="When" value={formatDateTime(selectedSlot.startAt, salon.timezone)} />
            <Row label="Price" value={formatPriceCents(selectedService.priceCents)} />
            <Row label="Name" value={name} />
            <Row label="Mobile" value={phone} />
          </div>
          <div className="flex gap-2">
            <OutlineButton onClick={() => setStep(4)} disabled={submitting}>
              Back
            </OutlineButton>
            <PrimaryButton className="flex-1 justify-center" onClick={onConfirm} disabled={submitting}>
              {submitting ? "Confirming..." : "Confirm Booking"}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-stone-100 py-1.5 last:border-0">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium text-stone-900">{value}</span>
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
