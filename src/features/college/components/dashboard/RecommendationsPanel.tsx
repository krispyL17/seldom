import { Panel } from '@components/ui/Panel'
import { Badge } from '@components/ui/Badge'
import { useCollege } from '../../hooks/useCollege'
import { formatShortDate } from '../../utils'

const STATUS_LABELS = {
  not_requested: 'Not requested',
  requested: 'Requested',
  submitted: 'Submitted',
} as const

export function RecommendationsPanel() {
  const { userData, colleges, isSeniorMode } = useCollege()
  const recommendations = userData?.recommendations ?? []
  const submitted = recommendations.filter((r) => r.status === 'submitted').length
  const building = recommendations.filter((r) => r.status !== 'not_requested').length

  return (
    <Panel
      title={isSeniorMode ? 'Recommendation Letters' : 'Mentor Relationships'}
      subtitle={
        isSeniorMode
          ? `${submitted} of ${recommendations.length} submitted`
          : `${building} relationships started`
      }
    >
      {recommendations.length === 0 ? (
        <p className="text-xs text-[var(--color-text-tertiary)]">No recommenders tracked.</p>
      ) : (
        <ul className="space-y-2">
          {recommendations.map((rec) => {
            const collegeNames = rec.collegeIds
              .map((id) => colleges.find((c) => c.id === id)?.name)
              .filter(Boolean)
            return (
              <li
                key={rec.id}
                className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-[var(--color-text-primary)]">
                    {rec.recommender}
                  </p>
                  <Badge
                    variant={
                      rec.status === 'submitted'
                        ? 'success'
                        : rec.status === 'requested'
                          ? 'warning'
                          : 'muted'
                    }
                  >
                    {isSeniorMode
                      ? STATUS_LABELS[rec.status]
                      : rec.status === 'not_requested'
                        ? 'Building'
                        : 'Connected'}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs capitalize text-[var(--color-text-tertiary)]">
                  {rec.role}
                  {rec.dueDate && isSeniorMode && ` · due ${formatShortDate(rec.dueDate)}`}
                </p>
                {isSeniorMode && collegeNames.length > 0 && (
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {collegeNames.join(', ')}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
