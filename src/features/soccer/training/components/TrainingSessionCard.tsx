import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { ProgressBar } from '@components/ui/ProgressBar'
import { PanelDivider } from '@components/ui/Panel'
import type { TrainingSession } from '../types'
import { ENERGY_LABELS, TRAINING_MOOD_LABELS } from '../types'
import { formatSessionDate, intensityVariant } from '../utils'

interface TrainingSessionCardProps {
  session: TrainingSession
  onEdit: (session: TrainingSession) => void
  onDelete: (id: string) => void
}

export function TrainingSessionCard({ session, onEdit, onDelete }: TrainingSessionCardProps) {
  const focus =
    session.position_played && session.position_played !== 'Session'
      ? session.position_played
      : 'Session'

  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {focus} · {session.duration_min} min
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
            {formatSessionDate(session.session_date)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(session)}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(session.id)}>Delete</Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="accent">Intensity {session.intensity}/10</Badge>
        <Badge variant="muted">{TRAINING_MOOD_LABELS[session.mood]}</Badge>
        <Badge variant="muted">Energy: {ENERGY_LABELS[session.energy_level]}</Badge>
        {session.goal_id && <Badge variant="success">Linked goal</Badge>}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <ProgressBar
          value={session.intensity * 10}
          label="Intensity"
          variant={intensityVariant(session.intensity)}
          size="sm"
        />
        <ProgressBar
          value={session.energy_level * 20}
          label="Energy"
          variant="accent"
          size="sm"
        />
      </div>

      {session.high_points && (
        <>
          <PanelDivider label="High points" />
          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {session.high_points}
          </p>
        </>
      )}

      {session.work_on && (
        <>
          <PanelDivider label="To work on" />
          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {session.work_on}
          </p>
        </>
      )}

      {session.notes && (
        <>
          <PanelDivider label="Notes" />
          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {session.notes}
          </p>
        </>
      )}
    </article>
  )
}
