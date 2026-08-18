import { requireSalonStaff } from "@/lib/session";
import { getDailyCalendar } from "@/lib/dashboard/calendar";
import { localDateStr } from "@/lib/date";
import { CalendarDatePicker } from "./calendar-date-picker";
import { fraunces } from "@/lib/fonts";

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
        <h1 className={`${fraunces.className} text-2xl font-semibold text-stone-900`}>Calendar</h1>
        <CalendarDatePicker dateStr={dateStr} />
      </div>

      {grid.rows.length === 0 ? (
        <p className="text-sm text-stone-500">Salon is closed on this date.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-100 bg-white shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-stone-50">
                <th className={`${fraunces.className} border-b border-stone-100 p-2 text-left font-semibold text-stone-900`}>Time</th>
                {grid.barbers.map((b) => (
                  <th key={b.id} className={`${fraunces.className} border-b border-stone-100 p-2 text-left font-semibold text-stone-900`}>
                    {b.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.timeLabels.map((label, i) => (
                <tr key={label}>
                  <td className="border-b border-stone-100 p-2 font-medium text-stone-500">{label}</td>
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
  const base = "border-b border-stone-100 p-2";
  if (status === "booked") return `${base} bg-[#7C2D3E]/10 text-[#7C2D3E]`;
  if (status === "blocked") return `${base} bg-amber-50 text-amber-700`;
  return `${base} bg-stone-50/50 text-stone-400`;
}
