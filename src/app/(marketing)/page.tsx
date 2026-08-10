import Link from "next/link";
import { SearchForm } from "@/components/customer/search-form";
import { NearbySalons } from "@/components/customer/nearby-salons";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-muted/60 to-background px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Skip the Queue. Book Your Salon.</h1>
          <p className="mt-4 text-balance text-muted-foreground sm:text-lg">
            Find nearby salons, choose your barber and book a time that works for you.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-3xl">
          <SearchForm />
        </div>
        <div className="mt-4 flex justify-center">
          <Link href="/register/salon">
            <Button variant="link">I&apos;m a Salon Owner</Button>
          </Link>
        </div>
      </section>

      <NearbySalons />

      <section className="border-t bg-muted/30 px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 text-center sm:grid-cols-3">
          <div>
            <p className="text-2xl font-bold">Find it</p>
            <p className="mt-1 text-sm text-muted-foreground">Search by service, salon, barber or location.</p>
          </div>
          <div>
            <p className="text-2xl font-bold">Choose it</p>
            <p className="mt-1 text-sm text-muted-foreground">Compare real-time availability, price and ratings.</p>
          </div>
          <div>
            <p className="text-2xl font-bold">Book it</p>
            <p className="mt-1 text-sm text-muted-foreground">Confirm in seconds — no account required.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
