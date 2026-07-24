import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@features/preferences'
import { Button } from '@components/ui/Button'
import { Panel } from '@components/ui/Panel'
import type { SoccerPlayerProfile } from '@services/database/soccerUserData'
import { useSoccer } from '../hooks/useSoccerProfile'

export function PerformanceOnboardingGate({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth()
  const { hobbyPassion, hobbyTabLabel } = useUserPreferences()
  const { completeOnboarding } = useSoccer()

  const displayName =
    typeof user?.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name.trim()
      : ''

  async function handleStart() {
    const profile: SoccerPlayerProfile = {
      name: displayName,
      position: '',
      preferredFoot: '',
      squadNumber: null,
      season: '',
      currentFocus: hobbyPassion || '',
    }

    await completeOnboarding(profile, {
      weaknessTitle: '',
      weaknessDescription: '',
      strengthTitle: '',
      strengthDescription: '',
      goalTitle: hobbyPassion ? `${hobbyPassion} — stay consistent` : '',
    })
    onComplete()
  }

  return (
    <Panel
      title={`${hobbyTabLabel} workspace`}
      subtitle="Ready when you are"
      fullWidth
    >
      <div className="space-y-4 py-4">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {hobbyPassion
            ? `Your **${hobbyTabLabel}** tab is set up for **${hobbyPassion}**. Log sessions with a focus, high points, and areas to improve — each sub-tab introduces itself the first time you open it.`
            : `Your **${hobbyTabLabel}** tab starts blank. Log sessions with a focus, high points, and areas to improve — each sub-tab introduces itself the first time you open it.`}
        </p>
        <Button onClick={() => void handleStart()}>Open {hobbyTabLabel}</Button>
      </div>
    </Panel>
  )
}
