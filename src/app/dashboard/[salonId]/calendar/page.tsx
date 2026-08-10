import { requireSalonStaff } from "@/lib/session";
import { getDailyCalendar } from "@/lib/dashboard/calendar";
import { localDateStr } from "@/lib/date";
import { CalendarDatePicker } from "./calendar-date-picker";

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ salonId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { salonId } = await params;
  await requireSalonStaff(salonId);
  const sp = await searchParams;
  const dateStr = sp.date ?? localDateStr(new Date());

  const grid = await getDailyCalendar(salonId, dateStr);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <CalendarDatePicker dateStr={dateStr} />
      </div>

      {grid.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Salon is closed on this date.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border p-2 text-left">Time</th>
                {grid.barbers.map((b) => (
                  <th key={b.id} className="border p-2 text-left">
                    {b.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.timeLabels.map((label, i) => (
                <tr key={label}>
                  <td className="border p-2 font-medium text-muted-foreground">{label}</td>
                  {grid.rows[i].map((cell, j) => (
                    <td key={grid.barbers[j].id} className={cellClass(cell.status)}>
                      {cell.label ?? (cell.status === "available" ? "Available" : "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function cellClass(status: string) {
  const base = "border p-2";
  if (status === "booked") return `${base} bg-red-100 dark:bg-red-950`;
  if (status === "blocked") return `${base} bg-yellow-100 dark:bg-yellow-950`;
  return `${base} bg-green-50 text-muted-foreground dark:bg-green-950/30`;
}
