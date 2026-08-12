import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { formatPriceCents } from "@/lib/format";
import { fraunces } from "@/lib/fonts";

export default async function BookingConfirmationPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;

  const booking = await db.booking.findUnique({
    where: { reference },
    include: { salon: true, barber: true },
  });
  if (!booking) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-14 text-center sm:py-20">
      <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
      <h1 className={`${fraunces.className} mt-4 text-2xl font-semibold text-stone-900`}>Booking confirmed!</h1>
      <p className="mt-1 text-stone-500">Your booking reference</p>
      <p className={`${fraunces.className} mt-1 text-3xl font-bold tracking-wide text-[#7C2D3E]`}>{booking.reference}</p>

      <div className="mt-6 space-y-2 rounded-2xl border border-stone-100 bg-white p-5 text-left text-sm shadow-sm">
        <Row label="Salon" value={booking.salon.name} />
        <Row label="Barber" value={booking.barber.name} />
        <Row label="Service" value={booking.serviceNameSnapshot} />
        <Row label="When" value={formatDateTime(booking.startAt, booking.salon.timezone)} />
        <Row label="Price" value={formatPriceCents(booking.priceCentsSnapshot)} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href={`/salons/${booking.salon.slug}`}
          className="rounded-xl border-2 border-stone-300 py-3 text-sm font-medium text-stone-700 transition-all duration-150 hover:border-stone-400 hover:text-stone-900"
        >
          View Salon
        </Link>
        <Link
          href="/register"
          className="rounded-xl bg-[#7C2D3E] py-3 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98]"
        >
          Create an account to manage this booking
        </Link>
      </div>
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
