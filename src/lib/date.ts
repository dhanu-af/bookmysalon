/**
 * Calendar-date (Y-M-D) extraction, deliberately NOT via `date.toISOString()`.
 * toISOString() converts to UTC first — on a machine/salon in a positive UTC
 * offset (all of Australia), that silently rolls the date back by one
 * whenever local time is past midnight but UTC hasn't rolled over yet,
 * which would make "today" resolve to yesterday for hours after midnight.
 */

/** The calendar date `d` represents in the browser/machine's own local timezone. */
export function localDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** The calendar date `d` represents in an arbitrary IANA timezone (e.g. a salon's). */
export function dateStrInZone(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(d); // en-CA -> yyyy-MM-dd
}
