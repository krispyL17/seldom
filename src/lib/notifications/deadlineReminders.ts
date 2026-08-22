/** Calendar-day milestones as a deadline approaches (each fires once). */
export const APPROACH_DAY_THRESHOLDS = [7, 3, 1, 0] as const

export type ApproachDayThreshold = (typeof APPROACH_DAY_THRESHOLDS)[number]

export interface DeadlineReminderItem {
  id: string
  title: string
  /** ISO datetime or YYYY-MM-DD */
  date: string
  subtitle?: string
  href: string
  prefix: string
}

export interface ReminderDispatch {
  key: string
  title: string
  body: string
  kind: 'reminder' | 'deadline'
  href: string
  browserTag?: string
}

/** Parse task/deadline strings to epoch ms (date-only defaults to 5 PM local). */
export function parseDeadlineMs(deadline: string): number | null {
  const trimmed = deadline.trim()
  if (!trimmed) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T17:00:00`).getTime()
  }

  const ms = new Date(trimmed).getTime()
  return Number.isNaN(ms) ? null : ms
}

export function deadlineDatePart(deadline: string): string {
  const trimmed = deadline.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const ms = parseDeadlineMs(trimmed)
  if (ms == null) return trimmed.slice(0, 10)
  const d = new Date(ms)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Whole calendar days until a date (0 = today, negative = past). */
export function daysUntilDate(date: string): number {
  const target = new Date(`${date.slice(0, 10)}T12:00:00`)
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000)
}

export function formatDeadlineLabel(deadline: string): string {
  const ms = parseDeadlineMs(deadline)
  if (ms == null) return deadline
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(deadline.trim())
  return new Date(ms).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(dateOnly
      ? {}
      : {
          hour: 'numeric',
          minute: '2-digit',
        }),
  })
}

function approachLabel(days: ApproachDayThreshold): string {
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days} days`
}

/** Date-based milestones (goals, college, date-only tasks). */
export function collectDateApproachReminders(
  item: DeadlineReminderItem,
  sentIds: Set<string>,
): ReminderDispatch[] {
  const dateKey = item.date.slice(0, 10)
  const days = daysUntilDate(dateKey)
  const out: ReminderDispatch[] = []

  if (days < 0) {
    const key = `${item.prefix}:overdue:${item.id}:${dateKey}`
    if (sentIds.has(key)) return out
    out.push({
      key,
      title: 'Overdue',
      body: `${item.title}${item.subtitle ? ` · ${item.subtitle}` : ''} was due ${formatDeadlineLabel(dateKey)}`,
      kind: 'deadline',
      href: item.href,
      browserTag: key,
    })
    return out
  }

  for (const threshold of APPROACH_DAY_THRESHOLDS) {
    if (days !== threshold) continue
    const key = `${item.prefix}:approach:${item.id}:${dateKey}:${threshold}d`
    if (sentIds.has(key)) continue
    out.push({
      key,
      title: threshold === 0 ? 'Due today' : 'Deadline approaching',
      body: `${item.title}${item.subtitle ? ` · ${item.subtitle}` : ''} — ${approachLabel(threshold)}`,
      kind: threshold <= 1 ? 'deadline' : 'reminder',
      href: item.href,
      browserTag: key,
    })
  }

  return out
}

/** Lead-time + day-of reminders for tasks with a specific due time. */
export function collectTaskReminders(
  task: { id: string; title: string; deadline: string },
  leadMs: number,
  sentIds: Set<string>,
): ReminderDispatch[] {
  const deadlineMs = parseDeadlineMs(task.deadline)
  if (deadlineMs == null) return []

  const now = Date.now()
  const diff = deadlineMs - now
  const dateKey = deadlineDatePart(task.deadline)
  const timeLabel = formatDeadlineLabel(task.deadline)
  const out: ReminderDispatch[] = []

  if (diff < 0) {
    const key = `task:overdue:${task.id}:${task.deadline}`
    if (!sentIds.has(key)) {
      out.push({
        key,
        title: 'Overdue task',
        body: `${task.title} was due ${timeLabel}`,
        kind: 'deadline',
        href: '/tasks',
        browserTag: key,
      })
    }
    return out
  }

  if (diff <= leadMs) {
    const key = `task:lead:${task.id}:${task.deadline}:${leadMs}`
    if (!sentIds.has(key)) {
      out.push({
        key,
        title: 'Task reminder',
        body: `${task.title} — due ${timeLabel}`,
        kind: 'reminder',
        href: '/tasks',
        browserTag: key,
      })
    }
  }

  const days = daysUntilDate(dateKey)
  for (const threshold of APPROACH_DAY_THRESHOLDS) {
    if (days !== threshold) continue
    const key = `task:approach:${task.id}:${dateKey}:${threshold}d`
    if (sentIds.has(key)) continue
    if (threshold === 0 && diff <= leadMs) continue
    out.push({
      key,
      title: threshold === 0 ? 'Due today' : 'Task deadline approaching',
      body: `${task.title} — ${approachLabel(threshold)} (${timeLabel})`,
      kind: threshold <= 1 ? 'deadline' : 'reminder',
      href: '/tasks',
      browserTag: key,
    })
  }

  return out
}
