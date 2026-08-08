import { cn } from '@lib/utils'
import type { CalendarEvent } from '../utils/calendarEvents'
import { eventsOnDay, formatEventTime, formatMonthYear, getWeekDays } from '../utils/calendarEvents'

interface CalendarWeekViewProps {
  anchor: Date
  events: CalendarEvent[]
}

export function CalendarWeekView({ anchor, events }: CalendarWeekViewProps) {
  const days = getWeekDays(anchor)
  const today = new Date()

  return (
    <div>
      <h3 className="mb-3 text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
        {formatMonthYear(anchor)}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {days.map((day) => {
        const dayEvents = eventsOnDay(events, day)
        const isToday =
          day.getFullYear() === today.getFullYear() &&
          day.getMonth() === today.getMonth() &&
          day.getDate() === today.getDate()

        return (
          <div
            key={day.toISOString()}
            className={cn(
              'min-h-[8rem] rounded-[var(--radius-md)] border border-[var(--color-border)] p-3',
              isToday && 'border-[var(--color-accent)]/40 bg-[var(--color-accent-subtle)]/30',
            )}
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
              {day.toLocaleDateString(undefined, { weekday: 'short' })}
            </p>
            <p className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
              {day.getDate()}
            </p>
            <ul className="mt-2 space-y-1.5">
              {dayEvents.length === 0 ? (
                <li className="text-[10px] text-[var(--color-text-tertiary)]">—</li>
              ) : (
                dayEvents.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5"
                  >
                    <p className="truncate text-[11px] font-medium text-[var(--color-text-primary)]">
                      {e.title}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">
                      {formatEventTime(e.at, e.allDay)} · {e.source}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        )
      })}
      </div>
    </div>
  )
}
