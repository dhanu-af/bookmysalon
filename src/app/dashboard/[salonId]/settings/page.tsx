import { requireSalonOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { formatPriceCents } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

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
      <h1 className="mb-1 text-2xl font-bold">Settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Billing isn&apos;t live yet — no card is charged. This is a preview of the plans we&apos;ll offer.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {allPlans.map((plan) => {
          const isCurrent = subscription?.planId === plan.id;
          return (
            <Card key={plan.id} className={isCurrent ? "border-foreground" : ""}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{plan.name}</p>
                  {isCurrent && <Badge>Current plan</Badge>}
                </div>
                <p className="text-2xl font-bold">
                  {plan.priceCentsMonthly === 0 ? "Free" : formatPriceCents(plan.priceCentsMonthly)}
                  {plan.priceCentsMonthly > 0 && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                </p>
                <ul className="space-y-1.5 text-sm">
                  <FeatureRow ok label={`${plan.maxOnlineBarbers} online barber${plan.maxOnlineBarbers > 1 ? "s" : ""}`} />
                  <FeatureRow ok={plan.smsEnabled} label="SMS reminders" />
                  <FeatureRow ok={plan.advancedAnalytics} label="Advanced analytics" />
                </ul>
                <Button className="w-full" variant={isCurrent ? "outline" : "default"} disabled>
                  {isCurrent ? "Current plan" : "Coming soon"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Currently using {onlineBarberCount} of {subscription?.plan.maxOnlineBarbers ?? 2} online-bookable barber slots.
      </p>
    </div>
  );
}

function FeatureRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      {ok ? <Check className="size-4 text-green-600" /> : <X className="size-4 text-muted-foreground" />}
      <span className={ok ? "" : "text-muted-foreground"}>{label}</span>
    </li>
  );
}
