import { soccerOnboarding } from '@config/onboardingPrompts'
import { OnboardingChatPanel } from '@features/onboarding/OnboardingChatPanel'
import type { OnboardingAnswers } from '@features/onboarding/types'
import type { SoccerPlayerProfile } from '@services/database/soccerUserData'
import { useSoccer } from '../hooks/useSoccerProfile'

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function SoccerOnboardingGate({ onComplete }: { onComplete: () => void }) {
  const { completeOnboarding } = useSoccer()

  async function handleComplete(answers: OnboardingAnswers) {
    const squadRaw = answers['profile.squadNumber']
    const squadNumber =
      typeof squadRaw === 'number'
        ? squadRaw
        : typeof squadRaw === 'string' && squadRaw.trim()
          ? Number(squadRaw)
          : null

    const profile: SoccerPlayerProfile = {
      name: str(answers['profile.name']),
      position: str(answers['profile.position']) || 'CM',
      preferredFoot: str(answers['profile.preferredFoot']) || 'Right',
      squadNumber: Number.isFinite(squadNumber as number) ? (squadNumber as number) : null,
      season: str(answers['profile.season']) || '2026–27',
      currentFocus: str(answers['profile.currentFocus']),
    }

    await completeOnboarding(profile, {
      weaknessTitle: str(answers['weaknesses.0.title']),
      weaknessDescription: str(answers['weaknesses.0.description']),
      strengthTitle: str(answers['strengths.0.title']),
      strengthDescription: str(answers['strengths.0.description']),
      goalTitle: str(answers['goal.title']),
    })
  }

  return (
    <OnboardingChatPanel
      config={soccerOnboarding}
      onComplete={handleComplete}
      onFinished={onComplete}
    />
  )
}
