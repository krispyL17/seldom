import type { AthleteDevelopmentState, CustomPerformanceTab, TrainingSkill } from './types'
import { DEFAULT_ATHLETE_DEVELOPMENT } from './types'

function migrateCustomTabsToSkills(
  customTabs: CustomPerformanceTab[] | undefined,
  skills: TrainingSkill[] | undefined,
): TrainingSkill[] {
  if (Array.isArray(skills) && skills.length > 0) return skills
  if (!Array.isArray(customTabs)) return []
  return customTabs.map((t) => ({
    id: t.id,
    label: t.label,
    slug: t.slug,
  }))
}

export function parseAthleteDevelopment(raw: unknown): AthleteDevelopmentState {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_ATHLETE_DEVELOPMENT }

  const o = raw as Partial<AthleteDevelopmentState>
  const customTabs = Array.isArray(o.customTabs) ? o.customTabs : []
  const skills = migrateCustomTabsToSkills(customTabs, o.skills)
  const skillsSeeded =
    Boolean(o.skillsSeeded) || skills.length > 0 || Boolean(o.customTabsDisabled)

  return {
    streak: { ...DEFAULT_ATHLETE_DEVELOPMENT.streak, ...(o.streak ?? {}) },
    injuryMode: { ...DEFAULT_ATHLETE_DEVELOPMENT.injuryMode, ...(o.injuryMode ?? {}) },
    sideProfile: { ...DEFAULT_ATHLETE_DEVELOPMENT.sideProfile, ...(o.sideProfile ?? {}) },
    gymEnabled: Boolean(o.gymEnabled),
    customTabs,
    skills,
    skillsSeeded,
    customTabsPromptDismissed: Boolean(o.customTabsPromptDismissed),
    customTabsDisabled: Boolean(o.customTabsDisabled),
    knowledgeImports: Array.isArray(o.knowledgeImports) ? o.knowledgeImports : [],
  }
}
