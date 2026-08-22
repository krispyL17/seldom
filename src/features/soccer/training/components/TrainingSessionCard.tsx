import { Badge } from '@components/ui/Badge'
import { updateError } from '@lib/userFacingError'
import { Button } from '@components/ui/Button'
import { ProgressBar } from '@components/ui/ProgressBar'
import { PanelDivider } from '@components/ui/Panel'
import { formatMinutesDuration } from '@lib/formatDuration'
import { useAthleteDevelopment } from '../../hooks/useAthleteDevelopment'
import { resolveSessionSkillsDisplay } from './SkillChecklist'
import { useTrainingSessions } from '../hooks/useTrainingSessions'
import type { TrainingSession } from '../types'
import { ENERGY_LABELS, TRAINING_MOOD_LABELS } from '../types'
import { formatSessionDate, intensityVariant } from '../utils'

interface TrainingSessionCardProps {
  session: TrainingSession
  onEdit: (session: TrainingSession) => void
  onDelete: (id: string) => void
}

export function TrainingSessionCard({ session, onEdit, onDelete }: TrainingSessionCardProps) {
  const { development } = useAthleteDevelopment()
  const { updateSession } = useTrainingSessions()
  const { label, orphaned } = resolveSessionSkillsDisplay(session, development.skills)

  async function clearLegacyLabel() {
    try {
      await updateSession(session.id, { tab_category: null, skills_trained: [] })
    } catch (err) {
      alert(updateError('this label', err))
    }
  }

  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-4">
      {orphaned && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 px-3 py-2">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Legacy label or removed skill — edit and check skills, or clear.
          </p>
          <Button type="button" size="sm" variant="secondary" onClick={() => void clearLegacyLabel()}>
            Clear
          </Button>
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            <span className={orphaned ? 'text-[var(--color-warning)]' : undefined}>{label}</span>
            {' · '}
            {formatMinutesDuration(session.duration_min)}
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
        {session.team_session && <Badge variant="muted">Team session</Badge>}
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
