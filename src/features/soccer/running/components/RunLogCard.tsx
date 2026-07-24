import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { useDistanceUnit } from '@hooks/useDistanceUnit'
import type { RunLog } from '../types'
import { formatDuration, formatRunDate } from '../utils'

interface RunLogCardProps {
  run: RunLog
  isPr?: boolean
  onEdit: (run: RunLog) => void
  onDelete: (id: string) => void
}

export function RunLogCard({ run, isPr, onEdit, onDelete }: RunLogCardProps) {
  const { formatPace } = useDistanceUnit()

  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {run.distance_label} — {formatDuration(run.duration_sec)}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
            {formatRunDate(run.run_date)} · {formatPace(run.duration_sec, run.distance_m)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {isPr && <Badge variant="success">PR</Badge>}
          <Button variant="ghost" size="sm" onClick={() => onEdit(run)}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(run.id)}>Delete</Button>
        </div>
      </div>
      {run.notes && (
        <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">{run.notes}</p>
      )}
    </article>
  )
}
