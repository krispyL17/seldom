import { useEffect, useState } from 'react'
import { goalService } from '@services/database/goals'
import type { Goal } from '@features/goals/types'
import { goalDisplayProgress } from '@features/goals/utils'
import { cn } from '@lib/utils'

interface GoalLinkSelectProps {
  value: string | null
  onChange: (goalId: string | null) => void
  className?: string
}

export function GoalLinkSelect({ value, onChange, className }: GoalLinkSelectProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    goalService
      .fetchAll()
      .then((rows) => {
        if (!cancelled) setGoals(rows.filter((g) => g.status === 'active'))
      })
      .catch(() => {
        if (!cancelled) setGoals([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-xs font-medium text-[var(--color-text-secondary)]">
        Link to goal (optional)
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={loading}
        className={cn(
          'h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)]',
          'bg-[var(--color-surface-overlay)] px-3 text-sm text-[var(--color-text-primary)]',
          'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
        )}
      >
        <option value="">None</option>
        {goals.map((goal) => (
          <option key={goal.id} value={goal.id}>
            {goal.title} ({goalDisplayProgress(goal)}%)
          </option>
        ))}
      </select>
    </div>
  )
}
