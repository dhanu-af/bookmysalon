import { requireUser } from "@/lib/session";
import { getMyBookings } from "@/lib/booking/my-bookings";
import { getQueuePosition } from "@/lib/booking/queue-position";
import { BookingRow } from "@/components/customer/booking-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fraunces, outfit } from "@/lib/fonts";

export default async function MyBookingsPage() {
  const user = await requireUser();
  const { upcoming, past, cancelled } = await getMyBookings(user.id);

  const queuePositions = Object.fromEntries(
    await Promise.all(
      upcoming.filter((b) => b.status === "ARRIVED").map(async (b) => [b.id, await getQueuePosition(b.id)] as const)
    )
  );

  return (
    <div className={`${outfit.className} min-h-full bg-[#FAF8F5] px-4 py-10 sm:py-14`}>
      <div className="mx-auto max-w-3xl">
        <h1 className={`${fraunces.className} mb-8 text-3xl font-semibold text-stone-900`}>My Bookings</h1>
        <Tabs defaultValue="upcoming">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="upcoming" className="data-active:text-[#7C2D3E]">
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="data-active:text-[#7C2D3E]">
              Past ({past.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-active:text-[#7C2D3E]">
              Cancelled ({cancelled.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {upcoming.length === 0 && <EmptyState label="No upcoming bookings" />}
            {upcoming.map((b) => (
              <BookingRow key={b.id} booking={b} tab="upcoming" queuePosition={queuePositions[b.id] ?? null} />
            ))}
          </TabsContent>
          <TabsContent value="past" className="mt-4 space-y-3">
            {past.length === 0 && <EmptyState label="No past bookings yet" />}
            {past.map((b) => (
              <BookingRow key={b.id} booking={b} tab="past" />
            ))}
          </TabsContent>
          <TabsContent value="cancelled" className="mt-4 space-y-3">
            {cancelled.length === 0 && <EmptyState label="No cancelled bookings" />}
            {cancelled.map((b) => (
              <BookingRow key={b.id} booking={b} tab="cancelled" />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="py-8 text-center text-sm text-stone-500">{label}</p>;
}
