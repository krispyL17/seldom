import { type ReactNode } from 'react'
import { Button } from '@components/ui/Button'
import { Modal, ModalFooter } from '@components/ui/Modal'
import { analyticsUnlockProgress } from '@features/analytics/utils/unlock'
import type { AnalyticsDashboard } from '@analytics/types'

interface AnalyticsUnlockDialogProps {
  open: boolean
  onClose: () => void
  dashboard: AnalyticsDashboard | null
  onContinue?: () => void
}

export function AnalyticsUnlockDialog({
  open,
  onClose,
  dashboard,
  onContinue,
}: AnalyticsUnlockDialogProps) {
  const progress = analyticsUnlockProgress(dashboard)

  return (
    <Modal open={open} onClose={onClose} title="Analytics not unlocked yet" size="sm">
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
        Log tasks, sessions, journal entries, or runs to unlock charts. Opening now will show mostly empty
        views.
      </p>
      <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
        Progress: {progress.completed}/{progress.total} activity types · {progress.nextHint}
      </p>
      <ModalFooter>
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>
          Go back
        </Button>
        {onContinue ? (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onClose()
              onContinue()
            }}
          >
            Continue anyway
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={onClose}>
            Got it
          </Button>
        )}
      </ModalFooter>
    </Modal>
  )
}

/** Shared unlock notice body for banner variant */
export function analyticsUnlockBody(dashboard: AnalyticsDashboard | null): ReactNode {
  const progress = analyticsUnlockProgress(dashboard)
  return (
    <>
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
        Analytics unlocks when you log tasks, sessions, journal entries, or runs. Charts stay mostly empty
        until then — progress: {progress.completed}/{progress.total} activity types.
      </p>
      <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">Next step: {progress.nextHint}</p>
    </>
  )
}
