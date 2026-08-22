import { Panel } from '@components/ui/Panel'
import { PreviewBadge } from '../shared/PreviewBadge'
import { useCollege } from '../../hooks/useCollege'
import { scrollToAdvisor } from '../../utils'

const TYPE_ICONS: Record<string, string> = {
  school: '🏫',
  essay: '✍️',
  deadline: '📅',
  plan: '📋',
}

const LEGACY_TEMPLATE_IDS = new Set(['ai-1', 'ai-2', 'ai-3'])

export function AiRecommendationsPanel() {
  const { userData, isSeniorMode } = useCollege()
  const recommendations = (userData?.aiRecommendations ?? []).filter(
    (rec) => !LEGACY_TEMPLATE_IDS.has(rec.id),
  )

  return (
    <Panel
      title="Next steps"
      subtitle={isSeniorMode ? 'Application priorities' : 'Exploration & prep ideas'}
      action={<PreviewBadge />}
    >
      {recommendations.length === 0 ? (
        <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
          No saved next steps yet — ask the advisor below for personalized suggestions.
        </p>
      ) : (
        <ul className="space-y-3">
          {recommendations.map((rec) => (
            <li
              key={rec.id}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3"
            >
              <div className="flex items-start gap-2">
                <span className="text-sm" aria-hidden>
                  {TYPE_ICONS[rec.type] ?? '💡'}
                </span>
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-primary)]">{rec.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {rec.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={scrollToAdvisor}
        className="mt-3 w-full text-center text-xs text-[var(--color-accent-muted)] hover:underline"
      >
        Ask the advisor →
      </button>
    </Panel>
  )
}
