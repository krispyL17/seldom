import { Link } from 'react-router-dom'
import { Badge } from '@components/ui/Badge'
import { EmptyState } from '@components/ui/EmptyState'
import { Panel } from '@components/ui/Panel'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { useDashboardInsights } from '@features/analytics/hooks/useDashboardInsights'
import { cn } from '@lib/utils'

const priorityVariant = {
  high: 'danger' as const,
  medium: 'warning' as const,
  low: 'muted' as const,
}

/**
 * Right-side insights rail — collapses below main content on smaller screens.
 */
export function InsightsPanel() {
  const { insights, loading } = useDashboardInsights()

  if (loading) {
    return (
      <aside aria-label="Insights" className="home-insights-rail space-y-4">
        <Panel title="Insights">
          <PanelSkeleton lines={3} />
        </Panel>
      </aside>
    )
  }

  const topInsights = insights?.insights.slice(0, 3) ?? []
  const records = insights?.personalRecords ?? []
  const streaks = insights?.streaks ?? []
  const action = insights?.suggestedAction

  return (
    <aside aria-label="Insights" className="home-insights-rail space-y-4">
      <Panel title="From your data" subtitle="Patterns Seldom noticed">
        {topInsights.length === 0 ? (
          <EmptyState
            title="Insights appear as you log"
            description="Tasks, training, journal, and college prep unlock personalized nudges."
            action={
              <Link
                to="/assistant"
                className="inline-flex h-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-3 text-xs font-medium text-white hover:bg-[var(--color-accent-hover)]"
              >
                Ask Seldom OS
              </Link>
            }
          />
        ) : (
          <ul className="space-y-2">
            {topInsights.map((insight) => (
              <li
                key={insight.id}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-2.5"
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-[var(--color-text-primary)]">{insight.title}</p>
                  <Badge variant={priorityVariant[insight.priority]}>{insight.priority}</Badge>
                </div>
                <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  {insight.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Personal records">
        {records.length === 0 ? (
          <EmptyState
            title="No records yet"
            description="Log runs, matches, and training to track personal bests."
          />
        ) : (
          <ul className="space-y-2">
            {records.map((record) => (
              <li
                key={record.id}
                className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-2"
              >
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-primary)]">{record.label}</p>
                  {record.detail && (
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">{record.detail}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
                    {record.value}
                  </p>
                  {record.isRecent && (
                    <span className="text-[10px] font-medium text-[var(--color-success)]">New</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Streaks">
        {streaks.length === 0 ? (
          <EmptyState
            title="No streaks yet"
            description="Streaks build when you log journal entries and training consistently."
          />
        ) : (
          <ul className="space-y-2">
            {streaks.map((streak) => (
              <li
                key={streak.id}
                className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-2"
              >
                <span className="text-xs text-[var(--color-text-secondary)]">{streak.label}</span>
                <span className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
                  {streak.count}
                  <span className="ml-1 text-xs font-normal text-[var(--color-text-tertiary)]">
                    {streak.unit}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {action && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/8 p-4 shadow-[var(--shadow-panel)]">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-accent-muted)]">
            Suggested next step
          </p>
          <p className="mt-1.5 text-sm font-semibold text-[var(--color-text-primary)]">{action.title}</p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{action.description}</p>
          {action.duration && (
            <p className={cn('mt-1 text-[10px] text-[var(--color-text-tertiary)]')}>{action.duration}</p>
          )}
          <div className="mt-3">
            <Link
              to={action.href}
              className="inline-flex h-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-3 text-xs font-medium text-white hover:bg-[var(--color-accent-hover)]"
            >
              Go →
            </Link>
          </div>
        </div>
      )}
    </aside>
  )
}
