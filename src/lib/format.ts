export function formatPriceCents(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}
