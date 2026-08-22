/** ISO date for local today (YYYY-MM-DD). */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/** First calendar day of a rolling window of `days` days ending today (inclusive). */
export function rollingWindowStartIso(days: number): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - (days - 1))
  return d.toISOString().slice(0, 10)
}

export function yesterdayIso(): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

/** Whether `date` falls in the rolling N-day window through today. */
export function isWithinRollingDays(date: string, days: number): boolean {
  return date >= rollingWindowStartIso(days) && date <= todayIso()
}
