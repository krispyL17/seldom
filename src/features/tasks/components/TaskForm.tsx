import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Textarea } from '@components/ui/Textarea'
import type { CreateTaskInput, Task, TaskPriority } from '@features/tasks/types'
import { TASK_CATEGORIES } from '@features/tasks/types'
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from '@features/tasks/utils'
import { cn } from '@lib/utils'

interface TaskFormProps {
  task?: Task | null
  onSubmit: (input: CreateTaskInput) => Promise<void>
  onCancel: () => void
}

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const isEdit = Boolean(task)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [category, setCategory] = useState('')
  const [deadline, setDeadline] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description ?? '')
    setPriority(task.priority)
    setCategory(task.category ?? '')
    setDeadline(toDatetimeLocalValue(task.deadline))
    setEstimatedDuration(task.estimated_duration?.toString() ?? '')
    setNotes(task.notes ?? '')
  }, [task])

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
        priority,
        category: category.trim() || undefined,
        deadline: fromDatetimeLocalValue(deadline),
        estimated_duration: estimatedDuration ? Number(estimatedDuration) : null,
        notes: notes.trim() || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional details…"
        rows={3}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[var(--color-text-secondary)]">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className={cn(
              'h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)]',
              'bg-[var(--color-surface-overlay)] px-3 text-sm text-[var(--color-text-primary)]',
              'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
            )}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[var(--color-text-secondary)]">
            Category
          </label>
          <input
            list="task-categories"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Training"
            className={cn(
              'h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)]',
              'bg-[var(--color-surface-overlay)] px-3 text-sm text-[var(--color-text-primary)]',
              'placeholder:text-[var(--color-text-tertiary)]',
              'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
            )}
          />
          <datalist id="task-categories">
            {TASK_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <Input
          label="Estimated duration (minutes)"
          type="number"
          min={0}
          value={estimatedDuration}
          onChange={(e) => setEstimatedDuration(e.target.value)}
          placeholder="e.g. 45"
        />
      </div>

      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Additional notes…"
        rows={3}
      />

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
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
        </Button>
      </div>
    </form>
  )
}
