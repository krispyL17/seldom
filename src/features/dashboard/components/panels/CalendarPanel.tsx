import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Panel, PanelActionLink } from '@components/ui/Panel'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { useGoals } from '@features/goals/hooks/useGoals'
import { useTasks } from '@features/tasks/hooks/useTasks'
import {
  buildCalendarEvents,
  endOfDay,
  eventsInRange,
  eventsOnDay,
  formatEventTime,
  getWeekDays,
  isSameDay,
  startOfDay,
} from '@features/calendar/utils/calendarEvents'
import { cn } from '@lib/utils'

export function CalendarPanel() {
  const { tasks, loading: tasksLoading } = useTasks()
  const { goals, loading: goalsLoading } = useGoals()

  const days = useMemo(() => getWeekDays(new Date()).slice(0, 4), [])
  const today = useMemo(() => new Date(), [])

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
      subtitle="Next 4 days"
      action={<PanelActionLink to="/calendar">Full calendar</PanelActionLink>}
    >
      {weekEvents.length === 0 ? (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          No dated tasks or goals this week.{' '}
          <Link to="/calendar" className="text-[var(--color-accent-muted)] hover:underline">
            Open calendar
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {days.map((day) => {
            const dayEvents = eventsOnDay(weekEvents, day)
            const isToday = isSameDay(day, today)

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'rounded-[var(--radius-sm)] border border-[var(--color-border)] border-l-[3px] border-l-[var(--color-accent)] p-2',
                  isToday && 'bg-[var(--color-accent-subtle)] ring-1 ring-[var(--color-accent)]/30',
                )}
              >
                <p className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
                  {day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                </p>
                {dayEvents.length === 0 ? (
                  <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">—</p>
                ) : (
                  dayEvents.slice(0, 1).map((e) => (
                    <div key={e.id} className="mt-1">
                      <p className="truncate text-[11px] font-medium text-[var(--color-text-primary)]">
                        {e.title}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">
                        {formatEventTime(e.at, e.allDay)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}
    </Panel>
  )
}
