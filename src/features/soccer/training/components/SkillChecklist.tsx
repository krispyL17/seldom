import { useAthleteDevelopment } from '../../hooks/useAthleteDevelopment'
import type { TrainingSkill } from '../../athlete/types'
import { cn } from '@lib/utils'

interface SkillChecklistProps {
  value: string[]
  onChange: (skillIds: string[]) => void
  className?: string
}

export function SkillChecklist({ value, onChange, className }: SkillChecklistProps) {
  const { development } = useAthleteDevelopment()
  const skills = development.skills

  function toggle(skillId: string) {
    if (value.includes(skillId)) {
      onChange(value.filter((id) => id !== skillId))
    } else {
      onChange([...value, skillId])
    }
  }

  if (skills.length === 0) {
    return (
      <p className={cn('text-xs text-[var(--color-text-tertiary)]', className)}>
        Set up skills in the Skills tab first.
      </p>
    )
  }

  return (
    <fieldset className={className}>
      <legend className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
        Skills trained
      </legend>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => {
          const checked = value.includes(skill.id)
          return (
            <label
              key={skill.id}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors',
                checked
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-text-primary)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)]',
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => toggle(skill.id)}
              />
              {skill.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function formatSessionSkillsLabel(
  skillIds: string[],
  skills: TrainingSkill[],
  teamSession: boolean,
): string {
  if (skillIds.length === 0) return 'Session'
  const names = skillIds
    .map((id) => skills.find((s) => s.id === id)?.label)
    .filter(Boolean) as string[]
  const base = names.length > 0 ? names.join(', ') : 'Session'
  return teamSession ? `${base} · team` : base
}

export function resolveSessionSkillsDisplay(
  session: { skills_trained?: string[]; team_session?: boolean; position_played?: string },
  skills: TrainingSkill[],
): { label: string; orphaned: boolean } {
  const trained = session.skills_trained ?? []
  if (trained.length > 0) {
    const label = formatSessionSkillsLabel(trained, skills, session.team_session ?? false)
    const orphaned = trained.some((id) => !skills.some((s) => s.id === id))
    return { label, orphaned }
  }
  if (session.position_played?.trim()) {
    return { label: session.position_played, orphaned: true }
  }
  return { label: 'Session', orphaned: false }
}
