import { Link, useParams } from 'react-router-dom'
import { PageSkeleton } from '@components/ui/PanelSkeleton'
import { ProgressBar } from '@components/ui/ProgressBar'
import { StatusBadge } from './shared/StatusBadge'
import { BasicInfoSection } from './profile/BasicInfoSection'
import { ApplicationStatusSection } from './profile/ApplicationStatusSection'
import { ChecklistSection } from './profile/ChecklistSection'
import { EssaysSection } from './profile/EssaysSection'
import { DeadlinesSection } from './profile/DeadlinesSection'
import { DocumentsSection } from './profile/DocumentsSection'
import { useCollege } from '../hooks/useCollege'
import {
  collegeProgress,
  formatCurrency,
  formatPercent,
  getCollegeById,
  progressVariant,
} from '../utils'

export function CollegeProfilePage() {
  const { collegeId } = useParams<{ collegeId: string }>()
  const { colleges, loading, error, reload, updateCollege, toggleChecklistItem, isSeniorMode } = useCollege()
  const college = collegeId ? getCollegeById(colleges, collegeId) : undefined

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <PageSkeleton panels={3} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
        <button
          type="button"
          onClick={() => void reload()}
          className="mt-4 text-sm text-[var(--color-accent-muted)] hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!college) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">College not found.</p>
        <Link
          to="/college"
          className="mt-4 inline-block text-sm text-[var(--color-accent-muted)] hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    )
  }

  const progress = collegeProgress(college)

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-panel)]">
        <Link
          to="/college"
          className="text-xs text-[var(--color-accent-muted)] transition-colors hover:text-[var(--color-accent-hover)] hover:underline"
        >
          ← Dashboard
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                {college.name}
              </h2>
              <StatusBadge status={college.status} />
            </div>
            <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
              {college.location}
              {college.acceptanceRate != null && ` · ${formatPercent(college.acceptanceRate)} acceptance`}
              {` · ${college.applicationType}`}
              {college.tuition != null && ` · ${formatCurrency(college.tuition)}/yr`}
            </p>
          </div>
          <div className="w-full max-w-xs shrink-0">
            <ProgressBar
              value={progress}
              label={isSeniorMode ? 'Application checklist' : 'Prep checklist'}
              variant={progressVariant(progress)}
              size="md"
            />
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <BasicInfoSection college={college} />
        <ApplicationStatusSection
          college={college}
          onStatusChange={(status) => updateCollege(college.id, { status })}
        />
        <ChecklistSection
          college={college}
          onToggle={(key) => toggleChecklistItem(college.id, key)}
        />
        <DeadlinesSection college={college} />
        <EssaysSection college={college} />
        <DocumentsSection college={college} />
      </div>
    </div>
  )
}
