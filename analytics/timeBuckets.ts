/**
 * Time bucketing helpers for analytics charts.
 */

export function lastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export function dayLabel(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' })
}

export function lastNWeeks(n: number): { start: string; label: string }[] {
  const weeks: { start: string; label: string }[] = []
  const now = new Date()

  for (let i = n - 1; i >= 0; i -= 1) {
    const start = new Date(now)
    start.setDate(start.getDate() - i * 7 - start.getDay())
    const iso = start.toISOString().slice(0, 10)
    weeks.push({ start: iso, label: `W${n - i}` })
  }

  return weeks
}

export function isoInWeek(dateIso: string, weekStartIso: string): boolean {
  const date = new Date(`${dateIso}T12:00:00`)
  const start = new Date(`${weekStartIso}T12:00:00`)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return date >= start && date < end
}

export function dateInDay(dateIso: string, dayIso: string): boolean {
  return dateIso.slice(0, 10) === dayIso.slice(0, 10)
}
