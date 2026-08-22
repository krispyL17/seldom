import { useState } from 'react'
import { AnalyticsUnlockDialog, analyticsUnlockBody } from './AnalyticsUnlockDialog'
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

  if (variant === 'modal-on-mount') {
    return (
      <AnalyticsUnlockDialog open={modalOpen} onClose={() => setModalOpen(false)} dashboard={dashboard} />
    )
  }

  return (
    <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-4 py-3">
      {analyticsUnlockBody(dashboard)}
    </div>
  )
}
