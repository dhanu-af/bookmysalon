import Link from "next/link";
import { Heart, Home, Search, CalendarClock, User } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { fraunces } from "@/lib/fonts";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Find a Salon", icon: Search },
  { href: "/account/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/account/favourites", label: "Favourites", icon: Heart },
];

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-[10px] bg-[#7C2D3E] shadow-md shadow-[#7C2D3E]/30">
        <span className={`${fraunces.className} text-base font-bold leading-none text-white`}>B</span>
      </span>
      <span className={`${fraunces.className} text-xl font-semibold tracking-tight text-stone-900`}>BookMySalon</span>
    </Link>
  );
}

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <>
      {/* Desktop top nav */}
      <header className="hidden border-b border-stone-200 bg-[#FAF8F5]/95 backdrop-blur md:block sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-6 text-sm font-medium">
            {NAV_ITEMS.slice(1).map((item) => (
              <Link key={item.href} href={item.href} className="text-stone-600 hover:text-stone-900">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/account"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-all duration-150 hover:border-stone-400 hover:text-stone-900"
              >
                <User className="size-4" />
                {user.name ?? "Account"}
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition-all hover:bg-stone-100/80 hover:text-stone-900">
                  Sign in
                </Link>
                <Link
                  href="/register/salon"
                  className="inline-flex items-center justify-center rounded-xl bg-[#7C2D3E] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98]"
                >
                  I&apos;m a Salon Owner
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-stone-200 bg-[#FAF8F5] px-4 py-3 md:hidden sticky top-0 z-40">
        <Logo />
        {user ? (
          <Link href="/account">
            <User className="size-5 text-stone-700" />
          </Link>
        ) : (
          <Link href="/login" className="text-sm font-medium text-stone-700">
            Sign in
          </Link>
        )}
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-stone-200 bg-white/95 backdrop-blur md:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] text-stone-500 hover:text-[#7C2D3E]"
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        ))}
        <Link
          href={user ? "/account" : "/login"}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] text-stone-500 hover:text-[#7C2D3E]"
        >
          <User className="size-5" />
          Profile
        </Link>
      </nav>
    </>
  );
}
