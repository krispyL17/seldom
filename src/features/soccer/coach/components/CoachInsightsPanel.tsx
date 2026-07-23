import { Button } from '@components/ui/Button'
import { MarkdownContent } from '@features/assistant/components/MarkdownContent'
import { Panel } from '@components/ui/Panel'
import type { CoachInsight } from '../types'

interface CoachInsightsPanelProps {
  insights: CoachInsight[]
  isGenerating: boolean
  onGenerate: () => void
}

export function CoachInsightsPanel({ insights, isGenerating, onGenerate }: CoachInsightsPanelProps) {
  return (
    <Panel title="Coach Recommendations" subtitle="Training · technical · tactical · development">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[10px] text-[var(--color-text-tertiary)]">
          Generated from your sessions, matches, goals, and coaching research.
        </p>
        <Button size="sm" variant="secondary" onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? 'Generating…' : 'Generate'}
        </Button>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.mode}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">{insight.title}</h3>
              {insight.updatedAt && (
                <span className="text-[10px] text-[var(--color-text-tertiary)]">
                  {new Date(insight.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {insight.loading && (
              <p className="text-xs text-[var(--color-text-tertiary)]">Analyzing your profile…</p>
            )}

            {insight.error && (
              <p className="text-xs text-[var(--color-danger)]">{insight.error}</p>
            )}

            {!insight.loading && !insight.error && insight.content && (
              <MarkdownContent
                content={insight.content}
                className="prose-xs max-w-none text-[var(--color-text-secondary)] [&_*]:text-xs"
              />
            )}

            {!insight.loading && !insight.error && !insight.content && (
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Click Generate to build your {insight.title.toLowerCase()}.
              </p>
            )}
          </div>
        ))}
      </div>
    </Panel>
  )
}
