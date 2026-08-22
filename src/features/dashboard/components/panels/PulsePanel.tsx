import { Link } from 'react-router-dom'
import { Panel } from '@components/ui/Panel'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { useDashboardInsights } from '@features/analytics/hooks/useDashboardInsights'
import { cn } from '@lib/utils'

const TONE_CLASS = {
  strong: 'text-[var(--color-success)]',
  mixed: 'text-[var(--color-warning)]',
  quiet: 'text-[var(--color-text-tertiary)]',
  urgent: 'text-[var(--color-danger)]',
} as const

export function PulsePanel() {
  const { insights, loading } = useDashboardInsights()

  return (
    <Panel
      title="This week's pulse"
      accentNavId="analytics"
      fillHeight
      scrollCap
      subtitle={loading ? 'Reading your logs…' : 'Life + school + performance'}
      className="lg:col-span-3"
    >
      {loading || !insights ? (
        <PanelSkeleton lines={3} />
      ) : (
        <div className="space-y-3">
          <div>
            <p className={cn('text-sm font-semibold', TONE_CLASS[insights.weekHeadline.tone])}>
              {insights.weekHeadline.adjective}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              {insights.weekHeadline.sentence}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5">
              <dt className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Training
              </dt>
              <dd className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
                {insights.pulse.trainingSessions}
                <span className="ml-0.5 text-xs font-normal text-[var(--color-text-secondary)]">
                  this wk
                </span>
              </dd>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5">
              <dt className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Journal
              </dt>
              <dd className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
                {insights.pulse.journalDays}
                <span className="ml-0.5 text-xs font-normal text-[var(--color-text-secondary)]">
                  / 14 d
                </span>
              </dd>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5">
              <dt className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Open tasks
              </dt>
              <dd className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
                {insights.pulse.openTasks}
              </dd>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5">
              <dt className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Colleges
              </dt>
              <dd className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
                {insights.pulse.collegeApps}
                {insights.pulse.collegeProgress > 0 && (
                  <span className="ml-0.5 text-xs font-normal text-[var(--color-text-secondary)]">
                    · {insights.pulse.collegeProgress}%
                  </span>
                )}
              </dd>
            </div>
          </dl>

          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {insights.pulse.message}
          </p>

          <p className="border-t border-[var(--color-border)] pt-2 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
            {insights.dailyInsight}
          </p>

          <Link
            to="/analytics"
            className="inline-flex text-xs font-medium text-[var(--color-accent-muted)] hover:underline"
          >
            See full progress →
          </Link>
        </div>
      )}
    </Panel>
  )
}
