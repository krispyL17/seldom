import { Button } from '@components/ui/Button'
import { AnalyticsKpiRow, ChartPanel } from '@components/charts'
import { Panel } from '@components/ui/Panel'
import { useAuth } from '@hooks/useAuth'
import { useAnalytics } from '@features/analytics'
import { useDashboardInsights } from '@features/analytics/hooks/useDashboardInsights'
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
  const { insights } = useDashboardInsights()

  if (loading && !dashboard) {
    return <AnalyticsPageSkeleton />
  }

  if (error) {
    return (
      <Panel title="Your week" subtitle="Couldn't refresh your stats" fullWidth>
        <p className="text-sm text-[var(--color-danger)]">{error}</p>
        <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={() => void reload()}>
          Retry
        </Button>
      </Panel>
    )
  }

  if (!dashboard || !user) {
    return (
      <Panel title="Your week" subtitle="Sign in to view progress" fullWidth>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Log in to see trends from tasks, training, journal, and college prep.
        </p>
      </Panel>
    )
  }

  const weekRange = analyticsWeekRangeLabel(dashboard.weekCount)
  const taskDays = analyticsTaskDayCount(dashboard.weekCount)
  const journalDays = analyticsJournalDayCount(dashboard.weekCount)
  const headline = insights?.weekHeadline

  return (
    <div className="mx-auto max-w-[1600px] animate-fade-in">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent-muted)]">
            Based on what you logged
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
            Your week
          </h2>
          {headline ? (
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              <span className="font-semibold text-[var(--color-text-primary)]">{headline.adjective}</span>
              {' — '}
              {headline.sentence}
            </p>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
              {weekRange} cross-domain trends from tasks, goals, training, runs, gym, college prep,
              and journal entries.
            </p>
          )}
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
          title="Tasks completed"
          subtitle={`Daily completions (${taskDays} days)`}
          series={dashboard.taskCompletion}
          color="var(--color-success)"
          zeroMessage="No tasks completed in this window yet."
        />
        <ChartPanel
          title="Goal progress"
          subtitle={`Average active goal progress (${weekRange})`}
          series={dashboard.goalProgress}
          color="var(--color-warning)"
          zeroMessage="No goal progress recorded in this period yet."
        />
        <ChartPanel
          title="Training frequency"
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
          title="College application progress"
          subtitle="Per-school checklist progress"
          series={dashboard.collegeProgress}
          color="var(--color-success)"
          emptyMessage="Add colleges in Junior Prep to track application progress."
          zeroMessage="No checklist progress recorded yet."
        />
        <ChartPanel
          title="Journal consistency"
          subtitle={`Days with entries (${journalDays} days)`}
          series={dashboard.journalConsistency}
          color="var(--color-accent)"
          zeroMessage="No journal entries in this period yet."
          fullWidth
          variant="heatmap"
        />
      </div>

      {insights?.dailyInsight && (
        <Panel title="Today's read" subtitle="One takeaway from your logs" fullWidth className="mt-4">
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {insights.dailyInsight}
          </p>
        </Panel>
      )}
    </div>
  )
}
