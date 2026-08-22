import { Panel } from '@components/ui/Panel'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { TabTintChipLink } from '@components/ui/TabTintLink'
import {
  buildCalendarEvents,
  eventsAfterWeek,
  eventsOnDay,
  getWeekDays,
  isSameDay,
  parseCalendarInstant,
} from '@features/calendar/utils/calendarEvents'
import { useGoals } from '@features/goals/hooks/useGoals'
import { useTasks } from '@features/tasks/hooks/useTasks'
import { useNavTabColor } from '@hooks/useNavTabColor'
import { resolveNavTabColor } from '@config/themePalettes'
import { ALL_NAV_TAB_IDS } from '@config/navigation'
import { useUserPreferences } from '@features/preferences'
import { cn } from '@lib/utils'

function CalendarLegend({
  tasksColor,
  goalsColor,
  todayColor,
}: {
  tasksColor: string
  goalsColor: string
  todayColor: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-tertiary)]">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tasksColor }} />
        Tasks
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: goalsColor }} />
        Goals
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 rounded-full ring-1 ring-offset-1 ring-offset-[var(--color-surface-raised)]"
          style={{ backgroundColor: todayColor, boxShadow: `0 0 0 1px ${todayColor}` }}
        />
        Today
      </span>
    </div>
  )
}

export function HomeWeekCalendarPanel() {
  const { tasks, loading: tasksLoading } = useTasks()
  const { goals, loading: goalsLoading } = useGoals()
  const { themePalette, navTabColors, customThemes } = useUserPreferences()
  const tasksColor = useNavTabColor('tasks')
  const goalsColor = useNavTabColor('goals')
  const calendarColor = resolveNavTabColor(
    'calendar',
    themePalette,
    ALL_NAV_TAB_IDS,
    navTabColors,
    customThemes,
  )

  const loading = tasksLoading || goalsLoading
  const today = new Date()
  const weekDays = getWeekDays(today)
  const events = buildCalendarEvents(tasks, goals)
  const ahead = eventsAfterWeek(events, weekDays)

  return (
    <Panel
      title="This week"
      accentNavId="home"
      fillHeight
      scrollCap
      badge={
        !loading ? (
          <CalendarLegend
            tasksColor={tasksColor}
            goalsColor={goalsColor}
            todayColor={calendarColor}
          />
        ) : undefined
      }
      className="home-overview-row-calendar min-h-0"
    >
      {loading ? (
        <PanelSkeleton lines={4} />
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-8 gap-1.5">
          {weekDays.map((day) => {
            const dayEvents = eventsOnDay(events, day)
            const isToday = isSameDay(day, today)
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'flex min-h-0 flex-col rounded-[var(--radius-sm)] border p-1.5',
                  isToday
                    ? 'border-[var(--color-border-strong)] bg-[var(--color-surface-overlay)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-raised)]',
                )}
                style={
                  isToday
                    ? {
                        borderColor: calendarColor,
                        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${calendarColor} 35%, transparent)`,
                      }
                    : undefined
                }
              >
                <p
                  className={cn(
                    'text-center text-xs font-semibold uppercase tracking-wide',
                    isToday ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]',
                  )}
                  style={isToday ? { color: calendarColor } : undefined}
                >
                  {day.toLocaleDateString(undefined, { weekday: 'short' })}
                </p>
                <p className="text-center text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
                  {day.getDate()}
                </p>
                <div className="mt-1 flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain">
                  {dayEvents.length === 0 ? (
                    <p className="py-2 text-center text-xs text-[var(--color-text-tertiary)]">—</p>
                  ) : (
                    dayEvents.slice(0, 4).map((event) => (
                      <TabTintChipLink
                        key={event.id}
                        to={event.href}
                        accentColor={event.source === 'task' ? tasksColor : goalsColor}
                        title={event.title}
                      >
                        {event.title}
                      </TabTintChipLink>
                    ))
                  )}
                </div>
              </div>
            )
          })}

          <div className="flex min-h-0 flex-col rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-1.5">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-text-tertiary)]">
              Ahead
            </p>
            <p className="text-center text-xs text-[var(--color-text-secondary)]">After this week</p>
            <div className="mt-1 min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {ahead.length === 0 ? (
                <p className="px-1 py-2 text-center text-xs text-[var(--color-text-tertiary)]">
                  Clear for now
                </p>
              ) : (
                <ul className="space-y-1">
                  {ahead.map((event) => (
                    <li key={event.id}>
                      <TabTintChipLink
                        to={event.href}
                        accentColor={event.source === 'task' ? tasksColor : goalsColor}
                        title={event.title}
                        className="text-left"
                      >
                        <span className="tabular-nums text-[var(--color-text-tertiary)]">
                          {parseCalendarInstant(event.at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>{' '}
                        {event.title}
                      </TabTintChipLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </Panel>
  )
}
