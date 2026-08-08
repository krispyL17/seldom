import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { Panel, PanelActionLink } from '@components/ui/Panel'
import { MetricTile } from '@components/ui/MiniBarChart'
import { ProgressBar } from '@components/ui/ProgressBar'
import { useAnalytics } from '@features/analytics'
import { analyticsHasEnoughData, analyticsUnlockProgress } from '@features/analytics/utils/unlock'
import { analyticsWeekRangeLabel } from '@features/analytics/utils/rangeLabel'
import { useAuth } from '@hooks/useAuth'

/**
 * Analytics = cross-app trends (tasks, goals, training, journal, runs, gym).
 * Starts at 2 weeks and expands to 4 once older activity exists.
 */
export function PerformanceAnalyticsPanel() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { dashboard, loading } = useAnalytics()
  const progress = analyticsUnlockProgress(dashboard)
  const unlocked = analyticsHasEnoughData(dashboard)
  const [warnOpen, setWarnOpen] = useState(false)

  function openAnalyticsUnlocked() {
    navigate('/analytics')
  }

  const lockedOpenAction = (
    <PanelActionLink onClick={() => setWarnOpen(true)}>Open →</PanelActionLink>
  )

  const unlockWarningModal = (
    <Modal open={warnOpen} onClose={() => setWarnOpen(false)} title="Analytics not unlocked yet">
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
        Analytics unlocks when you log tasks, sessions, journal entries, or runs. If you open it now,
        the tab will be mostly empty until you add activity.
      </p>
      <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
        Next step: {progress.nextHint}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => setWarnOpen(false)}>
          Go back
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setWarnOpen(false)
            openAnalyticsUnlocked()
          }}
        >
          Continue anyway
        </Button>
      </div>
    </Modal>
  )

  if (!user) {
    return (
      <Panel title="Analytics" subtitle="Sign in to track trends" fullWidth>
        <p className="text-[11px] text-[var(--color-text-tertiary)]">Log in to unlock cross-app charts.</p>
      </Panel>
    )
  }

  if (loading || !dashboard) {
    return (
      <Panel title="Analytics" subtitle="Loading…" fullWidth>
        <p className="text-[11px] text-[var(--color-text-tertiary)]">Loading…</p>
      </Panel>
    )
  }

  if (!unlocked) {
    return (
      <>
        <Panel
          title="Analytics"
          subtitle={`${progress.completed}/${progress.total} activity types logged`}
          fullWidth
          action={lockedOpenAction}
        >
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Unlocks when you log tasks, sessions, journal entries, or runs — trends start at 2 weeks
            and expand to 4 as you build history.
          </p>
          <ProgressBar
            value={(progress.completed / progress.total) * 100}
            showValue={false}
            size="sm"
            className="mt-2"
          />
          <p className="mt-1.5 text-[10px] text-[var(--color-text-tertiary)]">Next: {progress.nextHint}</p>
        </Panel>
        {unlockWarningModal}
      </>
    )
  }

  const taskKpi = dashboard.kpis.find((k) => k.label === 'Task completion')
  const trainingKpi = dashboard.kpis.find((k) => k.label === 'Training / wk')

  const weekRange = analyticsWeekRangeLabel(dashboard.weekCount)

  return (
    <Panel
      title="Analytics"
      subtitle={`${weekRange} cross-app trends`}
      fullWidth
      action={
        <Link to="/analytics" className="text-[10px] text-[var(--color-accent-muted)] hover:underline">
          Open →
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <MetricTile label="Tasks" value={taskKpi?.value ?? 0} unit={taskKpi?.unit} />
        <MetricTile label="Training/wk" value={trainingKpi?.value ?? 0} unit={trainingKpi?.unit} />
        <MetricTile label="Goals" value={dashboard.kpis.find((k) => k.label === 'Goal progress')?.value ?? 0} unit="%" />
        <MetricTile label="Journal" value={dashboard.kpis.find((k) => k.label === 'Journal streak')?.value ?? 0} unit="d" />
      </div>
    </Panel>
  )
}
