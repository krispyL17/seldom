import { Button } from '@components/ui/Button'
import { AnalyticsKpiRow, ChartPanel } from '@components/charts'
import { Panel } from '@components/ui/Panel'
import { useAuth } from '@hooks/useAuth'
import { useAnalytics } from '@features/analytics'
import {
  analyticsJournalDayCount,
  analyticsTaskDayCount,
  analyticsWeekRangeLabel,
} from '@features/analytics/utils/rangeLabel'
import { formatMinutesDuration } from '@lib/formatDuration'
import { AnalyticsPageSkeleton } from './AnalyticsPageSkeleton'
import { AnalyticsUnlockNotice } from './AnalyticsUnlockNotice'
import { GymLogQuickAdd } from './GymLogQuickAdd'

export function AnalyticsPage() {
  const { user } = useAuth()
  const { dashboard, loading, error, reload, refreshing } = useAnalytics()

  if (loading && !dashboard) {
    return <AnalyticsPageSkeleton />
  }

  if (error) {
    return (
      <Panel title="Mission Analytics" subtitle="Telemetry sync error" fullWidth>
        <p className="text-sm text-[var(--color-danger)]">{error}</p>
        <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={() => void reload()}>
          Retry
        </Button>
      </Panel>
    )
  }

  if (!dashboard || !user) {
    return (
      <Panel title="Mission Analytics" subtitle="Sign in to view telemetry" fullWidth>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Log in to see the advanced analytics layer of your command center.
        </p>
      </Panel>
    )
  }

  const weekRange = analyticsWeekRangeLabel(dashboard.weekCount)
  const taskDays = analyticsTaskDayCount(dashboard.weekCount)
  const journalDays = analyticsJournalDayCount(dashboard.weekCount)

  return (
    <div className="mx-auto max-w-[1600px] animate-fade-in">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-accent-muted)]">
            Command center · advanced telemetry
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
            Mission Analytics
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
            The deep-read layer of your personal command center — {weekRange} cross-domain trends from
            tasks, goals, training, runs, gym, college prep, and journal entries you have logged.
            Charts expand to 4 weeks once you have older activity.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={refreshing}
          onClick={() => void reload()}
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </header>

      <AnalyticsUnlockNotice dashboard={dashboard} variant="modal-on-mount" />
      <AnalyticsUnlockNotice dashboard={dashboard} variant="banner" />

      <div className="mb-4">
        <AnalyticsKpiRow kpis={dashboard.kpis} />
      </div>

      <div className="dashboard-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartPanel
          title="Task Completion"
          subtitle={`Daily completion rate (${taskDays} days)`}
          series={dashboard.taskCompletion}
          color="var(--color-success)"
          zeroMessage="No tasks completed in this window yet."
        />
        <ChartPanel
          title="Goal Progress"
          subtitle={`Average active goal progress (${weekRange})`}
          series={dashboard.goalProgress}
          color="var(--color-warning)"
          zeroMessage="No goal progress recorded in this period yet."
        />
        <ChartPanel
          title="Training Frequency"
          subtitle={`Practice sessions per week (${weekRange})`}
          series={dashboard.trainingFrequency}
          color="var(--color-accent)"
          zeroMessage="No training sessions logged in this period yet."
        />
        <ChartPanel
          title="Running"
          subtitle={`Weekly distance (${weekRange})`}
          series={dashboard.running}
          color="var(--color-accent-muted)"
          zeroMessage="No runs logged in this period yet."
        />
        <ChartPanel
          title="Gym"
          subtitle={`Weekly gym time (${weekRange})`}
          series={dashboard.gym}
          color="#636366"
          formatValue={formatMinutesDuration}
          emptyMessage="No gym sessions yet. Log one below to start tracking."
          zeroMessage="No gym time logged in this period yet."
          action={<GymLogQuickAdd userId={user.id} onLogged={() => void reload()} />}
        />
        <ChartPanel
          title="College Application Progress"
          subtitle="Per-school checklist progress"
          series={dashboard.collegeProgress}
          color="var(--color-success)"
          emptyMessage="Add colleges in Junior Prep to track application progress."
          zeroMessage="No checklist progress recorded yet."
        />
        <ChartPanel
          title="Journal Consistency"
          subtitle={`Entries logged (${journalDays} days)`}
          series={dashboard.journalConsistency}
          color="var(--color-accent)"
          zeroMessage="No journal entries in this period yet."
          fullWidth
        />
      </div>

      <p className="mt-4 text-[10px] text-[var(--color-text-tertiary)]">
        Last computed {new Date(dashboard.computedAt).toLocaleString()}
      </p>
    </div>
  )
}
