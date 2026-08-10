import { requireUser } from "@/lib/session";
import { getMyBookings } from "@/lib/booking/my-bookings";
import { BookingRow } from "@/components/customer/booking-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function MyBookingsPage() {
  const user = await requireUser();
  const { upcoming, past, cancelled } = await getMyBookings(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Bookings</h1>
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcoming.length === 0 && <EmptyState label="No upcoming bookings" />}
          {upcoming.map((b) => (
            <BookingRow key={b.id} booking={b} tab="upcoming" />
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
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{label}</p>;
}
