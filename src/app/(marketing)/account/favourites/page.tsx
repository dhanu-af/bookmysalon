import Link from "next/link";
import { Star } from "lucide-react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function FavouritesPage() {
  const user = await requireUser();

  const [favouriteSalons, favouriteBarbers] = await Promise.all([
    db.favouriteSalon.findMany({ where: { userId: user.id }, include: { salon: true }, orderBy: { createdAt: "desc" } }),
    db.favouriteBarber.findMany({ where: { userId: user.id }, include: { barber: { include: { salon: true } } }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Favourites</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Favourite Salons</h2>
        {favouriteSalons.length === 0 && <p className="text-sm text-muted-foreground">No favourite salons yet.</p>}
        <div className="space-y-2">
          {favouriteSalons.map(({ salon }) => (
            <Card key={salon.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <Link href={`/salons/${salon.slug}`} className="font-medium hover:underline">
                    {salon.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {salon.suburb}, {salon.state}
                  </p>
                </div>
                <Link href={`/salons/${salon.slug}/book`}>
                  <Button size="sm">Book Again</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Favourite Barbers</h2>
        {favouriteBarbers.length === 0 && <p className="text-sm text-muted-foreground">No favourite barbers yet.</p>}
        <div className="space-y-2">
          {favouriteBarbers.map(({ barber }) => (
            <Card key={barber.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <Avatar>
                  <AvatarFallback>{barber.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link href={`/salons/${barber.salon.slug}/barbers/${barber.id}`} className="font-medium hover:underline">
                    {barber.name}
                  </Link>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    {barber.salon.name}
                    {barber.avgRating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {barber.avgRating.toFixed(1)}
                      </span>
                    )}
                  </p>
                </div>
                <Link href={`/salons/${barber.salon.slug}/book?barberId=${barber.id}`}>
                  <Button size="sm">Book Again</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
