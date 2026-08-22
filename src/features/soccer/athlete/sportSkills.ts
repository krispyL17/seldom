import type { TrainingSkill } from './types'

/** Maximum skills a user can track in the Skills tab and session checklist. */
export const MAX_SKILLS = 12

const SKILL_TEMPLATES: Record<string, Omit<TrainingSkill, 'id'>[]> = {
  soccer: [
    { label: 'Weak Foot', slug: 'weak-foot' },
    { label: 'First Touch', slug: 'first-touch' },
    { label: 'Finishing', slug: 'finishing' },
    { label: 'Scanning', slug: 'scanning' },
  ],
  football: [
    { label: 'Route Running', slug: 'route-running' },
    { label: 'Acceleration', slug: 'acceleration' },
    { label: '1v1 Defending', slug: '1v1-defending' },
    { label: 'Footwork', slug: 'footwork' },
  ],
  running: [
    { label: 'Pace', slug: 'pace' },
    { label: 'Endurance', slug: 'endurance' },
    { label: 'Form', slug: 'form' },
    { label: 'Race Prep', slug: 'race-prep' },
  ],
  basketball: [
    { label: 'Shooting', slug: 'shooting' },
    { label: 'Ball Handling', slug: 'ball-handling' },
    { label: 'Defense', slug: 'defense' },
    { label: 'Court Vision', slug: 'court-vision' },
  ],
  default: [
    { label: 'Technique', slug: 'technique' },
    { label: 'Consistency', slug: 'consistency' },
    { label: 'Speed', slug: 'speed' },
    { label: 'Decision Making', slug: 'decision-making' },
  ],
}

function matchSportKey(passion: string): string {
  const p = passion.toLowerCase()
  if (p.includes('soccer') || p.includes('futsal')) return 'soccer'
  if (p.includes('football') && !p.includes('soccer')) return 'football'
  if (p.includes('run') || p.includes('track') || p.includes('cross country')) return 'running'
  if (p.includes('basketball')) return 'basketball'
  return 'default'
}

export function generateSportSkills(passion: string): TrainingSkill[] {
  const key = matchSportKey(passion)
  const templates = SKILL_TEMPLATES[key] ?? SKILL_TEMPLATES.default
  return templates.slice(0, 4).map((t, i) => ({
    id: `skill-${i}-${t.slug}`,
    ...t,
  }))
}

export function slugifySkillLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32)
}

export function ensureUniqueSkillSlugs(skills: TrainingSkill[]): TrainingSkill[] {
  const used = new Set<string>()
  return skills.map((skill, index) => {
    let slug = skill.slug || slugifySkillLabel(skill.label) || `skill-${index}`
    let n = 2
    while (used.has(slug)) {
      slug = `${slugifySkillLabel(skill.label)}-${n}`
      n += 1
    }
    used.add(slug)
    return { ...skill, slug }
  })
}
