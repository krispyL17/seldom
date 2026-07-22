import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { ProgressBar } from '@components/ui/ProgressBar'
import { PanelDivider } from '@components/ui/Panel'
import type { TrainingSession } from '../types'
import {
  ENERGY_LABELS,
  TECHNICAL_RATING_KEYS,
  TECHNICAL_RATING_LABELS,
  TRAINING_MOOD_LABELS,
} from '../types'
import {
  averageTechnicalRating,
  formatSessionDate,
  intensityVariant,
} from '../utils'

interface TrainingSessionCardProps {
  session: TrainingSession
  onEdit: (session: TrainingSession) => void
  onDelete: (id: string) => void
}

export function TrainingSessionCard({ session, onEdit, onDelete }: TrainingSessionCardProps) {
  const avgTech = averageTechnicalRating(session.technical_ratings)

  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {session.position_played} · {session.duration_min} min
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
        <Badge variant={avgTech >= 7 ? 'success' : 'default'}>Tech avg {avgTech}</Badge>
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

      <PanelDivider label="Technical ratings" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
        {TECHNICAL_RATING_KEYS.map((key) => (
          <div key={key} className="flex justify-between text-[10px]">
            <span className="text-[var(--color-text-tertiary)]">{TECHNICAL_RATING_LABELS[key]}</span>
            <span className="font-medium tabular-nums text-[var(--color-text-primary)]">
              {session.technical_ratings[key]}
            </span>
          </div>
        ))}
      </div>

      {session.notes && (
        <p className="mt-3 border-t border-[var(--color-border)] pt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          {session.notes}
        </p>
      )}
    </article>
  )
}
