import { Link } from 'react-router-dom'
import { EmptyState } from '@components/ui/EmptyState'
import { Panel } from '@components/ui/Panel'

/**
 * Right-side insights rail — collapses below main content on smaller screens.
 */
export function InsightsPanel() {
  return (
    <aside aria-label="Insights" className="space-y-4 xl:sticky xl:top-4 xl:w-72 xl:shrink-0">
      <Panel title="AI Insights">
        <EmptyState
          title="Insights appear as you log"
          description="Seldom OS generates insights from your tasks, goals, training, and journal — nothing is shown until there's real data to analyze."
          action={
            <Link
              to="/assistant"
              className="inline-flex h-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-3 text-xs font-medium text-white hover:bg-[var(--color-accent-hover)]"
            >
              Ask Seldom OS
            </Link>
          }
        />
      </Panel>

      <Panel title="Personal Records">
        <EmptyState
          title="No records yet"
          description="Personal records are calculated from runs, training, and goals you log."
        />
      </Panel>

      <Panel title="Streaks">
        <EmptyState
          title="No streaks yet"
          description="Streaks build automatically once you start logging consistently."
        />
      </Panel>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/8 p-4 shadow-[var(--shadow-panel)]">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-accent-muted)]">
          Suggested next step
        </p>
        <p className="mt-1.5 text-sm font-semibold text-[var(--color-text-primary)]">
          Start with one log
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Add a task, log a training session, or ask Seldom OS what to focus on first.
        </p>
        <div className="mt-3">
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
