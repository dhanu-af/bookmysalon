import { getPublicSalonBySlug } from "@/lib/salon-profile";
import { getCurrentUser } from "@/lib/session";
import { BookingWizard } from "./booking-wizard";

export default async function BookSalonPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ barberId?: string; serviceId?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const salon = await getPublicSalonBySlug(slug);
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Book at {salon.name}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {salon.suburb}, {salon.state}
      </p>
      <BookingWizard
        salon={{ id: salon.id, slug: salon.slug, name: salon.name, timezone: salon.timezone }}
        services={salon.services.map((s) => ({ id: s.id, name: s.name, priceCents: s.priceCents, durationMinutes: s.durationMinutes }))}
        barbers={salon.barbers.map((b) => ({ id: b.id, name: b.name, title: b.title }))}
        initialBarberId={sp.barberId}
        initialServiceId={sp.serviceId}
        loggedInUser={user ? { id: user.id, name: user.name ?? "", email: user.email ?? "" } : null}
      />
    </div>
  );
}
