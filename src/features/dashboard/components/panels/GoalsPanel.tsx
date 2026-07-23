import { Link } from 'react-router-dom'
import { Badge } from '@components/ui/Badge'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorPanel } from '@components/ui/ErrorPanel'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { ProgressBar } from '@components/ui/ProgressBar'
import { Panel, PanelActionLink, PanelDivider } from '@components/ui/Panel'
import { useGoals } from '@features/goals/hooks/useGoals'
import type { Goal } from '@features/goals/types'

function nextMilestone(goal: Goal) {
  const pending = goal.milestones.find((m) => !m.completed)
  return pending?.title ?? 'No milestones yet'
}

function formatEta(targetDate: string | null) {
  if (!targetDate) return '—'
  return new Date(`${targetDate}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export function GoalsPanel() {
  const { goals, loading, error, reload } = useGoals()
  const active = goals.filter((g) => g.status === 'active').slice(0, 3)

  if (error) {
    return <ErrorPanel message={error} onRetry={() => void reload()} title="Goals" />
  }

  return (
    <Panel
      title="Long-Term Goals"
      subtitle={loading ? 'Loading…' : `${active.length} active objective${active.length === 1 ? '' : 's'}`}
      action={<PanelActionLink to="/goals">Manage</PanelActionLink>}
    >
      {loading ? (
        <PanelSkeleton lines={4} />
      ) : active.length === 0 ? (
        <EmptyState
          title="No active goals"
          description="Set goals to track long-term progress."
          action={
            <Link
              to="/goals"
              className="text-xs font-medium text-[var(--color-accent-muted)] hover:underline"
            >
              Go to Goals
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {active.map((goal) => (
            <div
              key={goal.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-[var(--color-text-primary)]">{goal.title}</p>
                <Badge variant="muted">ETA {formatEta(goal.target_date)}</Badge>
              </div>
              <ProgressBar
                value={goal.progress}
                variant={goal.progress >= 70 ? 'success' : 'accent'}
                size="md"
              />
              <PanelDivider />
              <p className="text-[10px] text-[var(--color-text-tertiary)]">
                Next milestone:{' '}
                <span className="text-[var(--color-text-secondary)]">{nextMilestone(goal)}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}
