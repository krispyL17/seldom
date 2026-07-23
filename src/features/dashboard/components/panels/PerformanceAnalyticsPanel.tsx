import { Link } from 'react-router-dom'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { Panel, PanelDivider } from '@components/ui/Panel'
import { MiniBarChart, MetricTile } from '@components/ui/MiniBarChart'
import { useAnalytics } from '@features/analytics'
import { useAuth } from '@hooks/useAuth'

export function PerformanceAnalyticsPanel() {
  const { user } = useAuth()
  const { dashboard, loading } = useAnalytics()

  if (!user) {
    return (
      <Panel title="Performance Analytics" subtitle="Sign in for live metrics" fullWidth>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Log in to see your task, training, and goal trends here.
        </p>
      </Panel>
    )
  }

  if (loading || !dashboard) {
    return (
      <Panel title="Performance Analytics" subtitle="Loading metrics…" fullWidth>
        <PanelSkeleton lines={4} />
      </Panel>
    )
  }

  const taskKpi = dashboard.kpis.find((k) => k.label === 'Task completion')
  const goalKpi = dashboard.kpis.find((k) => k.label === 'Goal progress')
  const trainingKpi = dashboard.kpis.find((k) => k.label === 'Training / wk')
  const journalKpi = dashboard.kpis.find((k) => k.label === 'Journal streak')

  return (
    <Panel
      title="Performance Analytics"
      subtitle="Live from your data"
      fullWidth
      action={
        <Link
          to="/analytics"
          className="rounded-sm text-[10px] font-medium text-[var(--color-accent-muted)] hover:underline"
        >
          Full analytics
        </Link>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MetricTile
          label="Tasks Done"
          value={taskKpi?.value ?? 0}
          unit={taskKpi?.unit}
          trend={taskKpi?.trend}
        />
        <MetricTile
          label="Goal Progress"
          value={goalKpi?.value ?? 0}
          unit={goalKpi?.unit}
          trend={goalKpi?.trend}
        />
        <MetricTile
          label="Training"
          value={trainingKpi?.value ?? 0}
          unit={trainingKpi?.unit}
          trend={trainingKpi?.trend}
        />
        <MetricTile
          label="Journal Streak"
          value={journalKpi?.value ?? 0}
          unit={journalKpi?.unit}
          trend={journalKpi?.trend}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <PanelDivider label="Training Frequency" />
          <MiniBarChart
            data={dashboard.trainingFrequency.data}
            labels={dashboard.trainingFrequency.labels}
            color="var(--color-accent)"
          />
        </div>
        <div>
          <PanelDivider label="Task Completion" />
          <MiniBarChart
            data={dashboard.taskCompletion.data}
            labels={dashboard.taskCompletion.labels}
            color="var(--color-success)"
          />
        </div>
        <div>
          <PanelDivider label="Goal Progress" />
          <MiniBarChart
            data={dashboard.goalProgress.data}
            labels={dashboard.goalProgress.labels}
            color="var(--color-warning)"
          />
        </div>
      </div>
    </Panel>
  )
}
