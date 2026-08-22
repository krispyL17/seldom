import { Badge } from '@components/ui/Badge'
import { IconButton } from '@components/ui/IconButton'
import { IconCheck } from '@components/ui/icons'
import type { Task } from '@features/tasks/types'
import {
  formatDeadline,
  formatDuration,
  isOverdue,
  priorityBadgeVariant,
  priorityLabel,
} from '@features/tasks/utils'
import { cn } from '@lib/utils'

interface TaskItemProps {
  task: Task
  onToggle: (id: string, completed: boolean) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const overdue = isOverdue(task)

  return (
    <article
      className={cn(
        'group rounded-[var(--radius-lg)] border bg-[var(--color-surface-raised)] p-4 transition-colors',
        'hover:border-[var(--color-border-strong)]',
        task.completed && 'opacity-60',
        overdue
          ? 'border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5'
          : 'border-[var(--color-border)]',
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Complete "${task.title}"`}
          onClick={() => onToggle(task.id, !task.completed)}
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
            task.completed
              ? 'border-[var(--color-success)] bg-[var(--color-success)]/20 text-[var(--color-success)]'
              : 'border-[var(--color-border-strong)] text-transparent hover:border-[var(--color-success)] hover:text-[var(--color-success)]',
          )}
        >
          {task.completed && <IconCheck />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={cn(
                'text-sm font-medium text-[var(--color-text-primary)]',
                task.completed && 'line-through',
              )}
            >
              {task.title}
            </h3>
            <Badge variant={priorityBadgeVariant(task.priority)}>
              {priorityLabel(task.priority)}
            </Badge>
            {overdue && <Badge variant="danger">Overdue</Badge>}
            {task.category && <Badge variant="muted">{task.category}</Badge>}
          </div>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-[var(--color-text-secondary)]">
              {task.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-tertiary)]">
            <span>{formatDeadline(task.deadline)}</span>
            <span>Est. {formatDuration(task.estimated_duration)}</span>
          </div>

          {task.notes && (
            <p className="mt-2 line-clamp-1 text-xs italic text-[var(--color-text-tertiary)]">
              {task.notes}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
          <IconButton label={`Edit ${task.title}`} onClick={() => onEdit(task)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>
          <IconButton label={`Delete ${task.title}`} onClick={() => onDelete(task.id)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>
        </div>
      </div>
    </article>
  )
}
