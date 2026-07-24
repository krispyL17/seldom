import tabIntrosJson from '../../config/prompts/tab-intros.json'
import type { OnboardingConfig } from '@features/onboarding/types'

const tabIntros = tabIntrosJson as Record<string, OnboardingConfig>

export function getTabIntroConfig(tabId: string): OnboardingConfig | null {
  return tabIntros[tabId] ?? null
}

export function listTabIntroIds(): string[] {
  return Object.keys(tabIntros)
}
