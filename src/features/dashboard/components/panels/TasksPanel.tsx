import { Link } from 'react-router-dom'
import { Badge } from '@components/ui/Badge'
import { IconCheck } from '@components/ui/icons'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorPanel } from '@components/ui/ErrorPanel'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { Panel, PanelActionLink, PanelDivider } from '@components/ui/Panel'
import { useTasks } from '@features/tasks/hooks/useTasks'

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

export function TasksPanel() {
  const { tasks, loading, error, reload, toggleComplete } = useTasks()

  const open = tasks.filter((t) => !t.completed)
  const completedToday = tasks.filter(
    (t) => t.completed && t.updated_at.slice(0, 10) === new Date().toISOString().slice(0, 10),
  ).length
  const completionRate =
    tasks.length > 0 ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100) : 0
  const overdueCount = open.filter((t) => formatDue(t.deadline).overdue).length
  const preview = open.slice(0, 5)

  if (error) {
    return <ErrorPanel message={error} onRetry={() => void reload()} title="Tasks" />
  }

  return (
    <Panel
      title="Tasks"
      subtitle={
        loading ? 'Loading…' : `${completionRate}% completed · ${completedToday} today`
      }
      badge={overdueCount > 0 ? <Badge variant="danger">{overdueCount} overdue</Badge> : undefined}
      action={<PanelActionLink to="/tasks">View all</PanelActionLink>}
    >
      {loading ? (
        <PanelSkeleton lines={4} />
      ) : preview.length === 0 ? (
        <EmptyState
          title="No open tasks"
          description="Add tasks in the Tasks tab to track them here."
          action={
            <Link
              to="/tasks"
              className="text-xs font-medium text-[var(--color-accent-muted)] hover:underline"
            >
              Go to Tasks
            </Link>
          }
        />
      ) : (
        <>
          <PanelDivider label="Active" />
          <ul className="space-y-1">
            {preview.map((task) => {
              const due = formatDue(task.deadline)
              return (
                <li
                  key={task.id}
                  className={`group flex items-center gap-3 rounded-[var(--radius-sm)] px-2 py-2 transition-colors ${
                    due.overdue
                      ? 'bg-[var(--color-danger)]/8 hover:bg-[var(--color-danger)]/12'
                      : 'hover:bg-[var(--color-surface-overlay)]'
                  }`}
                >
                  <button
                    type="button"
                    aria-label={`Mark "${task.title}" complete`}
                    onClick={() => void toggleComplete(task.id, true)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[var(--color-border-strong)] text-transparent transition-colors hover:border-[var(--color-success)] hover:text-[var(--color-success)]"
                  >
                    <IconCheck />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[var(--color-text-primary)]">
                      {task.title}
                    </p>
                    <p className="text-[10px] capitalize text-[var(--color-text-tertiary)]">
                      {task.priority} priority
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
        </>
      )}
    </Panel>
  )
}
