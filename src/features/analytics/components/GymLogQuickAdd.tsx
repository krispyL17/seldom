import { useState } from 'react'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { saveError } from '@lib/userFacingError'
import { addLocalGymLog } from '@services/analytics/gymLogsLocal'

interface GymLogQuickAddProps {
  userId: string
  disabled?: boolean
  onLogged: () => void
}

export function GymLogQuickAdd({ userId, disabled, onLogged }: GymLogQuickAddProps) {
  const [open, setOpen] = useState(false)
  const [duration, setDuration] = useState('45')
  const [workoutType, setWorkoutType] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const durationMin = Number(duration)
    if (!Number.isFinite(durationMin) || durationMin <= 0) {
      setError('Enter a valid duration in minutes.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      addLocalGymLog(userId, {
        session_date: today,
        duration_min: durationMin,
        workout_type: workoutType.trim() || undefined,
      })
      setDuration('45')
      setWorkoutType('')
      setOpen(false)
      onLogged()
    } catch (err) {
      setError(saveError('this gym log', err))
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        Log session
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-2"
    >
      <Input
        label="Minutes"
        type="number"
        min={1}
        max={600}
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="w-20"
      />
      <Input
        label="Workout"
        type="text"
        placeholder="Upper body"
        value={workoutType}
        onChange={(e) => setWorkoutType(e.target.value)}
        className="min-w-[120px] flex-1"
      />
      <div className="flex gap-1">
        <Button type="submit" size="sm" disabled={saving || disabled}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      {error && <p className="w-full text-xs text-[var(--color-danger)]">{error}</p>}
    </form>
  )
}
