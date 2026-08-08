import { useState } from 'react'
import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { analyticsUnlockProgress } from '@features/analytics/utils/unlock'
import type { AnalyticsDashboard } from '@analytics/types'

interface AnalyticsUnlockNoticeProps {
  dashboard: AnalyticsDashboard | null
  variant?: 'banner' | 'modal-on-mount'
}

export function AnalyticsUnlockNotice({
  dashboard,
  variant = 'banner',
}: AnalyticsUnlockNoticeProps) {
  const progress = analyticsUnlockProgress(dashboard)
  const [modalOpen, setModalOpen] = useState(variant === 'modal-on-mount')

  if (progress.unlocked) return null

  const body = (
    <>
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
        Analytics unlocks when you log tasks, sessions, journal entries, or runs. Charts stay mostly
        empty until then — progress: {progress.completed}/{progress.total} activity types.
      </p>
      <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">Next step: {progress.nextHint}</p>
    </>
  )

  if (variant === 'modal-on-mount') {
    return (
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Analytics not unlocked yet">
        {body}
        <div className="mt-4 flex justify-end">
          <Button type="button" size="sm" onClick={() => setModalOpen(false)}>
            Got it
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-4 py-3">
      {body}
    </div>
  )
}
