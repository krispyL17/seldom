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
  formatEventTime,
  getWeekDays,
  startOfDay,
} from '@features/calendar/utils/calendarEvents'
import { cn } from '@lib/utils'

export function CalendarPanel() {
  const { tasks, loading: tasksLoading } = useTasks()
  const { goals, loading: goalsLoading } = useGoals()

  const weekEvents = useMemo(() => {
    const all = buildCalendarEvents(tasks, goals)
    const days = getWeekDays(new Date())
    const start = startOfDay(days[0])
    const end = endOfDay(days[days.length - 1])
    return eventsInRange(all, start, end)
  }, [tasks, goals])

  const days = getWeekDays(new Date())
  const todayIso = new Date().toISOString().slice(0, 10)

  if (tasksLoading || goalsLoading) {
    return (
      <Panel title="Calendar" subtitle="This week" action={<PanelActionLink to="/calendar">Full calendar</PanelActionLink>}>
        <PanelSkeleton lines={3} />
      </Panel>
    )
  }

  return (
    <Panel
      title="Calendar"
      subtitle="This week"
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {days.map((day) => {
            const iso = day.toISOString().slice(0, 10)
            const dayEvents = weekEvents.filter((e) => e.at.slice(0, 10) === iso)
            const isToday = iso === todayIso

            return (
              <div
                key={iso}
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
                  dayEvents.slice(0, 2).map((e) => (
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
