import { ONBOARDING_DISMISS_DISCLAIMER } from './onboardingVersion'

/** Single-click skip — disclaimer lives in modal UI instead of a native confirm. */
export function confirmOnboardingDismiss(): boolean {
  return true
}

export { ONBOARDING_DISMISS_DISCLAIMER }
