import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SENT: "default",
  PENDING: "secondary",
  FAILED: "destructive",
};

export default async function AdminNotificationsPage() {
  const notifications = await db.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true },
  });

  const bookingIds = [...new Set(notifications.map((n) => n.bookingId).filter((id): id is string => id !== null))];
  const bookings = await db.booking.findMany({
    where: { id: { in: bookingIds } },
    select: { id: true, reference: true, guestName: true, salon: { select: { name: true } } },
  });
  const bookingById = new Map(bookings.map((b) => [b.id, b]));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Notifications</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Channel</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Booking</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Error</TableHead>
            <TableHead>Sent / created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.map((n) => {
            const booking = n.bookingId ? bookingById.get(n.bookingId) : undefined;
            const error = n.payload && typeof n.payload === "object" && "error" in n.payload ? String(n.payload.error) : null;
            return (
              <TableRow key={n.id}>
                <TableCell>{n.channel}</TableCell>
                <TableCell>{n.type}</TableCell>
                <TableCell>{n.user?.name ?? n.user?.email ?? booking?.guestName ?? "—"}</TableCell>
                <TableCell>
                  {booking ? (
                    <span>
                      {booking.reference} <span className="text-muted-foreground">({booking.salon.name})</span>
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[n.status]}>{n.status}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">{error ?? "—"}</TableCell>
                <TableCell>{(n.sentAt ?? n.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {notifications.length === 0 && <p className="mt-4 text-muted-foreground">No notifications sent yet.</p>}
    </div>
  );
}
