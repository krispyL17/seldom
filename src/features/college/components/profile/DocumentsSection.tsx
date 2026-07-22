import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { Panel } from '@components/ui/Panel'
import { IconPlus } from '@components/ui/icons'
import type { College, DocumentType } from '../../types'

const TYPE_LABELS: Record<DocumentType, string> = {
  pdf: 'PDF',
  transcript: 'Transcript',
  resume: 'Resume',
  activity_list: 'Activity List',
  research_notes: 'Research Notes',
}

interface DocumentsSectionProps {
  college: College
}

export function DocumentsSection({ college }: DocumentsSectionProps) {
  return (
    <Panel
      title="Documents"
      subtitle="PDFs, transcripts, resumes, notes"
      action={
        <Button variant="ghost" size="sm" disabled className="gap-1 opacity-60">
          <IconPlus width={14} height={14} />
          Upload
        </Button>
      }
    >
      {college.documents.length > 0 ? (
        <ul className="space-y-2">
          {college.documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[var(--color-text-primary)]">
                  {doc.name}
                </p>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">
                  {doc.size} ·{' '}
                  {new Date(`${doc.uploadedAt}T12:00:00`).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <Badge variant="muted">{TYPE_LABELS[doc.type]}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          No documents uploaded yet. File storage coming soon.
        </p>
      )}
    </Panel>
  )
}
