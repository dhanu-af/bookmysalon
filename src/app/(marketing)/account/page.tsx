import Link from "next/link";
import { CalendarClock, Heart } from "lucide-react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { SignOutButton } from "@/components/customer/sign-out-button";

export default async function AccountPage() {
  const sessionUser = await requireUser();
  const user = await db.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  const staffMemberships = await db.salonStaff.findMany({ where: { userId: user.id }, include: { salon: true } });

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">{user.name}</h1>
      <p className="mb-6 text-muted-foreground">{user.email}</p>

      <div className="space-y-2">
        <Link href="/account/bookings">
          <Card className="transition hover:border-foreground/30">
            <CardContent className="flex items-center gap-3 p-4">
              <CalendarClock className="size-5" />
              My Bookings
            </CardContent>
          </Card>
        </Link>
        <Link href="/account/favourites">
          <Card className="transition hover:border-foreground/30">
            <CardContent className="flex items-center gap-3 p-4">
              <Heart className="size-5" />
              My Favourites
            </CardContent>
          </Card>
        </Link>
        {staffMemberships.map((m) => (
          <Link key={m.id} href={m.role === "OWNER" ? `/dashboard/${m.salonId}` : `/dashboard/${m.salonId}/my-bookings`}>
            <Card className="transition hover:border-foreground/30">
              <CardContent className="p-4">
                Manage {m.salon.name} ({m.role === "OWNER" ? "Owner" : "Barber"})
              </CardContent>
            </Card>
          </Link>
        ))}
        {user.isSuperAdmin && (
          <Link href="/admin">
            <Card className="transition hover:border-foreground/30">
              <CardContent className="p-4">Admin Dashboard</CardContent>
            </Card>
          </Link>
        )}
      </div>

      <div className="mt-6">
        <SignOutButton />
      </div>
    </div>
  );
}
