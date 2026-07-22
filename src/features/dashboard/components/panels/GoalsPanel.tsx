import { Badge } from '@components/ui/Badge'
import { ProgressBar } from '@components/ui/ProgressBar'
import { Panel, PanelActionLink, PanelDivider } from '@components/ui/Panel'
import { goalsData } from '../../data/mockData'

export function GoalsPanel() {
  return (
    <Panel
      title="Long-Term Goals"
      subtitle={`${goalsData.length} active objectives`}
      action={<PanelActionLink>Manage</PanelActionLink>}
    >
      <div className="space-y-4">
        {goalsData.map((goal) => (
          <div
            key={goal.id}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-[var(--color-text-primary)]">{goal.title}</p>
              <Badge variant="muted">ETA {goal.eta}</Badge>
            </div>

            <ProgressBar
              value={goal.progress}
              variant={goal.progress >= 70 ? 'success' : 'accent'}
              size="md"
            />

            <PanelDivider />
            <p className="text-[10px] text-[var(--color-text-tertiary)]">
              Next milestone:{' '}
              <span className="text-[var(--color-text-secondary)]">{goal.milestone}</span>
            </p>
            <p className="mt-2 rounded-[var(--radius-sm)] bg-[var(--color-accent)]/5 px-2 py-1.5 text-[10px] leading-relaxed text-[var(--color-accent-muted)]">
              Tip: {goal.suggestion}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  )
}
