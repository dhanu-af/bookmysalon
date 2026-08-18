import { requireSalonOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { formatPriceCents } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { fraunces } from "@/lib/fonts";

export default async function SettingsPage({ params }: { params: Promise<{ salonId: string }> }) {
  const { salonId } = await params;
  await requireSalonOwner(salonId);

  const [subscription, allPlans, onlineBarberCount] = await Promise.all([
    db.salonSubscription.findUnique({ where: { salonId }, include: { plan: true } }),
    db.subscriptionPlan.findMany({ orderBy: { priceCentsMonthly: "asc" } }),
    db.barber.count({ where: { salonId, bookableOnline: true } }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className={`${fraunces.className} mb-1 text-2xl font-semibold text-stone-900`}>Settings</h1>
      <p className="mb-6 text-sm text-stone-500">
        Billing isn&apos;t live yet — no card is charged. This is a preview of the plans we&apos;ll offer.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {allPlans.map((plan) => {
          const isCurrent = subscription?.planId === plan.id;
          return (
            <div
              key={plan.id}
              className={`space-y-3 rounded-2xl border bg-white p-4 shadow-sm ${isCurrent ? "border-[#7C2D3E]" : "border-stone-100"}`}
            >
              <div className="flex items-center justify-between">
                <p className={`${fraunces.className} font-semibold text-stone-900`}>{plan.name}</p>
                {isCurrent && <Badge>Current plan</Badge>}
              </div>
              <p className={`${fraunces.className} text-2xl font-semibold text-stone-900`}>
                {plan.priceCentsMonthly === 0 ? "Free" : formatPriceCents(plan.priceCentsMonthly)}
                {plan.priceCentsMonthly > 0 && <span className="text-sm font-normal text-stone-500">/mo</span>}
              </p>
              <ul className="space-y-1.5 text-sm">
                <FeatureRow ok label={`${plan.maxOnlineBarbers} online barber${plan.maxOnlineBarbers > 1 ? "s" : ""}`} />
                <FeatureRow ok={plan.smsEnabled} label="SMS reminders" />
                <FeatureRow ok={plan.advancedAnalytics} label="Advanced analytics" />
              </ul>
              <button
                type="button"
                disabled
                className="w-full rounded-lg border-2 border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 disabled:pointer-events-none disabled:opacity-50"
              >
                {isCurrent ? "Current plan" : "Coming soon"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-stone-500">
        Currently using {onlineBarberCount} of {subscription?.plan.maxOnlineBarbers ?? 2} online-bookable barber slots.
      </p>
    </div>
  );
}

function FeatureRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      {ok ? <Check className="size-4 text-green-600" /> : <X className="size-4 text-stone-400" />}
      <span className={ok ? "text-stone-700" : "text-stone-400"}>{label}</span>
    </li>
  );
}
