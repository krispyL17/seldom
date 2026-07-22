import { Panel } from '@components/ui/Panel'
import { Badge } from '@components/ui/Badge'
import { useCollege } from '../../hooks/useCollege'
import { formatCurrency, formatShortDate, scholarshipStatusLabel } from '../../utils'

export function ScholarshipTrackerPanel() {
  const { userData, colleges, isSeniorMode } = useCollege()
  const scholarships = userData?.scholarships ?? []

  return (
    <Panel
      title={isSeniorMode ? 'Scholarships' : 'Summer Programs'}
      subtitle={`${scholarships.length} tracked`}
    >
      {scholarships.length === 0 ? (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          {isSeniorMode ? 'No scholarships yet.' : 'No summer programs yet.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] text-[var(--color-text-tertiary)]">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Deadline</th>
                <th className="pb-2 font-medium">{isSeniorMode ? 'Amount' : 'Cost'}</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {scholarships.map((s) => {
                const college = s.collegeId
                  ? colleges.find((c) => c.id === s.collegeId)
                  : undefined
                return (
                  <tr key={s.id} className="border-t border-[var(--color-border)]">
                    <td className="py-2 pr-2 text-[var(--color-text-primary)]">
                      {s.name}
                      {college && (
                        <span className="block text-[10px] text-[var(--color-text-tertiary)]">
                          {college.name}
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-2 tabular-nums text-[var(--color-text-secondary)]">
                      {formatShortDate(s.deadline)}
                    </td>
                    <td className="py-2 pr-2 text-[var(--color-text-secondary)]">
                      {s.amount > 0 ? formatCurrency(s.amount) : '—'}
                    </td>
                    <td className="py-2">
                      <Badge variant="default">{scholarshipStatusLabel(s.status)}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}
