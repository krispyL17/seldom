import { Link } from 'react-router-dom'
import { Badge } from '@components/ui/Badge'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorPanel } from '@components/ui/ErrorPanel'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { ProgressBar } from '@components/ui/ProgressBar'
import { Panel, PanelActionLink } from '@components/ui/Panel'
import { useGoals } from '@features/goals/hooks/useGoals'
import type { Goal } from '@features/goals/types'
import { goalDisplayProgress } from '@features/goals/utils'

const MORE_LINK =
  'text-xs font-medium text-[var(--color-accent-muted)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'

function nextMilestone(goal: Goal) {
  const pending = goal.milestones.find((m) => !m.completed)
  return pending?.title ?? 'No milestones yet'
}

function formatEta(targetDate: string | null) {
  if (!targetDate) return 'No date'
  return new Date(`${targetDate}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export function GoalsPanel() {
  const { goals, loading, error, reload } = useGoals()
  const activeAll = goals.filter((g) => g.status === 'active')
  const active = activeAll.slice(0, 2)

  if (error) {
    return (
      <ErrorPanel message={error} onRetry={() => void reload()} title="Couldn't load goals" />
    )
  }

  return (
    <Panel
      scrollCap
      fillHeight
      title="Goals"
      accentNavId="goals"
      subtitle={
        loading
          ? 'Loading…'
          : activeAll.length === 0
            ? 'None active'
            : `${activeAll.length} active`
      }
      action={<PanelActionLink to="/goals">Manage</PanelActionLink>}
    >
      {loading ? (
        <PanelSkeleton lines={3} />
      ) : active.length === 0 ? (
        <EmptyState
          compact
          title="No active goals"
          description="Set a target with milestones to track."
          action={
            <Link to="/goals?new=1" className={MORE_LINK}>
              Add goal
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {active.map((goal) => {
            const displayProgress = goalDisplayProgress(goal)
            return (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-xs font-medium text-[var(--color-text-primary)]">
                    {goal.title}
                  </p>
                  <Badge variant="muted" className="shrink-0 tabular-nums">
                    {Math.round(displayProgress)}%
                  </Badge>
                </div>
                <ProgressBar
                  value={displayProgress}
                  variant={displayProgress >= 70 ? 'success' : 'accent'}
                  size="sm"
                />
                <p className="truncate text-xs text-[var(--color-text-tertiary)]">
                  Next:{' '}
                  <span className="text-[var(--color-text-secondary)]">{nextMilestone(goal)}</span>
                  <span className="text-[var(--color-text-tertiary)]"> · {formatEta(goal.target_date)}</span>
                </p>
              </div>
            )
          })}
          {activeAll.length > 2 && (
            <Link to="/goals" className={`inline-block ${MORE_LINK}`}>
              +{activeAll.length - 2} more
            </Link>
          )}
        </div>
      )}
    </Panel>
  )
}
