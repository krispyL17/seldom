/** Format a duration given in whole minutes (e.g. 45 → "45m", 60 → "1h", 90 → "1h 30m"). */
export function formatMinutesDuration(minutes: number | null | undefined): string {
  if (minutes == null || minutes < 0) return '—'
  if (minutes === 0) return '0m'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
