/** Encode milestone ↔ task link in task.notes (no schema migration). */
export const MILESTONE_TASK_NOTE_PREFIX = '__seldom_milestone__:'

export function milestoneTaskNote(milestoneId: string): string {
  return `${MILESTONE_TASK_NOTE_PREFIX}${milestoneId}`
}

export function parseMilestoneIdFromTaskNotes(notes: string | null): string | null {
  if (!notes?.startsWith(MILESTONE_TASK_NOTE_PREFIX)) return null
  return notes.slice(MILESTONE_TASK_NOTE_PREFIX.length).trim() || null
}

export function isMilestoneTask(notes: string | null): boolean {
  return Boolean(notes?.startsWith(MILESTONE_TASK_NOTE_PREFIX))
}

/** Monday = start of week */
export function dayOfWeekIndex(date = new Date()): number {
  const d = date.getDay()
  return d === 0 ? 6 : d - 1
}

/** True Mon–Wed (early week), false Thu–Sun */
export function isEarlyWeek(date = new Date()): boolean {
  return dayOfWeekIndex(date) <= 2
}

export function endOfWeekSunday(date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const daysUntilSunday = day === 0 ? 0 : 7 - day
  d.setDate(d.getDate() + daysUntilSunday)
  return d.toISOString().slice(0, 10)
}

export function startOfWeekMonday(date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}
