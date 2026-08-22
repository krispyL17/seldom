import type { CSSProperties } from 'react'
import { Badge } from '@components/ui/Badge'
import { IconCheck } from '@components/ui/icons'
import { EmptyState } from '@components/ui/EmptyState'
import { Panel, PanelGoToLink } from '@components/ui/Panel'
import { TabTintLink } from '@components/ui/TabTintLink'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { useTasks } from '@features/tasks/hooks/useTasks'
import { useGoals } from '@features/goals/hooks/useGoals'
import { goalDisplayProgress, nextPendingMilestone } from '@features/goals/utils'
import { isEarlyWeek } from '@features/goals/milestoneTasks'
import { useNavTabColor } from '@hooks/useNavTabColor'
import { cn } from '@lib/utils'

function formatDue(deadline: string | null): { label: string; overdue: boolean; sortKey: string } {
  if (!deadline) return { label: 'No date', overdue: false, sortKey: '9999-99-99' }
  const due = deadline.slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)
  const overdue = due < today
  const formatted = new Date(`${due}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  return { label: formatted, overdue, sortKey: due }
}

/** Top row: tasks + goal focus side by side. */
export function HomeTopRowPanel() {
  const early = isEarlyWeek()
  const goalsColor = useNavTabColor('goals')
  const tasksColor = useNavTabColor('tasks')
  const perfColor = useNavTabColor('soccer')

  const { tasks, loading: tasksLoading, toggleComplete } = useTasks()
  const { goals, loading: goalsLoading } = useGoals()

  const loading = tasksLoading || goalsLoading
  const open = tasks.filter((t) => !t.completed)
  const visibleTasks = [...open]
    .sort((a, b) => {
      const da = formatDue(a.deadline)
      const db = formatDue(b.deadline)
      if (da.overdue !== db.overdue) return da.overdue ? -1 : 1
      return da.sortKey.localeCompare(db.sortKey)
    })
    .slice(0, early ? 5 : 3)

  const activeGoals = goals.filter((g) => g.status === 'active')
  const featuredGoal = [...activeGoals]
    .sort((a, b) => {
      const aDate = nextPendingMilestone(a)?.target_date ?? a.target_date ?? '9999'
      const bDate = nextPendingMilestone(b)?.target_date ?? b.target_date ?? '9999'
      return aDate.localeCompare(bDate)
    })[0]

  const milestone = featuredGoal ? nextPendingMilestone(featuredGoal) : null
  const goalProgress = featuredGoal ? Math.round(goalDisplayProgress(featuredGoal)) : 0

  const goalSubtitle = featuredGoal
    ? milestone
      ? `Next: ${milestone.title}`
      : `${goalProgress}% complete`
    : 'Nothing active right now'

  return (
    <div className="home-overview-row-top grid min-h-0 grid-cols-2 gap-2.5">
      <Panel
        scrollCap
        fillHeight
        title="Tasks"
        accentNavId="tasks"
        subtitle={loading ? 'Loading…' : `${open.length} open`}
        action={<PanelGoToLink to="/tasks" accentNavId="tasks" />}
      >
        {loading ? (
          <PanelSkeleton lines={3} />
        ) : open.length === 0 ? (
          <EmptyState
            compact
            title="No open tasks"
            description="Add what is due this week."
            action={
              <TabTintLink to="/tasks?new=1" accentColor={tasksColor}>
                Add task
              </TabTintLink>
            }
          />
        ) : (
          <ul className="space-y-0.5">
            {visibleTasks.map((task) => {
              const due = formatDue(task.deadline)
              const isMilestone = task.notes?.startsWith('__seldom_milestone__:')
              return (
                <li
                  key={task.id}
                  className={cn(
                    'group flex min-h-9 items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1',
                    due.overdue
                      ? 'bg-[var(--color-danger)]/8'
                      : 'hover:bg-[var(--color-surface-overlay)]',
                    isMilestone && 'bg-[color-mix(in_srgb,var(--tab-tint)_10%,transparent)]',
                  )}
                  style={isMilestone ? ({ '--tab-tint': perfColor } as CSSProperties) : undefined}
                >
                  <button
                    type="button"
                    aria-label={`Mark "${task.title}" complete`}
                    onClick={() => void toggleComplete(task.id, true)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[var(--color-border-strong)] text-[var(--color-text-tertiary)] transition-colors group-hover:border-[var(--color-success)] group-hover:text-[var(--color-success)]"
                  >
                    <IconCheck className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                  <p className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--color-text-primary)]">
                    {task.title}
                  </p>
                  <span
                    className={cn(
                      'shrink-0 text-xs tabular-nums',
                      due.overdue
                        ? 'font-medium text-[var(--color-danger)]'
                        : 'text-[var(--color-text-tertiary)]',
                    )}
                  >
                    {due.label}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      <Panel
        scrollCap
        fillHeight
        title={featuredGoal?.title ?? 'Goals'}
        accentNavId="goals"
        subtitle={loading ? 'Loading…' : goalSubtitle}
        action={<PanelGoToLink to="/goals" accentNavId="goals" />}
      >
        {loading ? (
          <PanelSkeleton lines={2} />
        ) : !featuredGoal ? (
          <EmptyState
            compact
            title="No active goals"
            description="Set a long-term target to track here."
            action={
              <TabTintLink to="/goals?new=1" accentColor={goalsColor}>
                Add goal
              </TabTintLink>
            }
          />
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-[var(--color-text-secondary)]">Progress</span>
              <Badge variant="muted">{goalProgress}%</Badge>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-overlay)]"
              role="progressbar"
              aria-valuenow={goalProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{
                  width: `${goalProgress}%`,
                  backgroundColor: goalsColor,
                }}
              />
            </div>
            {milestone && (
              <div
                className="rounded-[var(--radius-sm)] px-2.5 py-2"
                style={{
                  backgroundColor: `color-mix(in srgb, ${goalsColor} 12%, transparent)`,
                }}
              >
                <p className="text-xs font-medium text-[var(--color-text-primary)]">{milestone.title}</p>
                {milestone.target_date && (
                  <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    Due{' '}
                    {new Date(`${milestone.target_date}T12:00:00`).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Panel>
    </div>
  )
}
