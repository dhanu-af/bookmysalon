import Link from "next/link";
import { requireSuperAdmin } from "@/lib/session";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/approvals", label: "Approvals" },
  { href: "/admin/salons", label: "Salons" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/admins", label: "Admins" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b bg-muted/30 p-4 md:w-56 md:border-b-0 md:border-r">
        <p className="mb-4 font-semibold">Admin</p>
        <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
