import Link from "next/link";
import { CalendarClock, Heart, ChevronRight, ShieldCheck, Scissors } from "lucide-react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { SignOutButton } from "@/components/customer/sign-out-button";
import { fraunces, outfit } from "@/lib/fonts";

export default async function AccountPage() {
  const sessionUser = await requireUser();
  const user = await db.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  const staffMemberships = await db.salonStaff.findMany({ where: { userId: user.id }, include: { salon: true } });

  const initial = (user.name ?? user.email).slice(0, 1).toUpperCase();

  return (
    <div className={`${outfit.className} min-h-full bg-[#FAF8F5] px-4 py-10 sm:py-14`}>
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex items-center gap-4">
          <div className={`${fraunces.className} flex size-14 shrink-0 items-center justify-center rounded-full bg-[#7C2D3E] text-xl font-bold text-white`}>
            {initial}
          </div>
          <div>
            <h1 className={`${fraunces.className} text-2xl font-semibold text-stone-900`}>{user.name}</h1>
            <p className="text-sm text-stone-500">{user.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <AccountLink href="/account/bookings" icon={<CalendarClock className="size-5" />} label="My Bookings" />
          <AccountLink href="/account/favourites" icon={<Heart className="size-5" />} label="My Favourites" />

          {staffMemberships.map((m) => (
            <AccountLink
              key={m.id}
              href={m.role === "OWNER" ? `/dashboard/${m.salonId}` : `/dashboard/${m.salonId}/my-bookings`}
              icon={<Scissors className="size-5" />}
              label={`Manage ${m.salon.name}`}
              sublabel={m.role === "OWNER" ? "Owner" : "Barber"}
            />
          ))}

          {user.isSuperAdmin && (
            <AccountLink href="/admin" icon={<ShieldCheck className="size-5" />} label="Admin Dashboard" highlight />
          )}
        </div>

        <div className="mt-8">
          <SignOutButton className="rounded-xl border-stone-300 text-stone-700 hover:border-stone-400 hover:text-stone-900" />
        </div>
      </div>
    </div>
  );
}

function AccountLink({
  href,
  icon,
  label,
  sublabel,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-2xl border p-4 transition-all duration-200 ${
        highlight
          ? "border-[#7C2D3E]/20 bg-[#7C2D3E]/5 hover:border-[#7C2D3E]/40 hover:shadow-md hover:shadow-stone-200/60"
          : "border-stone-100 bg-white hover:border-stone-200 hover:shadow-md hover:shadow-stone-200/60"
      }`}
    >
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${highlight ? "bg-[#7C2D3E] text-white" : "bg-[#FAF8F5] text-[#7C2D3E]"}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-stone-900">{label}</p>
        {sublabel && <p className="text-xs text-stone-500">{sublabel}</p>}
      </div>
      <ChevronRight className="size-4 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-stone-400" />
    </Link>
  );
}
