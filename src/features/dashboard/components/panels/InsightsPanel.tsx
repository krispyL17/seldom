import { Link } from 'react-router-dom'
import { Badge } from '@components/ui/Badge'
import { Panel } from '@components/ui/Panel'
import { insightsData } from '../../data/mockData'

/**
 * Right-side insights rail — collapses below main content on smaller screens.
 */
export function InsightsPanel() {
  return (
    <aside aria-label="Insights" className="space-y-4 xl:sticky xl:top-4 xl:w-72 xl:shrink-0">
      <Panel title="AI Insights" badge={<Badge variant="muted">Preview</Badge>}>
        <ul className="space-y-2.5">
          {insightsData.aiInsights.map((insight) => (
            <li
              key={insight}
              className="flex gap-2 text-xs leading-relaxed text-[var(--color-text-secondary)]"
            >
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent)]" />
              {insight}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Personal Records">
        <ul className="space-y-0">
          {insightsData.personalRecords.map((record) => (
            <li
              key={record.label}
              className="flex items-center justify-between border-b border-[var(--color-border)] py-2.5 last:border-0"
            >
              <span className="text-xs text-[var(--color-text-secondary)]">{record.label}</span>
              <span className="text-xs font-semibold tabular-nums text-[var(--color-text-primary)]">
                {record.value}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Streaks">
        <div className="space-y-3">
          {insightsData.streaks.map((streak) => (
            <div key={streak.label} className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-secondary)]">{streak.label}</span>
              <div className="text-right">
                <span className="text-lg font-bold tabular-nums text-[var(--color-accent-muted)]">
                  {streak.count}
                </span>
                <span className="ml-1 text-[10px] text-[var(--color-text-tertiary)]">
                  {streak.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Motivation">
        <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
          {insightsData.motivation}
        </p>
      </Panel>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/8 p-4 shadow-[var(--shadow-panel)]">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-accent-muted)]">
          Suggested Next Action
        </p>
        <p className="mt-1.5 text-sm font-semibold text-[var(--color-text-primary)]">
          {insightsData.suggestedAction.title}
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          {insightsData.suggestedAction.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <Badge variant="muted">{insightsData.suggestedAction.duration}</Badge>
          <Link
            to="/assistant"
            className="inline-flex h-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-3 text-xs font-medium text-white hover:bg-[var(--color-accent-hover)]"
          >
            Open Seldom OS
          </Link>
        </div>
      </div>
    </aside>
  )
}
