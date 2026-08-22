import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@components/ui/EmptyState'
import { Panel, PanelActionLink } from '@components/ui/Panel'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { useGoals } from '@features/goals/hooks/useGoals'
import { useTasks } from '@features/tasks/hooks/useTasks'
import {
  addDays,
  buildCalendarEvents,
  endOfDay,
  eventsInRange,
  eventsOnDay,
  formatEventTime,
  isSameDay,
  startOfDay,
} from '@features/calendar/utils/calendarEvents'
import { cn } from '@lib/utils'

export function CalendarPanel() {
  const { tasks, loading: tasksLoading } = useTasks()
  const { goals, loading: goalsLoading } = useGoals()

  const today = useMemo(() => startOfDay(new Date()), [])
  const days = useMemo(
    () => Array.from({ length: 4 }, (_, i) => addDays(today, i)),
    [today],
  )

  const weekEvents = useMemo(() => {
    const all = buildCalendarEvents(tasks, goals)
    const start = startOfDay(days[0])
    const end = endOfDay(days[days.length - 1])
    return eventsInRange(all, start, end)
  }, [tasks, goals, days])

  if (tasksLoading || goalsLoading) {
    return (
      <Panel
        title="Calendar"
        accentNavId="calendar"
        fillHeight
        scrollCap
        subtitle="Next 4 days"
        action={<PanelActionLink to="/calendar">Full calendar</PanelActionLink>}
      >
        <PanelSkeleton lines={3} />
      </Panel>
    )
  }

  return (
    <Panel
      title="Calendar"
      accentNavId="calendar"
      fillHeight
      scrollCap
      subtitle="Next 4 days"
      action={<PanelActionLink to="/calendar">Full calendar</PanelActionLink>}
    >
      {weekEvents.length === 0 ? (
        <EmptyState
          compact
          title="Nothing scheduled"
          description="Add due dates to tasks or goals."
          action={
            <Link
              to="/calendar"
              className="text-xs font-medium text-[var(--color-accent-muted)] hover:underline"
            >
              Open calendar
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {days.map((day) => {
            const dayEvents = eventsOnDay(weekEvents, day)
            const isToday = isSameDay(day, today)
            const primary = dayEvents[0]

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[3.5rem] rounded-[var(--radius-sm)] border border-[var(--color-border)] p-1.5',
                  isToday && 'border-[var(--color-border-strong)] bg-[var(--color-accent-subtle)]',
                )}
              >
                <p
                  className={cn(
                    'text-xs text-[var(--color-text-tertiary)]',
                    isToday && 'font-semibold text-[var(--color-text-secondary)]',
                  )}
                >
                  {day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                </p>
                {dayEvents.length === 0 ? (
                  <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">Clear</p>
                ) : (
                  <div className="mt-1.5 min-w-0">
                    <p className="truncate text-xs font-medium text-[var(--color-text-primary)]">
                      {primary.title}
                    </p>
                    <p className="text-xs tabular-nums text-[var(--color-text-tertiary)]">
                      {formatEventTime(primary.at, primary.allDay)}
                    </p>
                    {dayEvents.length > 1 && (
                      <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
                        +{dayEvents.length - 1} more
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Panel>
  )
}
