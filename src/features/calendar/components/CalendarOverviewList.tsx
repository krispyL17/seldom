import { Link } from 'react-router-dom'
import type { CalendarEvent } from '../utils/calendarEvents'
import { formatEventDate, formatEventTime } from '../utils/calendarEvents'

interface CalendarOverviewListProps {
  events: CalendarEvent[]
}

export function CalendarOverviewList({ events }: CalendarOverviewListProps) {
  const upcoming = events.filter((e) => new Date(e.at).getTime() >= Date.now() - 86400000)

  if (upcoming.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">
        No dated tasks or goals yet. Add deadlines on the{' '}
        <Link to="/tasks" className="text-[var(--color-accent-muted)] hover:underline">
          Tasks
        </Link>{' '}
        or{' '}
        <Link to="/goals" className="text-[var(--color-accent-muted)] hover:underline">
          Goals
        </Link>{' '}
        pages.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-[var(--color-border)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      {upcoming.map((e) => (
        <li key={e.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
              {e.title}
            </p>
            <p className="text-xs capitalize text-[var(--color-text-tertiary)]">{e.source}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-medium text-[var(--color-text-secondary)]">
              {formatEventDate(e.at)}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {formatEventTime(e.at, e.allDay)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
