import collegeOnboardingJson from '../../config/prompts/college-onboarding.json'
import soccerOnboardingJson from '../../config/prompts/soccer-onboarding.json'
import performanceOnboardingJson from '../../config/prompts/performance-onboarding.json'
import appTutorialJson from '../../config/prompts/app-tutorial.json'
import type { OnboardingConfig } from '@features/onboarding/types'

export const collegeOnboarding = collegeOnboardingJson as OnboardingConfig
export const soccerOnboarding = soccerOnboardingJson as OnboardingConfig
export const performanceOnboarding = performanceOnboardingJson as OnboardingConfig
export const appTutorialConfig = appTutorialJson as OnboardingConfig
