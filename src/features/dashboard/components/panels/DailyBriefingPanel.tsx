import { Link } from 'react-router-dom'
import { Panel, PanelActionLink } from '@components/ui/Panel'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { useTasks } from '@features/tasks/hooks/useTasks'
import { useGoals } from '@features/goals/hooks/useGoals'
import { useDashboardInsights } from '@features/analytics/hooks/useDashboardInsights'
import { cn } from '@lib/utils'

const STAT_LINK =
  'rounded-[var(--radius-sm)] text-sm font-semibold tabular-nums text-[var(--color-text-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'

const TONE_CLASS = {
  strong: 'text-[var(--color-success)]',
  mixed: 'text-[var(--color-warning)]',
  quiet: 'text-[var(--color-text-tertiary)]',
  urgent: 'text-[var(--color-danger)]',
} as const

function todayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function nextUpMessage(
  overdueCount: number,
  openCount: number,
  activeGoalCount: number,
): string {
  if (overdueCount > 0) {
    return overdueCount === 1
      ? '1 task is overdue — tackle it first.'
      : `${overdueCount} tasks are overdue — start there.`
  }
  if (openCount > 0) {
    return openCount === 1 ? '1 open task on your list.' : `${openCount} open tasks on your list.`
  }
  if (activeGoalCount === 0) {
    return 'Nothing queued yet — add a task or goal to get moving.'
  }
  return 'No open tasks right now. Keep logging in Performance and Journal.'
}

export function DailyBriefingPanel() {
  const { tasks, loading: tasksLoading } = useTasks()
  const { goals, loading: goalsLoading } = useGoals()
  const { insights, loading: insightsLoading } = useDashboardInsights()
  const loading = tasksLoading || goalsLoading

  const today = new Date().toISOString().slice(0, 10)
  const openTasks = tasks.filter((t) => !t.completed)
  const overdueTasks = openTasks.filter((t) => t.deadline && t.deadline.slice(0, 10) < today)
  const activeGoals = goals.filter((g) => g.status === 'active')

  const rows = [
    { label: 'Open tasks', value: openTasks.length, href: '/tasks' },
    {
      label: 'Overdue',
      value: overdueTasks.length,
      href: '/tasks',
      warn: overdueTasks.length > 0,
    },
    { label: 'Active goals', value: activeGoals.length, href: '/goals' },
  ]

  const allClear = openTasks.length === 0 && activeGoals.length === 0
  const headline = insights?.weekHeadline

  return (
    <Panel
      title="Today"
      accentNavId="home"
      subtitle={loading ? 'Loading…' : todayLabel()}
      className="panel--compact lg:col-span-3"
      action={
        loading ? undefined : overdueTasks.length > 0 ? (
          <PanelActionLink to="/tasks">View overdue</PanelActionLink>
        ) : allClear ? (
          <PanelActionLink to="/tasks?new=1">Add task</PanelActionLink>
        ) : (
          <PanelActionLink to="/assistant">Ask Seldom</PanelActionLink>
        )
      }
    >
      {loading ? (
        <PanelSkeleton lines={2} />
      ) : (
        <>
          {!insightsLoading && headline && (
            <p className="mb-2 text-xs leading-relaxed">
              <span className={cn('font-semibold', TONE_CLASS[headline.tone])}>
                {headline.adjective}
              </span>
              <span className="text-[var(--color-text-secondary)]"> — {headline.sentence}</span>
            </p>
          )}
          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {nextUpMessage(overdueTasks.length, openTasks.length, activeGoals.length)}
          </p>
          <dl className="mt-2 grid grid-cols-3 gap-3 border-t border-[var(--color-border)] pt-2 sm:gap-4">
            {rows.map((row) => (
              <div key={row.label}>
                <dt className="text-xs font-medium text-[var(--color-text-tertiary)]">
                  {row.label}
                </dt>
                <dd className="mt-1">
                  <Link
                    to={row.href}
                    className={`${STAT_LINK} ${row.warn ? 'text-[var(--color-danger)]' : ''}`}
                  >
                    {row.value}
                  </Link>
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </Panel>
  )
}
