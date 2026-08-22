import { performanceOnboarding } from '@config/onboardingPrompts'
import { OnboardingChatPanel } from '@features/onboarding/OnboardingChatPanel'
import type { OnboardingAnswers } from '@features/onboarding/types'
import { useUserPreferences } from '@features/preferences'
import { useAuth } from '@hooks/useAuth'
import { EMPTY_SOCCER_PROFILE } from '@services/database/soccerUserData'
import { useAthleteDevelopment } from '../hooks/useAthleteDevelopment'
import { useSoccer } from '../hooks/useSoccerProfile'

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function parseGymEnabled(answers: OnboardingAnswers): boolean {
  const raw = answers['gym.worksOut']
  if (typeof raw !== 'string') return false
  return raw.toLowerCase().startsWith('yes')
}

export function PerformanceOnboardingChatGate({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth()
  const { hobbyPassion, hobbyTabLabel } = useUserPreferences()
  const { completeOnboarding } = useSoccer()
  const { setGymEnabled } = useAthleteDevelopment()

  const displayName =
    typeof user?.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name.trim()
      : ''

  async function handleComplete(answers: OnboardingAnswers) {
    const goalTitle = str(answers['goal.title'])
    const cardioGoalTitle = str(answers['cardioGoal.title'])

    const profile = {
      ...EMPTY_SOCCER_PROFILE,
      name: displayName,
      currentFocus: goalTitle || hobbyPassion || '',
    }

    await completeOnboarding(profile, {
      weaknessTitle: '',
      weaknessDescription: '',
      strengthTitle: '',
      strengthDescription: '',
      goalTitle,
      cardioGoalTitle,
      goalCategory: hobbyTabLabel || 'Skills',
    })
    await setGymEnabled(parseGymEnabled(answers))
  }

  async function handleSkip() {
    await completeOnboarding(
      {
        ...EMPTY_SOCCER_PROFILE,
        name: displayName,
        currentFocus: hobbyPassion || '',
      },
      {
        weaknessTitle: '',
        weaknessDescription: '',
        strengthTitle: '',
        strengthDescription: '',
        goalTitle: '',
      },
    )
    onComplete()
  }

  return (
    <div>
      <OnboardingChatPanel
        config={performanceOnboarding}
        onComplete={handleComplete}
        onFinished={onComplete}
      />
      <p className="mt-4 text-center">
        <button
          type="button"
          onClick={() => void handleSkip()}
          className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:underline"
        >
          Set up later — explore the tab first
        </button>
      </p>
    </div>
  )
}
