import { Link } from 'react-router-dom'
import { EmptyState } from '@components/ui/EmptyState'
import { Panel, PanelActionLink } from '@components/ui/Panel'
import { useTasks } from '@features/tasks/hooks/useTasks'
import { useGoals } from '@features/goals/hooks/useGoals'

export function DailyBriefingPanel() {
  const { tasks } = useTasks()
  const { goals } = useGoals()

  const hasAnyData = tasks.length > 0 || goals.length > 0

  return (
    <Panel
      title="Daily Briefing"
      subtitle="Ask Seldom AI"
      action={<PanelActionLink to="/assistant">Open Seldom AI</PanelActionLink>}
      fullWidth
    >
      {hasAnyData ? (
        <EmptyState
          title="No briefing yet"
          description="Ask Seldom AI for a daily briefing based on your tasks, goals, and logs — nothing is generated until you request it."
          action={
            <Link
              to="/assistant?mode=daily_plan"
              className="inline-flex h-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-3 text-xs font-medium text-white hover:bg-[var(--color-accent-hover)]"
            >
              Generate briefing
            </Link>
          }
        />
      ) : (
        <EmptyState
          title="Your briefing starts here"
          description="Add tasks or goals, then ask Seldom AI for a personalized daily overview."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                to="/tasks?new=1"
                className="inline-flex h-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-overlay)]"
              >
                Add a task
              </Link>
              <Link
                to="/assistant"
                className="inline-flex h-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-3 text-xs font-medium text-white hover:bg-[var(--color-accent-hover)]"
              >
                Ask Seldom AI
              </Link>
            </div>
          }
        />
      )}
    </Panel>
  )
}
