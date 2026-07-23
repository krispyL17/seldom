import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@components/ui/Button'
import { Panel } from '@components/ui/Panel'
import { StatusBadge } from '../shared/StatusBadge'
import { AddCollegeModal } from '../shared/AddCollegeModal'
import { useCollege } from '../../hooks/useCollege'
import { collegeProgress, formatPercent, progressVariant } from '../../utils'
import { ProgressBar } from '@components/ui/ProgressBar'

export function CollegesListPanel() {
  const { colleges, isSeniorMode } = useCollege()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <>
      <Panel
        title={isSeniorMode ? 'Application list' : 'Schools you are exploring'}
        subtitle={
          colleges.length === 0
            ? 'Your list starts empty — add any school you are curious about'
            : `${colleges.length} on your list`
        }
        action={
          <Button type="button" variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
            + Add school
          </Button>
        }
      >
        {colleges.length === 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {isSeniorMode
                ? 'Build your reach, target, and safety list — no preset schools.'
                : 'Research schools at your own pace. Add names as you discover programs, campuses, and fit.'}
            </p>
            <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
              Add your first school
            </Button>
          </div>
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
                          {college.location || 'Location not set'}
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

      <AddCollegeModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  )
}
