import type { Goal, Milestone } from '@features/goals/types'
import type { Task } from '@features/tasks/types'

export type CalendarEventSource = 'task' | 'goal' | 'milestone'

export interface CalendarEvent {
  id: string
  source: CalendarEventSource
  title: string
  at: string
  allDay: boolean
  category?: string | null
  completed?: boolean
  href: string
  goalId?: string
  milestoneId?: string
}

/** Parse calendar timestamps without UTC date-only drift (YYYY-MM-DD → local noon). */
export function parseCalendarInstant(at: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(at)) {
    return new Date(`${at}T12:00:00`)
  }
  return new Date(at)
}

export function taskToCalendarEvent(task: Task): CalendarEvent | null {
  if (!task.deadline || task.completed) return null
  const at = /^\d{4}-\d{2}-\d{2}$/.test(task.deadline)
    ? `${task.deadline}T12:00:00`
    : task.deadline
  return {
    id: `task-${task.id}`,
    source: 'task',
    title: task.title,
    at,
    allDay: !task.deadline.includes('T') || task.deadline.endsWith('T00:00:00'),
    category: task.category,
    completed: task.completed,
    href: '/tasks',
  }
}

export function milestoneToCalendarEvent(goal: Goal, milestone: Milestone): CalendarEvent | null {
  if (!milestone.target_date || milestone.completed || goal.status !== 'active') return null
  const at = milestone.target_date.includes('T')
    ? milestone.target_date
    : `${milestone.target_date}T12:00:00`
  return {
    id: `milestone-${goal.id}-${milestone.id}`,
    source: 'milestone',
    title: milestone.title,
    at,
    allDay: !milestone.target_date.includes('T'),
    category: goal.category,
    href: '/goals',
    goalId: goal.id,
    milestoneId: milestone.id,
  }
}

export function goalToCalendarEvent(goal: Goal): CalendarEvent | null {
  if (!goal.target_date || goal.status !== 'active') return null
  return {
    id: `goal-${goal.id}`,
    source: 'goal',
    title: goal.title,
    at: goal.target_date.includes('T') ? goal.target_date : `${goal.target_date}T12:00:00`,
    allDay: !goal.target_date.includes('T'),
    category: goal.category,
    href: '/goals',
  }
}

export function buildCalendarEvents(tasks: Task[], goals: Goal[]): CalendarEvent[] {
  const events: CalendarEvent[] = []
  for (const task of tasks) {
    const e = taskToCalendarEvent(task)
    if (e) events.push(e)
  }
  for (const goal of goals) {
    for (const milestone of goal.milestones) {
      const me = milestoneToCalendarEvent(goal, milestone)
      if (me) events.push(me)
    }
    const e = goalToCalendarEvent(goal)
    if (e) events.push(e)
  }
  return events.sort((a, b) => a.at.localeCompare(b.at))
}

/** Events strictly after the current week (from next Monday onward). */
export function eventsAfterWeek(events: CalendarEvent[], weekDays: Date[]): CalendarEvent[] {
  if (weekDays.length === 0) return []
  const lastDay = weekDays[weekDays.length - 1]!
  const cutoff = endOfDay(lastDay)
  return events.filter((e) => parseCalendarInstant(e.at).getTime() > cutoff.getTime())
}

export function getWeekDaysPlusOne(anchor: Date): Date[] {
  return [...getWeekDays(anchor), addDays(getWeekDays(anchor)[6]!, 1)]
}

export function startOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function endOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(23, 59, 59, 999)
  return copy
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function formatEventTime(at: string, allDay: boolean): string {
  if (allDay) return 'All day'
  const date = parseCalendarInstant(at)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function formatEventDate(at: string): string {
  const date = parseCalendarInstant(at)
  if (Number.isNaN(date.getTime())) return at.slice(0, 10)
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function getWeekDays(anchor: Date): Date[] {
  const start = startOfDay(anchor)
  const day = start.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = addDays(start, mondayOffset)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

export function getMonthGrid(anchor: Date): Date[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const start = startOfDay(first)
  const day = start.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const gridStart = addDays(start, mondayOffset)
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
}

export function eventsOnDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((e) => isSameDay(parseCalendarInstant(e.at), day))
}

export function eventsInRange(events: CalendarEvent[], start: Date, end: Date): CalendarEvent[] {
  return events.filter((e) => {
    const t = parseCalendarInstant(e.at).getTime()
    return t >= start.getTime() && t <= end.getTime()
  })
}

export function downloadIcsCalendar(events: CalendarEvent[], filename = 'seldom-calendar.ics'): void {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Seldom//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const event of events) {
    const start = new Date(event.at)
    const uid = `${event.id}@seldom.app`
    const dtStamp = formatIcsUtc(new Date())
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${uid}`)
    lines.push(`DTSTAMP:${dtStamp}`)
    if (event.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${formatIcsDate(start)}`)
      lines.push(`DTEND;VALUE=DATE:${formatIcsDate(addDays(start, 1))}`)
    } else {
      lines.push(`DTSTART:${formatIcsUtc(start)}`)
      lines.push(`DTEND:${formatIcsUtc(new Date(start.getTime() + 60 * 60 * 1000))}`)
    }
    lines.push(`SUMMARY:${escapeIcs(event.title)}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatIcsDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

function formatIcsUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}
