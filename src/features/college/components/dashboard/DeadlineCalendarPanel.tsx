import { Panel } from '@components/ui/Panel'
import { useCollege } from '../../hooks/useCollege'
import { daysUntil, formatShortDate, getAllDeadlines } from '../../utils'

export function DeadlineCalendarPanel() {
  const { colleges, isSeniorMode } = useCollege()
  const deadlines = getAllDeadlines(colleges).filter((d) => {
    const days = daysUntil(d.date)
    return days >= 0 && days <= 90
  })

  const byMonth = deadlines.reduce<Record<string, typeof deadlines>>((acc, d) => {
    const month = new Date(`${d.date}T12:00:00`).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    if (!acc[month]) acc[month] = []
    acc[month].push(d)
    return acc
  }, {})

  return (
    <Panel
      title={isSeniorMode ? 'Deadline Calendar' : 'Planning Dates'}
      subtitle={isSeniorMode ? 'Next 90 days' : 'Visits, tests, and milestones you add'}
    >
      {Object.keys(byMonth).length === 0 ? (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          {isSeniorMode
            ? 'No deadlines in the next 90 days.'
            : 'Add dates on a school profile as you plan visits, tests, or summer programs.'}
        </p>
      ) : (
        <div className="space-y-4">
          {Object.entries(byMonth).map(([month, items]) => (
            <div key={month}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-tertiary)]">
                {month}
              </p>
              <ul className="space-y-1.5">
                {items.map((d) => (
                  <li
                    key={`${d.collegeName}-${d.id}`}
                    className="flex justify-between gap-2 text-xs text-[var(--color-text-secondary)]"
                  >
                    <span className="truncate">
                      {formatShortDate(d.date)} · {d.label}
                    </span>
                    <span className="shrink-0 text-[var(--color-text-tertiary)]">{d.collegeName}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}
