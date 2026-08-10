import Link from "next/link";
import { requireSalonStaff } from "@/lib/session";
import { db } from "@/lib/db";

const OWNER_NAV = [
  { href: "", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/bookings", label: "Bookings" },
  { href: "/barbers", label: "Barbers" },
  { href: "/services", label: "Services" },
  { href: "/profile", label: "Salon Profile" },
  { href: "/hours", label: "Opening Hours" },
  { href: "/blocked-times", label: "Blocked Times" },
];

const BARBER_NAV = [
  { href: "", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/bookings", label: "My Bookings" },
];

export default async function SalonDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ salonId: string }>;
}) {
  const { salonId } = await params;
  const { staff } = await requireSalonStaff(salonId);
  const salon = await db.salon.findUniqueOrThrow({ where: { id: salonId } });
  const nav = staff.role === "OWNER" ? OWNER_NAV : BARBER_NAV;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b bg-muted/30 p-4 md:w-56 md:border-b-0 md:border-r">
        <p className="mb-4 font-semibold">{salon.name}</p>
        <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={`/dashboard/${salonId}${item.href}`}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
