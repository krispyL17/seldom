import { Link } from 'react-router-dom'
import { Badge } from '@components/ui/Badge'
import { IconCheck } from '@components/ui/icons'
import { ErrorPanel } from '@components/ui/ErrorPanel'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { ProgressBar } from '@components/ui/ProgressBar'
import { Panel, PanelActionLink, PanelDivider } from '@components/ui/Panel'
import { useTasks } from '@features/tasks/hooks/useTasks'
import { useGoals } from '@features/goals/hooks/useGoals'
import type { Goal } from '@features/goals/types'

function formatDue(deadline: string | null): { label: string; overdue: boolean } {
  if (!deadline) return { label: 'No due date', overdue: false }
  const due = deadline.slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)
  const overdue = due < today
  const formatted = new Date(`${due}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  return { label: formatted, overdue }
}

function nextMilestone(goal: Goal) {
  const pending = goal.milestones.find((m) => !m.completed)
  return pending?.title ?? 'No milestones yet'
}

function formatEta(targetDate: string | null) {
  if (!targetDate) return '—'
  return new Date(`${targetDate}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export function TasksAndGoalsPanel() {
  const { tasks, loading: tasksLoading, error: tasksError, reload: reloadTasks, toggleComplete } = useTasks()
  const { goals, loading: goalsLoading, error: goalsError, reload: reloadGoals } = useGoals()

  const openTasks = tasks.filter((t) => !t.completed)
  const completionRate =
    tasks.length > 0 ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100) : 0
  const overdueCount = openTasks.filter((t) => formatDue(t.deadline).overdue).length
  const taskPreview = openTasks.slice(0, 3)

  const activeGoals = goals.filter((g) => g.status === 'active').slice(0, 2)

  const loading = tasksLoading || goalsLoading
  const hasError = tasksError || goalsError
  
  if (hasError) {
    return (
      <ErrorPanel 
        message={tasksError || goalsError || 'Unknown error'} 
        onRetry={() => {
          void reloadTasks()
          void reloadGoals()
        }} 
        title="Tasks & Goals" 
      />
    )
  }

  return (
    <Panel
      title="Tasks & Goals"
      subtitle={
        loading 
          ? 'Loading…' 
          : `${completionRate}% tasks done · ${activeGoals.length} goal${activeGoals.length === 1 ? '' : 's'}`
      }
      badge={overdueCount > 0 ? <Badge variant="danger">{overdueCount} overdue</Badge> : undefined}
      action={
        <div className="flex items-center gap-2">
          <PanelActionLink to="/tasks">Tasks</PanelActionLink>
          <span className="text-[var(--color-text-tertiary)]">•</span>
          <PanelActionLink to="/goals">Goals</PanelActionLink>
        </div>
      }
    >
      {loading ? (
        <PanelSkeleton lines={4} />
      ) : (
        <div className="space-y-3">
          {/* Tasks Section */}
          <div>
            <PanelDivider label={`Tasks (${openTasks.length})`} />
            {taskPreview.length === 0 ? (
              <div className="py-2">
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  No open tasks.{' '}
                  <Link
                    to="/tasks?new=1"
                    className="font-medium text-[var(--color-accent-muted)] hover:underline"
                  >
                    Add one
                  </Link>
                </p>
              </div>
            ) : (
              <ul className="space-y-1">
                {taskPreview.map((task) => {
                  const due = formatDue(task.deadline)
                  return (
                    <li
                      key={task.id}
                      className={`group flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 transition-colors ${
                        due.overdue
                          ? 'bg-[var(--color-danger)]/8 hover:bg-[var(--color-danger)]/12'
                          : 'hover:bg-[var(--color-surface-overlay)]'
                      }`}
                    >
                      <button
                        type="button"
                        aria-label={`Mark "${task.title}" complete`}
                        onClick={() => void toggleComplete(task.id, true)}
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[var(--color-border-strong)] text-transparent transition-colors hover:border-[var(--color-success)] hover:text-[var(--color-success)]"
                      >
                        <IconCheck size={10} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-[var(--color-text-primary)]">
                          {task.title}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {due.overdue ? (
                          <Badge variant="danger">Overdue</Badge>
                        ) : (
                          <span className="text-[10px] text-[var(--color-text-tertiary)]">{due.label}</span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            {openTasks.length > 3 && (
              <div className="mt-2">
                <Link
                  to="/tasks"
                  className="text-xs text-[var(--color-accent-muted)] hover:underline"
                >
                  +{openTasks.length - 3} more tasks
                </Link>
              </div>
            )}
          </div>

          {/* Goals Section */}
          <div>
            <PanelDivider label={`Long-term goals (${activeGoals.length})`} />
            {activeGoals.length === 0 ? (
              <div className="py-2">
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  No active goals.{' '}
                  <Link
                    to="/goals?new=1"
                    className="font-medium text-[var(--color-accent-muted)] hover:underline"
                  >
                    Set one
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-2"
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-[var(--color-text-primary)]">{goal.title}</p>
                      <Badge variant="muted">ETA {formatEta(goal.target_date)}</Badge>
                    </div>
                    <ProgressBar
                      value={goal.progress}
                      variant={goal.progress >= 70 ? 'success' : 'accent'}
                      size="sm"
                    />
                    <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">
                      Next: <span className="text-[var(--color-text-secondary)]">{nextMilestone(goal)}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
            {goals.filter((g) => g.status === 'active').length > 2 && (
              <div className="mt-2">
                <Link
                  to="/goals"
                  className="text-xs text-[var(--color-accent-muted)] hover:underline"
                >
                  +{goals.filter((g) => g.status === 'active').length - 2} more goals
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </Panel>
  )
}