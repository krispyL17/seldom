import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Textarea } from '@components/ui/Textarea'
import { DateTimeField } from '@components/ui/DateTimeField'
import { ProgressBar } from '@components/ui/ProgressBar'
import type { CreateGoalInput, Goal, GoalStatus, Milestone } from '@features/goals/types'
import { GOAL_CATEGORIES, GOAL_STATUSES } from '@features/goals/types'
import { createMilestoneId } from '@features/goals/utils'
import { cn } from '@lib/utils'

interface GoalFormProps {
  goal?: Goal | null
  onSubmit: (input: CreateGoalInput) => Promise<void>
  onCancel: () => void
}

export function GoalForm({ goal, onSubmit, onCancel }: GoalFormProps) {
  const isEdit = Boolean(goal)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [progress, setProgress] = useState(0)
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<GoalStatus>('active')
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [newMilestone, setNewMilestone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!goal) return
    setTitle(goal.title)
    setDescription(goal.description ?? '')
    setTargetDate(goal.target_date ?? '')
    setProgress(goal.progress)
    setCategory(goal.category ?? '')
    setStatus(goal.status)
    setMilestones(goal.milestones)
  }, [goal])

  function addMilestone() {
    const trimmed = newMilestone.trim()
    if (!trimmed) return
    setMilestones((prev) => [
      ...prev,
      { id: createMilestoneId(), title: trimmed, completed: false, target_date: null },
    ])
    setNewMilestone('')
  }

  function removeMilestone(id: string) {
    setMilestones((prev) => prev.filter((m) => m.id !== id))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        target_date: targetDate || null,
        progress,
        milestones,
        category: category.trim() || undefined,
        status,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal')
    } finally {
      setSubmitting(false)
    }
  }

  const selectClass = cn(
    'h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)]',
    'bg-[var(--color-surface-overlay)] px-3 text-sm text-[var(--color-text-primary)]',
    'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What do you want to achieve?"
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Why this goal matters…"
        rows={3}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <DateTimeField
          label="Target date"
          dateValue={targetDate}
          timeValue=""
          onDateChange={setTargetDate}
          onTimeChange={() => {}}
          dateOnly
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[var(--color-text-secondary)]">
            Category
          </label>
          <input
            list="goal-categories"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Soccer"
            className={selectClass}
          />
          <datalist id="goal-categories">
            {GOAL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[var(--color-text-secondary)]">
            Progress — {progress}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-[var(--color-accent)]"
          />
          <ProgressBar value={progress} showValue={false} size="md" />
        </div>

        {isEdit && (
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[var(--color-text-secondary)]">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as GoalStatus)}
              className={selectClass}
            >
              {GOAL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Milestones */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-[var(--color-text-secondary)]">
          Milestones
        </label>

        {milestones.length > 0 && (
          <ul className="space-y-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] p-2">
            {milestones.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[var(--color-text-primary)]">{m.title}</span>
                <button
                  type="button"
                  onClick={() => removeMilestone(m.id)}
                  className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)]"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addMilestone()
              }
            }}
            placeholder="Add a milestone…"
            className={cn(selectClass, 'flex-1')}
          />
          <Button type="button" variant="secondary" onClick={addMilestone}>
            Add
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create goal'}
        </Button>
      </div>
    </form>
  )
}
