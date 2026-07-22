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

export function AiRecommendationsPanel() {
  const { userData } = useCollege()
  const recommendations = userData?.aiRecommendations ?? []

  return (
    <Panel
      title="AI Recommendations"
      subtitle="Personalized next steps"
      action={<PreviewBadge />}
    >
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
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
                  {rec.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={scrollToAdvisor}
        className="mt-3 w-full text-center text-[11px] text-[var(--color-accent-muted)] hover:underline"
      >
        Ask the advisor →
      </button>
    </Panel>
  )
}
