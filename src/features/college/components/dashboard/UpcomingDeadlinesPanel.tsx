import { Panel } from '@components/ui/Panel'
import { Badge } from '@components/ui/Badge'
import { EmptyState } from '@components/ui/EmptyState'
import { useCollege } from '../../hooks/useCollege'
import { daysUntil, deadlineUrgencyVariant, formatShortDate, getUnifiedPlanningDeadlines } from '../../utils'

export function UpcomingDeadlinesPanel() {
  const { colleges, userData, isSeniorMode } = useCollege()
  const deadlines = getUnifiedPlanningDeadlines(
    colleges,
    userData?.financialAid ?? [],
    userData?.scholarships ?? [],
    6,
  )

  return (
    <Panel
      fillHeight
      title="Upcoming Deadlines"
      subtitle={
        isSeniorMode
          ? 'Apps, aid, scholarships & tests'
          : 'Tests, aid steps, programs & prep dates'
      }
    >
      {deadlines.length === 0 ? (
        <EmptyState
          title="No upcoming deadlines"
          description={
            isSeniorMode
              ? 'Add deadlines on school profiles or load the financial planning checklist.'
              : 'Load financial planning steps or add test dates and program deadlines.'
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
                  <p className="truncate text-xs font-medium text-[var(--color-text-primary)]">
                    {d.label}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">{d.subtitle}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs tabular-nums text-[var(--color-text-secondary)]">
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
