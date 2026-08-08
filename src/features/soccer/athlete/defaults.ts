import type { AthleteDevelopmentState } from './types'
import { DEFAULT_ATHLETE_DEVELOPMENT } from './types'

export function parseAthleteDevelopment(raw: unknown): AthleteDevelopmentState {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_ATHLETE_DEVELOPMENT }

  const o = raw as Partial<AthleteDevelopmentState>
  return {
    streak: { ...DEFAULT_ATHLETE_DEVELOPMENT.streak, ...(o.streak ?? {}) },
    injuryMode: { ...DEFAULT_ATHLETE_DEVELOPMENT.injuryMode, ...(o.injuryMode ?? {}) },
    sideProfile: { ...DEFAULT_ATHLETE_DEVELOPMENT.sideProfile, ...(o.sideProfile ?? {}) },
    gymEnabled: Boolean(o.gymEnabled),
    customTabs: Array.isArray(o.customTabs) ? o.customTabs : [],
    customTabsPromptDismissed: Boolean(o.customTabsPromptDismissed),
    customTabsDisabled: Boolean(o.customTabsDisabled),
    knowledgeImports: Array.isArray(o.knowledgeImports) ? o.knowledgeImports : [],
  }
}
