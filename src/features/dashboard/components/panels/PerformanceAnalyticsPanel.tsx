import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Panel, PanelActionLink } from '@components/ui/Panel'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { MetricTile } from '@components/ui/MiniBarChart'
import { ProgressBar } from '@components/ui/ProgressBar'
import { AnalyticsUnlockDialog } from '@features/analytics/components/AnalyticsUnlockDialog'
import { useAnalytics } from '@features/analytics'
import { useCollege } from '@features/college/hooks/useCollege'
import { useDashboardInsights } from '@features/analytics/hooks/useDashboardInsights'
import { analyticsHasEnoughData, analyticsUnlockProgress } from '@features/analytics/utils/unlock'
import { analyticsWeekRangeLabel } from '@features/analytics/utils/rangeLabel'
import { useAuth } from '@hooks/useAuth'

function analyticsSubtitle(
  weekRange: string,
  applicationPhase: string,
  nearestDeadlineLabel: string | null,
  nearestDeadlineDays: number | null,
): string {
  if (applicationPhase === 'senior' && nearestDeadlineLabel && nearestDeadlineDays != null) {
    return `${nearestDeadlineLabel} in ${nearestDeadlineDays}d · ${weekRange}`
  }
  if (applicationPhase === 'junior') {
    return `Building consistency · ${weekRange}`
  }
  return weekRange
}

export function PerformanceAnalyticsPanel() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { applicationPhase, colleges } = useCollege()
  const { insights } = useDashboardInsights()
  const { dashboard, loading } = useAnalytics()
  const progress = analyticsUnlockProgress(dashboard)
  const unlocked = analyticsHasEnoughData(dashboard)
  const [warnOpen, setWarnOpen] = useState(false)

  const unlockWarningModal = (
    <AnalyticsUnlockDialog
      open={warnOpen}
      onClose={() => setWarnOpen(false)}
      dashboard={dashboard}
      onContinue={() => navigate('/analytics')}
    />
  )

  if (!user) {
    return (
      <Panel
        title="Your progress"
        accentNavId="analytics"
        fillHeight
        scrollCap
        subtitle="Sign in required"
        action={<PanelActionLink to="/settings">Sign in</PanelActionLink>}
      >
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Sign in to see task, training, and goal trends in one place.
        </p>
      </Panel>
    )
  }

  if (loading || !dashboard) {
    return (
      <Panel
        title="Your progress"
        accentNavId="analytics"
        fillHeight
        scrollCap
        subtitle="Loading…"
      >
        <PanelSkeleton lines={2} />
      </Panel>
    )
  }

  if (!unlocked) {
    return (
      <>
        <Panel
          title="Your progress"
          accentNavId="analytics"
          fillHeight
          scrollCap
          subtitle={`${progress.completed}/${progress.total} activity types`}
          action={<PanelActionLink onClick={() => setWarnOpen(true)}>Open</PanelActionLink>}
        >
          <ProgressBar
            value={(progress.completed / progress.total) * 100}
            showValue={false}
            size="sm"
          />
          <p className="mt-1.5 line-clamp-2 text-xs text-[var(--color-text-tertiary)]">
            {progress.nextHint}
          </p>
        </Panel>
        {unlockWarningModal}
      </>
    )
  }

  const weekRange = analyticsWeekRangeLabel(dashboard.weekCount)
  const nearest = insights?.narrativeInput
  const taskKpi = dashboard.kpis.find((k) => k.label === 'Task completion')
  const trainingKpi = dashboard.kpis.find((k) => k.label === 'Training / wk')
  const goalKpi = dashboard.kpis.find((k) => k.label === 'Goal progress')
  const journalKpi = dashboard.kpis.find((k) => k.label === 'Journal streak')
  const collegeKpi = dashboard.kpis.find((k) => k.label === 'College progress')
  const showCollege = applicationPhase === 'senior' && colleges.length > 0

  return (
    <Panel
      title="Your progress"
      accentNavId="analytics"
      fillHeight
      scrollCap
      subtitle={analyticsSubtitle(
        weekRange,
        applicationPhase,
        nearest?.nearestDeadlineLabel ?? null,
        nearest?.nearestDeadlineDays ?? null,
      )}
      action={<PanelActionLink to="/analytics">Open</PanelActionLink>}
    >
      <div className="grid grid-cols-2 gap-1.5">
        <MetricTile
          size="sm"
          label="Tasks"
          value={taskKpi?.value ?? 0}
          unit={taskKpi?.unit}
          trend={taskKpi?.trend}
          deltaLabel={taskKpi?.deltaLabel}
          sparkline={taskKpi?.sparkline}
          sparklineColor="var(--color-success)"
        />
        <MetricTile
          size="sm"
          label="Training"
          value={trainingKpi?.value ?? 0}
          unit={trainingKpi?.unit}
          trend={trainingKpi?.trend}
          deltaLabel={trainingKpi?.deltaLabel}
          sparkline={trainingKpi?.sparkline}
        />
        <MetricTile
          size="sm"
          label="Goals"
          value={goalKpi?.value ?? 0}
          unit="%"
          trend={goalKpi?.trend}
          deltaLabel={goalKpi?.deltaLabel}
          sparkline={goalKpi?.sparkline}
          sparklineColor="var(--color-warning)"
        />
        {showCollege ? (
          <MetricTile
            size="sm"
            label="College"
            value={collegeKpi?.value ?? 0}
            unit="%"
            trend={collegeKpi?.trend}
            sparkline={collegeKpi?.sparkline}
            sparklineColor="var(--color-success)"
          />
        ) : (
          <MetricTile
            size="sm"
            label="Journal"
            value={journalKpi?.value ?? 0}
            unit="d"
            trend={journalKpi?.trend}
            deltaLabel={journalKpi?.deltaLabel}
            sparkline={journalKpi?.sparkline}
          />
        )}
      </div>
    </Panel>
  )
}
