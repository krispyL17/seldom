import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { ProgressBar } from '@components/ui/ProgressBar'
import { IconCheck } from '@components/ui/icons'
import type { Goal, Milestone } from '@features/goals/types'
import {
  formatTargetDate,
  goalDisplayProgress,
  isTargetOverdue,
  milestoneCompletionPercent,
  progressVariant,
  statusBadgeVariant,
  statusLabel,
} from '@features/goals/utils'
import { useNavTabColor } from '@hooks/useNavTabColor'
import { cn } from '@lib/utils'

interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onArchive: (id: string) => void
  onRestore: (id: string) => void
  onDelete: (id: string) => void
  onMilestonesChange: (id: string, milestones: Milestone[]) => void
  onMilestoneToTask?: (goal: Goal, milestone: Milestone) => void
}

export function GoalCard({
  goal,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onMilestonesChange,
  onMilestoneToTask,
}: GoalCardProps) {
  const perfColor = useNavTabColor('soccer')
  const overdue = isTargetOverdue(goal)
  const displayProgress = goalDisplayProgress(goal)
  const milestoneProgress = milestoneCompletionPercent(goal.milestones)

  function toggleMilestone(milestoneId: string) {
    const updated = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m,
    )
    onMilestonesChange(goal.id, updated)
  }

  return (
    <article
      className={cn(
        'rounded-[var(--radius-lg)] border bg-[var(--color-surface-raised)] p-5 transition-colors',
        'hover:border-[var(--color-border-strong)]',
        goal.status === 'archived' && 'opacity-60',
        overdue
          ? 'border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5'
          : 'border-[var(--color-border)]',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              {goal.title}
            </h3>
            <Badge variant={statusBadgeVariant(goal.status)}>{statusLabel(goal.status)}</Badge>
            {goal.category && <Badge variant="muted">{goal.category}</Badge>}
            {overdue && <Badge variant="warning">Overdue</Badge>}
          </div>

          {goal.description && (
            <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">{goal.description}</p>
          )}

          <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
            Target: {formatTargetDate(goal.target_date)}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(goal)}>
            Edit
          </Button>
          {goal.status === 'archived' ? (
            <Button variant="secondary" size="sm" onClick={() => onRestore(goal.id)}>
              Restore
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => onArchive(goal.id)}>
              Archive
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onDelete(goal.id)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <ProgressBar
          value={displayProgress}
          label="Progress"
          variant={progressVariant(displayProgress)}
          size="md"
        />
        {goal.milestones.length > 0 && (
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            Milestones: {milestoneProgress}% complete
          </p>
        )}
      </div>

      {/* Milestones */}
      {goal.milestones.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-4">
          {goal.milestones.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label={`${m.completed ? 'Undo' : 'Complete'} milestone: ${m.title}`}
                onClick={() => toggleMilestone(m.id)}
                disabled={goal.status === 'archived'}
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                  m.completed
                    ? 'border-[var(--color-success)] bg-[var(--color-success)]/20 text-[var(--color-success)]'
                    : 'border-[var(--color-border-strong)] hover:border-[var(--color-success)]',
                  goal.status === 'archived' && 'opacity-50',
                )}
              >
                {m.completed && <IconCheck />}
              </button>
              <span
                className={cn(
                  'min-w-0 flex-1 text-xs',
                  m.completed
                    ? 'text-[var(--color-text-tertiary)] line-through'
                    : 'text-[var(--color-text-primary)]',
                )}
                style={
                  !m.completed && onMilestoneToTask
                    ? { borderLeft: `2px solid ${perfColor}55`, paddingLeft: 6 }
                    : undefined
                }
              >
                {m.title}
                {m.target_date && (
                  <span className="ml-1 text-[var(--color-text-tertiary)]">
                    ·{' '}
                    {new Date(`${m.target_date}T12:00:00`).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </span>
              {!m.completed && onMilestoneToTask && (
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => onMilestoneToTask(goal, m)}
                >
                  Add as task
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
