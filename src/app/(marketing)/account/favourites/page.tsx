import Link from "next/link";
import { Star } from "lucide-react";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { fraunces, outfit } from "@/lib/fonts";

export default async function FavouritesPage() {
  const user = await requireUser();

  const [favouriteSalons, favouriteBarbers] = await Promise.all([
    db.favouriteSalon.findMany({ where: { userId: user.id }, include: { salon: true }, orderBy: { createdAt: "desc" } }),
    db.favouriteBarber.findMany({ where: { userId: user.id }, include: { barber: { include: { salon: true } } }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className={`${outfit.className} min-h-full bg-[#FAF8F5] px-4 py-10 sm:py-14`}>
      <div className="mx-auto max-w-3xl">
        <h1 className={`${fraunces.className} mb-8 text-3xl font-semibold text-stone-900`}>My Favourites</h1>

        <section className="mb-10">
          <h2 className={`${fraunces.className} mb-4 text-lg font-semibold text-stone-900`}>Favourite Salons</h2>
          {favouriteSalons.length === 0 && <p className="text-sm text-stone-500">No favourite salons yet.</p>}
          <div className="space-y-3">
            {favouriteSalons.map(({ salon }) => (
              <div
                key={salon.id}
                className="flex items-center justify-between rounded-2xl border border-stone-100 bg-white p-4 transition-all duration-200 hover:border-stone-200 hover:shadow-md hover:shadow-stone-200/60"
              >
                <div>
                  <Link href={`/salons/${salon.slug}`} className={`${fraunces.className} font-semibold text-stone-900 hover:text-[#7C2D3E]`}>
                    {salon.name}
                  </Link>
                  <p className="text-sm text-stone-500">
                    {salon.suburb}, {salon.state}
                  </p>
                </div>
                <Link
                  href={`/salons/${salon.slug}/book`}
                  className="rounded-xl bg-[#7C2D3E] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98]"
                >
                  Book Again
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={`${fraunces.className} mb-4 text-lg font-semibold text-stone-900`}>Favourite Barbers</h2>
          {favouriteBarbers.length === 0 && <p className="text-sm text-stone-500">No favourite barbers yet.</p>}
          <div className="space-y-3">
            {favouriteBarbers.map(({ barber }) => (
              <div
                key={barber.id}
                className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-4 transition-all duration-200 hover:border-stone-200 hover:shadow-md hover:shadow-stone-200/60"
              >
                <div className={`${fraunces.className} flex size-10 shrink-0 items-center justify-center rounded-full bg-[#7C2D3E]/10 text-sm font-bold text-[#7C2D3E]`}>
                  {barber.name.slice(0, 1)}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/salons/${barber.salon.slug}/barbers/${barber.id}`}
                    className={`${fraunces.className} font-semibold text-stone-900 hover:text-[#7C2D3E]`}
                  >
                    {barber.name}
                  </Link>
                  <p className="flex items-center gap-1 text-sm text-stone-500">
                    {barber.salon.name}
                    {barber.avgRating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {barber.avgRating.toFixed(1)}
                      </span>
                    )}
                  </p>
                </div>
                <Link
                  href={`/salons/${barber.salon.slug}/book?barberId=${barber.id}`}
                  className="rounded-xl bg-[#7C2D3E] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#7C2D3E]/20 transition-all duration-150 hover:bg-[#6B2535] active:scale-[0.98]"
                >
                  Book Again
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
