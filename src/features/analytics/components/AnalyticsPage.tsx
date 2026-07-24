import { Button } from '@components/ui/Button'
import { AnalyticsKpiRow, ChartPanel, SkillTrendGrid } from '@components/charts'
import { Panel } from '@components/ui/Panel'
import { useAuth } from '@hooks/useAuth'
import { useAnalytics } from '@features/analytics'
import { AnalyticsPageSkeleton } from './AnalyticsPageSkeleton'
import { GymLogQuickAdd } from './GymLogQuickAdd'

export function AnalyticsPage() {
  const { user } = useAuth()
  const { dashboard, loading, error, reload, refreshing } = useAnalytics()

  if (loading && !dashboard) {
    return <AnalyticsPageSkeleton />
  }

  if (error) {
    return (
      <Panel title="Analytics" subtitle="Error loading data" fullWidth>
        <p className="text-sm text-[var(--color-danger)]">{error}</p>
        <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={() => void reload()}>
          Retry
        </Button>
      </Panel>
    )
  }

  if (!dashboard || !user) {
    return (
      <Panel title="Analytics" subtitle="Sign in to view your metrics" fullWidth>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Log in to see task, goal, training, and college analytics.
        </p>
      </Panel>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] animate-fade-in">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
            Analytics
          </h2>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Personal insights across tasks, goals, training, running, gym, college, and journal.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={refreshing}
            onClick={() => void reload()}
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </header>

      <div className="mb-4">
        <AnalyticsKpiRow kpis={dashboard.kpis} />
      </div>

      <div className="dashboard-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartPanel
          title="Task Completion"
          subtitle="Daily completion rate (7 days)"
          series={dashboard.taskCompletion}
          color="var(--color-success)"
        />
        <ChartPanel
          title="Goal Progress"
          subtitle="Average active goal progress by week"
          series={dashboard.goalProgress}
          color="var(--color-warning)"
        />
        <ChartPanel
          title="Training Frequency"
          subtitle="Practice sessions per week"
          series={dashboard.trainingFrequency}
          color="var(--color-accent)"
        />
        <ChartPanel
          title="Running"
          subtitle="Weekly distance"
          series={dashboard.running}
          color="var(--color-accent-muted)"
        />
        <ChartPanel
          title="Gym"
          subtitle="Weekly gym minutes"
          series={dashboard.gym}
          color="#636366"
          emptyMessage="No gym sessions yet. Log one below to start tracking."
          action={<GymLogQuickAdd userId={user.id} onLogged={() => void reload()} />}
        />
        <ChartPanel
          title="College Application Progress"
          subtitle="Per-school checklist progress"
          series={dashboard.collegeProgress}
          color="var(--color-success)"
          emptyMessage="Add colleges in the College tab to track application progress."
        />
        <ChartPanel
          title="Journal Consistency"
          subtitle="Entries logged (14 days)"
          series={dashboard.journalConsistency}
          color="var(--color-accent)"
          fullWidth
        />
        <div className="lg:col-span-2">
          <SkillTrendGrid skills={dashboard.technicalSkills} />
        </div>
      </div>

      <p className="mt-4 text-[10px] text-[var(--color-text-tertiary)]">
        Last computed {new Date(dashboard.computedAt).toLocaleString()}
      </p>
    </div>
  )
}
