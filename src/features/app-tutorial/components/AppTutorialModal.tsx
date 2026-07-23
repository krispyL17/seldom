import { useCallback, useEffect, useState } from 'react'
import { Button } from '@components/ui/Button'
import { IconSparkles } from '@components/ui/icons'
import { OnboardingChatPanel } from '@features/onboarding/OnboardingChatPanel'
import { appTutorialConfig } from '@config/onboardingPrompts'
import { useUserPreferences } from '@features/preferences'
import { useAuth } from '@hooks/useAuth'
import { authService } from '@services/auth'
import { cn } from '@lib/utils'
import { buildFeatureSlides } from '../featureSlides'
import { TutorialFeatureTour } from './TutorialFeatureTour'

interface AppTutorialModalProps {
  open: boolean
  onClose: () => void
}

type TutorialPhase = 'customize' | 'features' | 'done'

export function AppTutorialModal({ open, onClose }: AppTutorialModalProps) {
  const { user } = useAuth()
  const { updatePreferences, completeTutorial, hobbyTabLabel, tutorialCompleted } =
    useUserPreferences()
  const [phase, setPhase] = useState<TutorialPhase>('customize')
  const [pendingLabel, setPendingLabel] = useState(hobbyTabLabel)

  useEffect(() => {
    if (open) {
      setPhase('customize')
      setPendingLabel(hobbyTabLabel)
    }
  }, [open, hobbyTabLabel])

  const finishTutorial = useCallback(async () => {
    await completeTutorial()
    onClose()
  }, [completeTutorial, onClose])

  const handleDismiss = useCallback(() => {
    if (!tutorialCompleted) {
      void finishTutorial()
    } else {
      onClose()
    }
  }, [tutorialCompleted, finishTutorial, onClose])

  const handleCustomizeComplete = useCallback(
    async (answers: Record<string, unknown>) => {
      const displayName = String(answers.displayName ?? '').trim()
      const passion = String(answers.hobbyPassion ?? '').trim()
      const tabLabel = String(answers.hobbyTabLabel ?? '').trim() || passion || 'Performance'
      const focus = String(answers.currentFocus ?? '').trim()

      if (displayName && user) {
        try {
          await authService.updateDisplayName(displayName)
        } catch {
          /* non-blocking */
        }
      }

      setPendingLabel(tabLabel)
      await updatePreferences({
        hobby_tab_label: tabLabel,
        hobby_passion: passion,
      })

      if (focus && user?.id) {
        try {
          const { soccerUserDataService } = await import('@services/database/soccerUserData')
          const existing = await soccerUserDataService.fetch(user.id)
          if (existing?.profile) {
            await soccerUserDataService.updateProfile(user.id, {
              ...existing.profile,
              currentFocus: focus,
              name: displayName || existing.profile.name,
            })
          }
        } catch {
          /* optional */
        }
      }

      setPhase('features')
    },
    [updatePreferences, user],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-backdrop-in" aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-tutorial-title"
        className={cn(
          'relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden',
          'rounded-[var(--radius-xl)] border border-[var(--color-border)]',
          'bg-[var(--color-surface-raised)] shadow-[var(--shadow-elevated)]',
          'animate-scale-in',
        )}
      >
        <header className="border-b border-[var(--color-border)] px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-subtle)]">
                <IconSparkles width={18} height={18} className="text-[var(--color-accent-muted)]" />
              </div>
              <div>
                <h2
                  id="app-tutorial-title"
                  className="text-base font-semibold tracking-tight text-[var(--color-text-primary)]"
                >
                  {phase === 'customize'
                    ? 'Meet Seldom OS'
                    : phase === 'features'
                      ? 'Your workspace'
                      : "You're set"}
                </h2>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  {phase === 'customize'
                    ? 'Step 1 of 2 — Personalize'
                    : phase === 'features'
                      ? 'Step 2 of 2 — Feature tour'
                      : 'Welcome aboard'}
                </p>
              </div>
            </div>

            {phase !== 'done' && (
              <button
                type="button"
                onClick={handleDismiss}
                className="text-[11px] text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-secondary)]"
              >
                {!tutorialCompleted ? 'Skip' : 'Close'}
              </button>
            )}
          </div>

          <div className="mt-4 flex gap-1.5">
            <div
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                phase === 'customize' ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-accent)]/40',
              )}
            />
            <div
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                phase === 'features' || phase === 'done'
                  ? 'bg-[var(--color-accent)]'
                  : 'bg-[var(--color-surface-overlay)]',
              )}
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {phase === 'customize' && (
            <div className="animate-slide-up">
              <OnboardingChatPanel
                config={appTutorialConfig}
                onComplete={handleCustomizeComplete}
                embedded
              />
            </div>
          )}

          {phase === 'features' && (
            <TutorialFeatureTour
              slides={buildFeatureSlides(pendingLabel)}
              onFinish={() => setPhase('done')}
            />
          )}

          {phase === 'done' && (
            <div className="animate-slide-up py-8 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Seldom is configured for you. Explore at your own pace — replay this tour anytime
                from Settings.
              </p>
              <Button className="mt-6" onClick={() => void finishTutorial()}>
                Enter Seldom
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
