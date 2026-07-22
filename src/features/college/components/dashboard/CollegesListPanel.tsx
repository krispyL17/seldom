import { Link } from 'react-router-dom'
import { Panel } from '@components/ui/Panel'
import { StatusBadge } from '../shared/StatusBadge'
import { useCollege } from '../../hooks/useCollege'
import { collegeProgress, formatPercent, progressVariant } from '../../utils'
import { ProgressBar } from '@components/ui/ProgressBar'

export function CollegesListPanel() {
  const { colleges } = useCollege()

  return (
    <Panel title="Colleges" subtitle={`${colleges.length} on your list`}>
      {colleges.length === 0 ? (
        <p className="text-xs text-[var(--color-text-tertiary)]">No colleges yet. Add one from a profile.</p>
      ) : (
        <ul className="space-y-2">
          {colleges.map((college) => {
            const progress = collegeProgress(college)
            return (
              <li key={college.id}>
                <Link
                  to={`/college/schools/${college.id}`}
                  className="block rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3 transition-colors hover:border-[var(--color-accent)]/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                        {college.name}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-tertiary)]">
                        {college.location}
                        {college.acceptanceRate != null && ` · ${formatPercent(college.acceptanceRate)} acceptance`}
                      </p>
                    </div>
                    <StatusBadge status={college.status} />
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={progress} variant={progressVariant(progress)} size="sm" />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
