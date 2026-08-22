import type { ProactiveInsight } from '@services/assistant/assistantClient'
import { Badge } from '@components/ui/Badge'
import { Panel } from '@components/ui/Panel'
import { cn } from '@lib/utils'

interface ProactiveInsightsPanelProps {
  insights: ProactiveInsight[]
  onAct: (prompt: string) => void
  className?: string
}

const priorityVariant = {
  high: 'danger' as const,
  medium: 'warning' as const,
  low: 'muted' as const,
}

export function ProactiveInsightsPanel({ insights, onAct, className }: ProactiveInsightsPanelProps) {
  return (
    <Panel
      title="Proactive insights"
      subtitle="Patterns from your data"
      className={className}
    >
      {insights.length === 0 ? (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          No patterns flagged yet. Log tasks, goals, journal, and training to unlock suggestions.
        </p>
      ) : (
        <ul className="space-y-2">
          {insights.slice(0, 5).map((insight) => (
            <li
              key={insight.id}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-[var(--color-text-primary)]">{insight.title}</p>
                <Badge variant={priorityVariant[insight.priority]}>{insight.priority}</Badge>
              </div>
              <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {insight.description}
              </p>
              <button
                type="button"
                onClick={() => onAct(`Help me with this: ${insight.title} — ${insight.description}`)}
                className={cn(
                  'mt-2 text-xs font-medium text-[var(--color-accent-muted)] hover:underline',
                )}
              >
                Address this →
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
