import { useCallback } from 'react'
import { IconSparkles } from '@components/ui/icons'
import { OnboardingChatPanel } from '@features/onboarding/OnboardingChatPanel'
import { appTutorialConfig } from '@config/onboardingPrompts'
import { useUserPreferences } from '@features/preferences'
import { useAuth } from '@hooks/useAuth'
import { authService } from '@services/auth'
import { cn } from '@lib/utils'

interface AppTutorialModalProps {
  open: boolean
  onClose: () => void
}

export function AppTutorialModal({ open, onClose }: AppTutorialModalProps) {
  const { user } = useAuth()
  const { updatePreferences, completeTutorial, tutorialCompleted } = useUserPreferences()

  const handleDismiss = useCallback(() => {
    if (!tutorialCompleted) {
      void completeTutorial()
    } else {
      onClose()
    }
  }, [tutorialCompleted, completeTutorial, onClose])

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

      const hsYear = String(answers.hsYear ?? '')
      const collegeEnabled = hsYear.startsWith('Junior') || hsYear.startsWith('Senior')

      await updatePreferences({
        hobby_tab_label: tabLabel,
        hobby_passion: passion,
        college_enabled: collegeEnabled,
      })

      if (collegeEnabled && user?.id) {
        try {
          const { collegeUserDataService } = await import('@services/database/collegeUserData')
          const existing = await collegeUserDataService.ensure(user.id)
          if (!existing.resumeSettings.onboardingCompletedAt) {
            await collegeUserDataService.updateResumeSettings(user.id, {
              ...existing.resumeSettings,
              applicationPhase: hsYear.startsWith('Senior') ? 'senior' : 'junior',
            })
          }
        } catch {
          /* non-blocking */
        }
      }

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
          /* optional — performance tab setup handles the rest */
        }
      }

      await completeTutorial()
    },
    [completeTutorial, updatePreferences, user],
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
                  Meet Seldom
                </h2>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  Personalize your workspace — tabs introduce themselves as you explore
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-[11px] text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-secondary)]"
            >
              {!tutorialCompleted ? 'Skip' : 'Close'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <OnboardingChatPanel
            config={appTutorialConfig}
            onComplete={handleCustomizeComplete}
            embedded
            progressLabel="Welcome setup"
          />
        </div>
      </div>
    </div>
  )
}
