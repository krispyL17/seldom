import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { ProgressBar } from '@components/ui/ProgressBar'
import type { RunGoal, RunLog } from '../types'
import { bestRunForDistance, formatDuration, pacePerMile } from '../utils'

interface RunGoalCardProps {
  goal: RunGoal
  runs: RunLog[]
  onEdit: (goal: RunGoal) => void
  onDelete: (id: string) => void
  onMarkAchieved: (goal: RunGoal) => void
}

export function RunGoalCard({ goal, runs, onEdit, onDelete, onMarkAchieved }: RunGoalCardProps) {
  const best = bestRunForDistance(runs, goal.distance_m)
  const achieved = goal.achieved_at !== null
  const beatTarget = best && best.duration_sec <= goal.target_duration_sec

  const progress = best
    ? Math.min(100, Math.round((goal.target_duration_sec / best.duration_sec) * 100))
    : 0

  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {goal.distance_label} under {formatDuration(goal.target_duration_sec)}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
            Target pace: {pacePerMile(goal.target_duration_sec, goal.distance_m)}
            {goal.deadline && ` · by ${goal.deadline}`}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {achieved && <Badge variant="success">Achieved</Badge>}
          {!achieved && beatTarget && <Badge variant="accent">On pace</Badge>}
          <Button variant="ghost" size="sm" onClick={() => onEdit(goal)}>Edit</Button>
          {!achieved && beatTarget && (
            <Button variant="ghost" size="sm" onClick={() => onMarkAchieved(goal)}>Mark done</Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onDelete(goal.id)}>Delete</Button>
        </div>
      </div>

      <div className="mt-3">
        <ProgressBar
          value={achieved ? 100 : progress}
          label={best ? `Best: ${formatDuration(best.duration_sec)}` : 'No runs logged yet'}
          variant={achieved || beatTarget ? 'success' : 'accent'}
          size="sm"
        />
      </div>

      {goal.notes && (
        <p className="mt-3 text-xs text-[var(--color-text-secondary)]">{goal.notes}</p>
      )}
    </article>
  )
}
