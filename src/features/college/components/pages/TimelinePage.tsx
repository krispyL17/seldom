import { Navigate } from 'react-router-dom'
import { Panel } from '@components/ui/Panel'
import { Badge } from '@components/ui/Badge'
import { useCollege } from '../../hooks/useCollege'
import { formatDate } from '../../utils'
import { cn } from '@lib/utils'

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

interface TimelineContentProps {
  compact?: boolean
  title?: string
  className?: string
}

export function TimelineContent({
  compact = false,
  title = 'Admission timeline',
  className,
}: TimelineContentProps) {
  const { timeline, loading } = useCollege()

  const byYear = timeline.reduce<Record<string, typeof timeline>>((acc, entry) => {
    const year = entry.date.slice(0, 4)
    if (!acc[year]) acc[year] = []
    acc[year].push(entry)
    return acc
  }, {})

  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a))

  if (loading) {
    return <p className="text-xs text-[var(--color-text-tertiary)]">Loading timeline…</p>
  }

  return (
    <Panel
      title={title}
      subtitle={
        timeline.length === 0
          ? 'Add schools to see typical deadlines and decision dates'
          : `${timeline.length} events`
      }
      fillHeight={compact}
      className={cn(compact && 'flex h-full min-h-0 flex-col', className)}
    >
      {timeline.length === 0 ? (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Each school gets placeholder dates (FAFSA, Early Action, Regular Decision, decision release, May 1).
          Add a school under the Schools tab.
        </p>
      ) : (
        <div className={cn('space-y-4', compact && 'college-scroll-region min-h-0 flex-1 overflow-y-auto pr-1')}>
          {years.map((year) => (
            <section key={year}>
              <h3 className="mb-2 text-[11px] font-semibold text-[var(--color-text-primary)]">{year}</h3>
              <ol className="relative space-y-0 border-l border-[var(--color-border)] pl-3">
                {byYear[year].map((entry) => (
                  <li key={entry.id} className="relative pb-3 last:pb-0">
                    <span
                      className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-[var(--color-accent)] ring-2 ring-[var(--color-surface-base)]"
                      aria-hidden
                    />
                    <div className="flex flex-wrap items-start justify-between gap-1">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-[var(--color-text-primary)]">{entry.title}</p>
                        <p className="text-[10px] text-[var(--color-text-secondary)]">{entry.subtitle}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Badge variant={CATEGORY_VARIANTS[entry.category]}>
                          {CATEGORY_LABELS[entry.category]}
                        </Badge>
                        <span className="text-[9px] tabular-nums text-[var(--color-text-tertiary)]">
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
  )
}

/** @deprecated Use /college/deadlines */
export function TimelinePage() {
  return <Navigate to="/college/deadlines" replace />
}
