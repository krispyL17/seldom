import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@components/ui/Button'
import { Panel } from '@components/ui/Panel'
import { StatusBadge } from '../shared/StatusBadge'
import { AddCollegeModal } from '../shared/AddCollegeModal'
import { useCollege } from '../../hooks/useCollege'
import { collegeProgress, progressVariant } from '../../utils'
import { ProgressBar } from '@components/ui/ProgressBar'

export function CollegesListPanel() {
  const { colleges, isSeniorMode, deleteCollege } = useCollege()
  const [addOpen, setAddOpen] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function handleRemove(id: string, name: string) {
    if (!confirm(`Remove ${name} from your list?`)) return
    setRemovingId(id)
    try {
      await deleteCollege(id)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <>
      <Panel
        title={isSeniorMode ? 'Application list' : 'Schools you are exploring'}
        subtitle={
          colleges.length === 0
            ? 'Your list starts empty — add schools yourself or pick suggestions during setup'
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
                ? 'Build your reach, target, and safety list. Each school gets typical admission deadlines on your timeline.'
                : 'Research at your own pace. Add schools manually — Seldom only suggests a starter list if you ask for one during setup.'}
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
                  <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/college/schools/${college.id}`}
                        className="min-w-0 flex-1 transition-colors hover:text-[var(--color-accent-muted)]"
                      >
                        <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                          {college.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                          {college.location || 'Location not set'}
                          {college.deadlines.length > 0 &&
                            ` · ${college.deadlines.length} timeline dates`}
                        </p>
                      </Link>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <StatusBadge status={college.status} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 min-h-10 px-3 text-xs text-[var(--color-danger)]"
                          disabled={removingId === college.id}
                          onClick={() => void handleRemove(college.id, college.name)}
                        >
                          {removingId === college.id ? 'Removing…' : 'Remove'}
                        </Button>
                      </div>
                    </div>
                    <Link to={`/college/schools/${college.id}`} className="mt-2 block">
                      <ProgressBar value={progress} variant={progressVariant(progress)} size="sm" />
                    </Link>
                  </div>
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
