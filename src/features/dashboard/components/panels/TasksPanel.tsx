import { Link } from 'react-router-dom'
import { Badge } from '@components/ui/Badge'
import { IconCheck } from '@components/ui/icons'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorPanel } from '@components/ui/ErrorPanel'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { Panel, PanelActionLink } from '@components/ui/Panel'
import { useTasks } from '@features/tasks/hooks/useTasks'

const MAX_VISIBLE = 5
const MORE_LINK =
  'text-xs font-medium text-[var(--color-accent-muted)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'

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

function taskSubtitle(openCount: number, completedToday: number, loading: boolean) {
  if (loading) return 'Loading…'
  if (openCount === 0) return 'Nothing open'
  const parts = [`${openCount} open`]
  if (completedToday > 0) parts.push(`${completedToday} done today`)
  return parts.join(' · ')
}

export function TasksPanel() {
  const { tasks, loading, error, reload, toggleComplete } = useTasks()

  const open = tasks.filter((t) => !t.completed)
  const completedToday = tasks.filter(
    (t) => t.completed && t.updated_at.slice(0, 10) === new Date().toISOString().slice(0, 10),
  ).length
  const overdueCount = open.filter((t) => formatDue(t.deadline).overdue).length

  const visible = [...open]
    .sort((a, b) => {
      const da = formatDue(a.deadline)
      const db = formatDue(b.deadline)
      if (da.overdue !== db.overdue) return da.overdue ? -1 : 1
      return da.sortKey.localeCompare(db.sortKey)
    })
    .slice(0, MAX_VISIBLE)

  if (error) {
    return (
      <ErrorPanel message={error} onRetry={() => void reload()} title="Couldn't load tasks" />
    )
  }

  return (
    <Panel
      scrollCap
      fillHeight
      scrollRatio={1}
      scrollMaxHeight="var(--dashboard-tasks-scroll-max)"
      title="Tasks"
      accentNavId="tasks"
      subtitle={taskSubtitle(open.length, completedToday, loading)}
      badge={overdueCount > 0 ? <Badge variant="danger">{overdueCount} overdue</Badge> : undefined}
      action={<PanelActionLink to="/tasks">View all</PanelActionLink>}
    >
      {loading ? (
        <PanelSkeleton lines={4} />
      ) : open.length === 0 ? (
        <EmptyState
          compact
          title="No open tasks"
          description="Capture what is due this week."
          action={
            <Link to="/tasks?new=1" className={MORE_LINK}>
              Add task
            </Link>
          }
        />
      ) : (
        <>
          <ul className="space-y-0.5">
            {visible.map((task) => {
              const due = formatDue(task.deadline)
              return (
                <li
                  key={task.id}
                  className={`group flex min-h-[var(--dashboard-task-row-height)] items-center gap-3 rounded-[var(--radius-sm)] px-2 py-1.5 transition-colors ${
                    due.overdue
                      ? 'bg-[var(--color-danger)]/8 hover:bg-[var(--color-danger)]/12'
                      : 'hover:bg-[var(--color-surface-overlay)]'
                  }`}
                >
                  <button
                    type="button"
                    aria-label={`Mark "${task.title}" complete`}
                    onClick={() => void toggleComplete(task.id, true)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[var(--color-border-strong)] text-transparent transition-colors hover:border-[var(--color-success)] hover:text-[var(--color-success)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                  >
                    <IconCheck />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[var(--color-text-primary)]">
                      {task.title}
                    </p>
                    <p className="text-xs capitalize text-[var(--color-text-tertiary)]">
                      {task.priority}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {due.overdue ? (
                      <Badge variant="danger">Overdue</Badge>
                    ) : (
                      <span className="text-xs tabular-nums text-[var(--color-text-tertiary)]">
                        {due.label}
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          {open.length > MAX_VISIBLE && (
            <Link to="/tasks" className={`mt-2 inline-block ${MORE_LINK}`}>
              +{open.length - MAX_VISIBLE} more
            </Link>
          )}
        </>
      )}
    </Panel>
  )
}
