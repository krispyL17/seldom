import { cn } from '@lib/utils'
import type { CalendarEvent } from '../utils/calendarEvents'
import { eventsOnDay, getMonthGrid } from '../utils/calendarEvents'

interface CalendarMonthViewProps {
  anchor: Date
  events: CalendarEvent[]
}

export function CalendarMonthView({ anchor, events }: CalendarMonthViewProps) {
  const grid = getMonthGrid(anchor)
  const month = anchor.getMonth()
  const today = new Date()

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map((day) => {
          const inMonth = day.getMonth() === month
          const dayEvents = eventsOnDay(events, day)
          const isToday =
            day.getFullYear() === today.getFullYear() &&
            day.getMonth() === today.getMonth() &&
            day.getDate() === today.getDate()

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[4.5rem] rounded-[var(--radius-sm)] border border-[var(--color-border)] p-1.5',
                !inMonth && 'opacity-40',
                isToday && 'border-[var(--color-accent)]/40 bg-[var(--color-accent-subtle)]/20',
              )}
            >
              <span className="text-[11px] font-medium tabular-nums text-[var(--color-text-secondary)]">
                {day.getDate()}
              </span>
              {dayEvents.slice(0, 2).map((e) => (
                <p
                  key={e.id}
                  className="mt-0.5 truncate rounded bg-[var(--color-surface-overlay)] px-1 text-[9px] text-[var(--color-text-primary)]"
                >
                  {e.title}
                </p>
              ))}
              {dayEvents.length > 2 && (
                <p className="text-[9px] text-[var(--color-text-tertiary)]">
                  +{dayEvents.length - 2} more
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
