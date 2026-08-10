import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPriceCents } from "@/lib/format";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CONFIRMED: "default",
  PENDING: "secondary",
  ARRIVED: "secondary",
  IN_SERVICE: "secondary",
  COMPLETED: "outline",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
};

export default async function AdminBookingsPage() {
  const bookings = await db.booking.findMany({
    orderBy: { startAt: "desc" },
    take: 200,
    include: { salon: true, barber: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Bookings</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Salon</TableHead>
            <TableHead>Barber</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>When</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((b) => (
            <TableRow key={b.id}>
              <TableCell>{b.reference}</TableCell>
              <TableCell>{b.salon.name}</TableCell>
              <TableCell>{b.barber.name}</TableCell>
              <TableCell>{b.guestName}</TableCell>
              <TableCell>{b.startAt.toLocaleString()}</TableCell>
              <TableCell>{formatPriceCents(b.priceCentsSnapshot)}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[b.status]}>{b.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
