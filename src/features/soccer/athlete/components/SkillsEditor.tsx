import { useEffect, useState } from 'react'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { useUserPreferences } from '@features/preferences'
import { useAthleteDevelopment } from '../../hooks/useAthleteDevelopment'
import {
  generateSportSkills,
  ensureUniqueSkillSlugs,
  slugifySkillLabel,
  MAX_SKILLS,
} from '../sportSkills'
import type { TrainingSkill } from '../types'

interface SkillsEditorProps {
  compact?: boolean
}

function newSkill(index: number): TrainingSkill {
  return {
    id: `skill-${Date.now()}-${index}`,
    label: '',
    slug: `skill-${index + 1}`,
  }
}

export function SkillsEditor({ compact = false }: SkillsEditorProps) {
  const { hobbyPassion } = useUserPreferences()
  const { development, updateSkills } = useAthleteDevelopment()
  const [skills, setSkills] = useState<TrainingSkill[]>(development.skills)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSkills(development.skills)
  }, [development.skills])

  function updateLabel(index: number, label: string) {
    setSkills((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, label, slug: slugifySkillLabel(label) || s.slug } : s,
      ),
    )
  }

  function addSkill() {
    setSkills((prev) => (prev.length >= MAX_SKILLS ? prev : [...prev, newSkill(prev.length)]))
  }

  function removeSkill(index: number) {
    setSkills((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  function restoreSuggested() {
    if (!hobbyPassion.trim()) return
    setSkills(generateSportSkills(hobbyPassion))
  }

  async function save() {
    setSaving(true)
    try {
      await updateSkills(ensureUniqueSkillSlugs(skills.filter((s) => s.label.trim())))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <p className="text-xs text-[var(--color-text-tertiary)]">
        Up to {MAX_SKILLS} skills — check them when logging sessions. Games credit all skills.
      </p>
      <ul className="space-y-2">
        {skills.map((skill, index) => (
          <li key={skill.id} className="flex gap-2">
            <Input
              label={`Skill ${index + 1}`}
              value={skill.label}
              onChange={(e) => updateLabel(index, e.target.value)}
              placeholder="e.g. Finishing"
              className="min-w-0 flex-1"
            />
            {skills.length > 1 && (
              <button
                type="button"
                aria-label={`Remove skill ${index + 1}`}
                onClick={() => removeSkill(index)}
                className="mt-5 shrink-0 rounded-[var(--radius-sm)] px-2 text-xs text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-danger)]"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        {skills.length < MAX_SKILLS && (
          <Button type="button" size="sm" variant="secondary" onClick={addSkill}>
            Add skill
          </Button>
        )}
        <Button type="button" size="sm" variant="secondary" onClick={restoreSuggested}>
          Restore suggested
        </Button>
        <Button type="button" size="sm" onClick={() => void save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save skills'}
        </Button>
      </div>
    </div>
  )
}
