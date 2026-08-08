import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@components/ui/Button'
import { PageSkeleton } from '@components/ui/PanelSkeleton'
import { ProgressBar } from '@components/ui/ProgressBar'
import { StatusBadge } from './shared/StatusBadge'
import { BasicInfoSection } from './profile/BasicInfoSection'
import { ApplicationStatusSection } from './profile/ApplicationStatusSection'
import { ChecklistSection } from './profile/ChecklistSection'
import { EssaysSection } from './profile/EssaysSection'
import { DeadlinesSection } from './profile/DeadlinesSection'
import { DocumentsSection } from './profile/DocumentsSection'
import { CollegePageShell } from './CollegePageShell'
import { useCollege } from '../hooks/useCollege'
import {
  collegeProgress,
  formatCurrency,
  formatPercent,
  getCollegeById,
  progressVariant,
} from '../utils'
import { cn } from '@lib/utils'

type ProfileTab = 'details' | 'checklist' | 'essays' | 'deadlines' | 'documents'

const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'essays', label: 'Essays' },
  { id: 'deadlines', label: 'Deadlines' },
  { id: 'documents', label: 'Documents' },
]

export function CollegeProfilePage() {
  const { collegeId } = useParams<{ collegeId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ProfileTab>('details')
  const { colleges, loading, error, reload, updateCollege, toggleChecklistItem, deleteCollege, isSeniorMode } =
    useCollege()
  const college = collegeId ? getCollegeById(colleges, collegeId) : undefined

  async function handleRemove() {
    if (!college) return
    if (!confirm(`Remove ${college.name} from your list? This cannot be undone.`)) return
    await deleteCollege(college.id)
    navigate('/college/schools')
  }

  if (loading) {
    return (
      <CollegePageShell>
        <PageSkeleton panels={2} />
      </CollegePageShell>
    )
  }

  if (error) {
    return (
      <CollegePageShell>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="mt-4 text-sm text-[var(--color-accent-muted)] hover:underline"
          >
            Try again
          </button>
        </div>
      </CollegePageShell>
    )
  }

  if (!college) {
    return (
      <CollegePageShell>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">College not found.</p>
          <Link
            to="/college/schools"
            className="mt-4 inline-block text-sm text-[var(--color-accent-muted)] hover:underline"
          >
            Back to schools
          </Link>
        </div>
      </CollegePageShell>
    )
  }

  const progress = collegeProgress(college)
  const tabClass = (active: boolean) =>
    cn(
      'rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[11px] font-medium transition-colors',
      active
        ? 'bg-[var(--color-accent)] text-white'
        : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-overlay)]',
    )

  return (
    <CollegePageShell>
      <header className="shrink-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 shadow-[var(--shadow-panel)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <Link
              to="/college/schools"
              className="text-[10px] text-[var(--color-accent-muted)] hover:underline"
            >
              ← Schools
            </Link>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h2 className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{college.name}</h2>
              <StatusBadge status={college.status} />
            </div>
            <p className="truncate text-[10px] text-[var(--color-text-secondary)]">
              {college.location}
              {college.acceptanceRate != null && ` · ${formatPercent(college.acceptanceRate)} acceptance`}
              {` · ${college.applicationType}`}
              {college.tuition != null && ` · ${formatCurrency(college.tuition)}/yr`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="w-36">
              <ProgressBar
                value={progress}
                label={isSeniorMode ? 'Checklist' : 'Prep'}
                variant={progressVariant(progress)}
                size="sm"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[var(--color-danger)]"
              onClick={() => void handleRemove()}
            >
              Remove
            </Button>
          </div>
        </div>
      </header>

      <div className="flex shrink-0 flex-wrap gap-1">
        {PROFILE_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={tabClass(tab === item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="profile-tab-content min-h-0 flex-1 overflow-hidden">
        {tab === 'details' && (
          <div className="profile-section-grid grid h-full min-h-0 grid-cols-1 gap-2 lg:grid-cols-2">
            <BasicInfoSection college={college} />
            <ApplicationStatusSection
              college={college}
              onStatusChange={(status) => updateCollege(college.id, { status })}
            />
          </div>
        )}
        {tab === 'checklist' && (
          <ChecklistSection college={college} onToggle={(key) => toggleChecklistItem(college.id, key)} />
        )}
        {tab === 'essays' && <EssaysSection college={college} />}
        {tab === 'deadlines' && <DeadlinesSection college={college} />}
        {tab === 'documents' && <DocumentsSection college={college} />}
      </div>
    </CollegePageShell>
  )
}
