import { Panel } from '@components/ui/Panel'
import { Badge } from '@components/ui/Badge'
import { SeniorModePrompt } from '../shared/SeniorModePrompt'
import { useCollege } from '../../hooks/useCollege'
import { formatDate } from '../../utils'

const CATEGORY_LABELS = {
  activity: 'Activity',
  award: 'Award',
  project: 'Project',
  deadline: 'Deadline',
  essay: 'Essay',
  milestone: 'Milestone',
} as const

const CATEGORY_VARIANTS = {
  activity: 'accent',
  award: 'success',
  project: 'default',
  deadline: 'danger',
  essay: 'warning',
  milestone: 'muted',
} as const

export function TimelinePage() {
  const { timeline, loading, isSeniorMode, userData } = useCollege()

  const byYear = timeline.reduce<Record<string, typeof timeline>>((acc, entry) => {
    const year = entry.date.slice(0, 4)
    if (!acc[year]) acc[year] = []
    acc[year].push(entry)
    return acc
  }, {})

  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a))

  if (loading) {
    return <p className="text-sm text-[var(--color-text-secondary)]">Loading timeline…</p>
  }

  return (
    <div className="space-y-4">
      {!isSeniorMode && <SeniorModePrompt variant="card" />}

      {isSeniorMode && userData?.resumeSettings.seniorModeStartedAt && (
        <Panel title="Senior year started" subtitle="Application mode activated">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Unlocked {formatDate(userData.resumeSettings.seniorModeStartedAt.slice(0, 10))} — full
            application tracking is active.
          </p>
        </Panel>
      )}

      <Panel
        title="Experience Timeline"
        subtitle={`${timeline.length} events chronologically`}
      >
        {timeline.length === 0 ? (
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Add activities, awards, projects, or deadlines to build your timeline.
          </p>
        ) : (
          <div className="space-y-6">
            {years.map((year) => (
              <section key={year}>
                <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
                  {year}
                </h3>
                <ol className="relative space-y-0 border-l border-[var(--color-border)] pl-4">
                  {byYear[year].map((entry) => (
                    <li key={entry.id} className="relative pb-4 last:pb-0">
                      <span
                        className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[var(--color-accent)] ring-4 ring-[var(--color-surface-base)]"
                        aria-hidden
                      />
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">
                            {entry.title}
                          </p>
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {entry.subtitle}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant={CATEGORY_VARIANTS[entry.category]}>
                            {CATEGORY_LABELS[entry.category]}
                          </Badge>
                          <span className="text-[10px] tabular-nums text-[var(--color-text-tertiary)]">
                            {formatDate(entry.date)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
