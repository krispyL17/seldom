import { Panel } from '@components/ui/Panel'
import { Badge } from '@components/ui/Badge'
import { EmptyState } from '@components/ui/EmptyState'
import { useCollege } from '../../hooks/useCollege'
import { daysUntil, deadlineUrgencyVariant, formatShortDate, getAllDeadlines } from '../../utils'

export function UpcomingDeadlinesPanel() {
  const { colleges, isSeniorMode } = useCollege()
  const deadlines = getAllDeadlines(colleges)
    .filter((d) => daysUntil(d.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6)

  return (
    <Panel fillHeight title="Upcoming Deadlines" subtitle={isSeniorMode ? 'Next 6 across all schools' : 'Tests, visits & prep dates'}>
      {deadlines.length === 0 ? (
        <EmptyState
          title="No upcoming deadlines"
          description={
            isSeniorMode
              ? 'Add deadlines on school profiles to see them here.'
              : 'Add test dates, visits, or prep milestones to stay on track.'
          }
        />
      ) : (
        <ul className="space-y-2">
          {deadlines.map((d) => {
            const days = daysUntil(d.date)
            return (
              <li
                key={d.id}
                className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[var(--color-text-primary)]">{d.label}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">{d.collegeName}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[10px] tabular-nums text-[var(--color-text-secondary)]">
                    {formatShortDate(d.date)}
                  </span>
                  <Badge variant={deadlineUrgencyVariant(days)}>{days}d</Badge>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
