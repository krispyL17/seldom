/** Human-readable analytics window label for UI copy. */
export function analyticsWeekRangeLabel(weekCount: number): string {
  return weekCount >= 4 ? '4-week' : '2-week'
}

export function analyticsTaskDayCount(weekCount: number): number {
  return weekCount >= 4 ? 14 : 7
}

export function analyticsJournalDayCount(weekCount: number): number {
  return weekCount >= 4 ? 28 : 14
}
