import { useCallback } from 'react'
import { IconSparkles } from '@components/ui/icons'
import { Modal } from '@components/ui/Modal'
import { ONBOARDING_DISMISS_DISCLAIMER } from '@features/onboarding/confirmDismiss'
import { OnboardingChatPanel } from '@features/onboarding/OnboardingChatPanel'
import { appTutorialConfig } from '@config/onboardingPrompts'
import { useUserPreferences } from '@features/preferences'
import { useAuth } from '@hooks/useAuth'
import { authService } from '@services/auth'

interface AppTutorialModalProps {
  open: boolean
  onClose: () => void
}

export function AppTutorialModal({ open, onClose }: AppTutorialModalProps) {
  const { user } = useAuth()
  const { updatePreferences, completeTutorial, dismissTutorial, tutorialCompleted } =
    useUserPreferences()

  const handleDismiss = useCallback(() => {
    if (!tutorialCompleted) {
      void dismissTutorial()
    } else {
      onClose()
    }
  }, [tutorialCompleted, dismissTutorial, onClose])

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

  return (
    <Modal
      open={open}
      onClose={handleDismiss}
      title="Meet Seldom"
      subtitle="Personalize your workspace — tab tours wait until you ask for them"
      size="lg"
      headerAction={
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-secondary)]"
        >
          {!tutorialCompleted ? 'Skip setup' : 'Close'}
        </button>
      }
    >
      <div className="mb-4 flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent-subtle)]">
          <IconSparkles width={16} height={16} className="text-[var(--color-accent-muted)]" aria-hidden />
        </div>
        <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
          Answer a few quick questions so Seldom labels your tabs and surfaces the right modules.
        </p>
      </div>
      <OnboardingChatPanel
        config={appTutorialConfig}
        onComplete={handleCustomizeComplete}
        embedded
        progressLabel="Welcome setup"
      />
      {!tutorialCompleted && (
        <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
          {ONBOARDING_DISMISS_DISCLAIMER}
        </p>
      )}
    </Modal>
  )
}
