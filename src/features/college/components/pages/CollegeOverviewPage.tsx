import { Link } from 'react-router-dom'
import { ProgressOverviewPanel } from '../dashboard/ProgressOverviewPanel'
import { UpcomingDeadlinesPanel } from '../dashboard/UpcomingDeadlinesPanel'
import { AiRecommendationsPanel } from '../dashboard/AiRecommendationsPanel'
import { CollegePageGrid, CollegePageShell } from '../CollegePageShell'
import { useCollege } from '../../hooks/useCollege'

const QUICK_LINKS = [
  { to: '/college/schools', label: 'Schools' },
  { to: '/college/deadlines', label: 'Deadlines' },
  { to: '/college/common-app', label: 'Common App' },
  { to: '/college/planning', label: 'Plan' },
  { to: '/college/advisor', label: 'AI Coach' },
] as const

export function CollegeOverviewPage() {
  const { isSeniorMode } = useCollege()

  return (
    <CollegePageShell>
      <div className="flex shrink-0 flex-wrap gap-1.5 text-[10px]">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent-muted)]"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <CollegePageGrid columns={2} rows={2}>
        <ProgressOverviewPanel />
        <UpcomingDeadlinesPanel />
        <AiRecommendationsPanel />
        <div className="panel flex flex-col justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-panel)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">
            {isSeniorMode ? 'Application season' : 'Junior prep'}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
            Use the tabs above for schools, deadlines, Common App, and planning. Everything fits on one screen — lists
            scroll inside their panels.
          </p>
        </div>
      </CollegePageGrid>
    </CollegePageShell>
  )
}
