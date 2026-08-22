import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { ProgressBar } from '@components/ui/ProgressBar'
import { Panel, PanelDivider } from '@components/ui/Panel'
import { IconSparkles } from '@components/ui/icons'
import type { College } from '../../types'
import { essayStatusLabel } from '../../utils'

interface EssaysSectionProps {
  college: College
}

export function EssaysSection({ college }: EssaysSectionProps) {
  if (college.essays.length === 0) {
    return (
      <Panel fillHeight title="Essays" subtitle="No essays assigned yet">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Essay prompts will appear here once added for this school.
        </p>
      </Panel>
    )
  }

  return (
    <Panel fillHeight title="Essays" subtitle={`${college.essays.length} prompt(s)`}>
      <ul className="space-y-4">
        {college.essays.map((essay) => {
          const pct = essay.maxWords > 0 ? Math.round((essay.wordCount / essay.maxWords) * 100) : 0
          return (
            <li
              key={essay.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <Badge variant={essay.status === 'final' ? 'success' : 'accent'}>
                  {essayStatusLabel(essay.status)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  title="AI feedback coming soon"
                  className="gap-1 opacity-60"
                >
                  <IconSparkles width={14} height={14} />
                  AI Feedback
                </Button>
              </div>

              <p className="text-xs leading-relaxed text-[var(--color-text-primary)]">
                {essay.prompt}
              </p>

              <div className="mt-3">
                <ProgressBar
                  value={pct}
                  label={`${essay.wordCount} / ${essay.maxWords} words`}
                  variant={essay.status === 'final' ? 'success' : 'accent'}
                  size="sm"
                />
              </div>

              {essay.versions.length > 0 && (
                <>
                  <PanelDivider label="Version history" />
                  <ul className="space-y-1.5">
                    {essay.versions.map((version) => (
                      <li
                        key={version.id}
                        className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]"
                      >
                        <span>{version.label}</span>
                        <span className="tabular-nums text-[var(--color-text-tertiary)]">
                          {new Date(`${version.date}T12:00:00`).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
