import { appTutorialConfig } from '@config/onboardingPrompts'
import type { TabIntrosCompleted } from '@/types/userPreferences'

/** Stored in tab_intros_completed to track welcome tutorial version. */
export const APP_TUTORIAL_TAB_KEY = 'app-tutorial'

function parseStoredVersion(raw: string | undefined): number | null {
  if (!raw) return null
  const head = raw.split(':')[0] ?? raw
  const n = Number.parseInt(head, 10)
  return Number.isFinite(n) ? n : null
}

/** Legacy tab intros saved an ISO timestamp instead of a version number. */
function isLegacyTimestamp(raw: string): boolean {
  return raw.includes('T') && raw.includes('-')
}

export function getAppTutorialSeenVersion(tabIntros: TabIntrosCompleted): number {
  const parsed = parseStoredVersion(tabIntros[APP_TUTORIAL_TAB_KEY])
  if (parsed != null) return parsed
  return 0
}

export function shouldShowAppTutorial(
  tabIntros: TabIntrosCompleted,
  appTutorialCompletedAt: string | null,
): boolean {
  const required = appTutorialConfig.version
  const seen = getAppTutorialSeenVersion(tabIntros)
  if (seen >= required) return false

  // Legacy users who finished before version tracking — don't re-prompt for v1.
  if (
    required <= 1 &&
    appTutorialCompletedAt &&
    !tabIntros[APP_TUTORIAL_TAB_KEY]
  ) {
    return false
  }

  return true
}

export function getTabIntroSeenVersion(tabIntros: TabIntrosCompleted, tabId: string): number {
  const raw = tabIntros[tabId]
  if (!raw) return 0
  const parsed = parseStoredVersion(raw)
  if (parsed != null) return parsed
  if (isLegacyTimestamp(raw)) return 1
  return 0
}

export function shouldShowTabIntro(
  tabIntros: TabIntrosCompleted,
  tabId: string,
  configVersion: number,
): boolean {
  return getTabIntroSeenVersion(tabIntros, tabId) < configVersion
}

export function tabIntroVersionPatch(
  tabIntros: TabIntrosCompleted,
  tabId: string,
  version: number,
): TabIntrosCompleted {
  return {
    ...tabIntros,
    [tabId]: String(version),
  }
}

export const ONBOARDING_DISMISS_DISCLAIMER =
  'You can finish setup anytime from Settings → Welcome tour. New required questions only appear when Seldom adds them.'
