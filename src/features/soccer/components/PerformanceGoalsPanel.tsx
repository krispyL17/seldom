import { Link } from 'react-router-dom'
import { Panel, PanelActionLink } from '@components/ui/Panel'
import { ProgressBar } from '@components/ui/ProgressBar'
import { useGoals } from '@features/goals/hooks/useGoals'
import { goalDisplayProgress, isPerformanceGoal, nextPendingMilestone } from '@features/goals/utils'
import { useUserPreferences } from '@features/preferences'
import { useNavTabColor } from '@hooks/useNavTabColor'

export function PerformanceGoalsPanel() {
  const { hobbyTabLabel, hobbyPassion } = useUserPreferences()
  const { goals, loading } = useGoals()
  const perfColor = useNavTabColor('soccer')

  const performanceGoals = goals
    .filter((g) => g.status === 'active' && isPerformanceGoal(g, hobbyTabLabel, hobbyPassion))
    .slice(0, 3)

  return (
    <Panel
      title={`${hobbyTabLabel} goals`}
      accentNavId="soccer"
      subtitle={loading ? 'Loading…' : `${performanceGoals.length} active`}
      action={<PanelActionLink to="/goals">All goals</PanelActionLink>}
    >
      {performanceGoals.length === 0 ? (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Tag goals with category <strong>{hobbyTabLabel}</strong> or Performance to track them here.
        </p>
      ) : (
        <ul className="space-y-3">
          {performanceGoals.map((goal) => {
            const milestone = nextPendingMilestone(goal)
            const progress = goalDisplayProgress(goal)
            return (
              <li key={goal.id} className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-2">
                <div className="flex items-center justify-between gap-2">
                  <Link to="/goals" className="truncate text-xs font-medium hover:underline">
                    {goal.title}
                  </Link>
                  <span className="text-xs tabular-nums text-[var(--color-text-tertiary)]">
                    {Math.round(progress)}%
                  </span>
                </div>
                <ProgressBar value={progress} showValue={false} size="sm" className="mt-1.5" />
                {milestone && (
                  <p
                    className="mt-1.5 truncate text-xs text-[var(--color-text-secondary)]"
                    style={{ borderLeft: `2px solid ${perfColor}`, paddingLeft: 6 }}
                  >
                    Next: {milestone.title}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
