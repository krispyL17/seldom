import { Badge } from '@components/ui/Badge'
import { IconCheck } from '@components/ui/icons'
import { ProgressBar } from '@components/ui/ProgressBar'
import { Panel, PanelActionLink, PanelDivider } from '@components/ui/Panel'
import { tasksData } from '../../data/mockData'

export function TasksPanel() {
  const overdueCount = tasksData.active.filter((t) => t.overdue).length

  return (
    <Panel
      title="Tasks"
      subtitle={`${tasksData.completionRate}% completed today`}
      badge={overdueCount > 0 ? <Badge variant="danger">{overdueCount} overdue</Badge> : undefined}
      action={<PanelActionLink>View all</PanelActionLink>}
    >
      <ProgressBar
        value={tasksData.completionRate}
        label="Daily completion"
        variant={tasksData.completionRate >= 70 ? 'success' : 'accent'}
        size="md"
        className="mb-4"
      />

      <PanelDivider label="Active" />
      <ul className="space-y-1">
        {tasksData.active.map((task) => (
          <li
            key={task.id}
            className={`group flex items-center gap-3 rounded-[var(--radius-sm)] px-2 py-2 transition-colors ${
              task.overdue
                ? 'bg-[var(--color-danger)]/8 hover:bg-[var(--color-danger)]/12'
                : 'hover:bg-[var(--color-surface-overlay)]'
            }`}
          >
            <button
              type="button"
              aria-label={`Complete ${task.title}`}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[var(--color-border-strong)] text-transparent transition-colors hover:border-[var(--color-success)] hover:text-[var(--color-success)]"
            >
              <IconCheck />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[var(--color-text-primary)]">
                {task.title}
              </p>
              <div className="mt-1">
                <ProgressBar value={task.progress} showValue={false} size="sm" />
              </div>
            </div>

            <div className="shrink-0 text-right">
              {task.overdue ? (
                <Badge variant="danger">Overdue</Badge>
              ) : (
                <span className="text-[10px] text-[var(--color-text-tertiary)]">{task.due}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
