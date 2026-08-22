import type { TrainingSession } from '@features/soccer/training/types'
import { TRAINING_MOOD_LABELS } from '@features/soccer/training/types'
import type { TrainingSkill } from '@features/soccer/athlete/types'
import { resolveSessionSkillsDisplay } from '@features/soccer/training/components/SkillChecklist'
import { formatMinutesDuration } from '@lib/formatDuration'

/** Short headline for dashboard (skills + duration). */
export function sessionHeadline(session: TrainingSession, skills: TrainingSkill[] = []): string {
  const { label } = resolveSessionSkillsDisplay(session, skills)
  return `${label} · ${formatMinutesDuration(session.duration_min)}`
}

/** 2–3 word tagline from notes or session feel. */
export function sessionTagline(session: TrainingSession): string {
  const raw =
    session.high_points?.trim() ||
    session.work_on?.trim() ||
    session.notes?.trim() ||
    ''
  if (raw) {
    const words = raw.split(/\s+/).filter(Boolean).slice(0, 3)
    if (words.length > 0) return words.join(' ')
  }
  if (session.intensity >= 8) return TRAINING_MOOD_LABELS[session.mood] ?? 'High intensity'
  if (session.intensity <= 4) return 'Light session'
  return 'Steady effort'
}
