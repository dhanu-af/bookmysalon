import Link from "next/link";
import { Heart, Home, Search, CalendarClock, User } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Find a Salon", icon: Search },
  { href: "/account/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/account/favourites", label: "Favourites", icon: Heart },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <>
      {/* Desktop top nav */}
      <header className="hidden border-b bg-background/95 backdrop-blur md:block sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            BookMySalon
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            {NAV_ITEMS.slice(1).map((item) => (
              <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/account">
                <Button variant="outline" size="sm">
                  <User className="size-4" />
                  {user.name ?? "Account"}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register/salon">
                  <Button variant="outline" size="sm">
                    I&apos;m a Salon Owner
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b bg-background px-4 py-3 md:hidden sticky top-0 z-40">
        <Link href="/" className="text-lg font-bold tracking-tight">
          BookMySalon
        </Link>
        {user ? (
          <Link href="/account">
            <User className="size-5" />
          </Link>
        ) : (
          <Link href="/login" className="text-sm font-medium">
            Sign in
          </Link>
        )}
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background md:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        ))}
        <Link
          href={user ? "/account" : "/login"}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <User className="size-5" />
          Profile
        </Link>
      </nav>
    </>
  );
}
