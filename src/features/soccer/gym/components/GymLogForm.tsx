import { useState } from 'react'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { ModalFooter } from '@components/ui/Modal'
import { saveError } from '@lib/userFacingError'
import type { CreateGymLogInput } from '../hooks/useGymLogs'

interface GymLogFormProps {
  onSubmit: (input: CreateGymLogInput) => Promise<void>
  onCancel: () => void
}

export function GymLogForm({ onSubmit, onCancel }: GymLogFormProps) {
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10))
  const [duration, setDuration] = useState('45')
  const [workoutType, setWorkoutType] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const durationMin = Number(duration)
    if (!Number.isFinite(durationMin) || durationMin <= 0) {
      setError('Enter a valid duration in minutes.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        session_date: sessionDate,
        duration_min: durationMin,
        workout_type: workoutType.trim() || undefined,
        notes: notes.trim() || undefined,
      })
    } catch (err) {
      setError(saveError('this workout', err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
      <Input
        label="Date"
        type="date"
        value={sessionDate}
        onChange={(e) => setSessionDate(e.target.value)}
      />
      <Input
        label="Duration (minutes)"
        type="number"
        min={1}
        max={600}
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <Input
        label="Workout type"
        type="text"
        placeholder="Upper body, legs, full body…"
        value={workoutType}
        onChange={(e) => setWorkoutType(e.target.value)}
      />
      <Input
        label="Notes"
        type="text"
        placeholder="Optional"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      {error && (
        <p className="text-xs text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}
      <ModalFooter className="mt-2">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Saving…' : 'Save workout'}
        </Button>
      </ModalFooter>
    </form>
  )
}
