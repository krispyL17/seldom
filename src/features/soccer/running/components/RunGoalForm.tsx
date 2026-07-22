import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Textarea } from '@components/ui/Textarea'
import type { CreateRunGoalInput, RunGoal } from '../types'
import { DISTANCE_PRESETS } from '../types'
import {
  durationInputFromSeconds,
  parseDurationInput,
} from '../utils'
import { cn } from '@lib/utils'

interface RunGoalFormProps {
  goal?: RunGoal | null
  onSubmit: (input: CreateRunGoalInput) => Promise<void>
  onCancel: () => void
}

export function RunGoalForm({ goal, onSubmit, onCancel }: RunGoalFormProps) {
  const isEdit = Boolean(goal)

  const [presetId, setPresetId] = useState('1mi')
  const [customDistanceMi, setCustomDistanceMi] = useState('')
  const [targetTime, setTargetTime] = useState('7:00')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!goal) return
    setTargetTime(durationInputFromSeconds(goal.target_duration_sec))
    setDeadline(goal.deadline ?? '')
    setNotes(goal.notes ?? '')

    const preset = DISTANCE_PRESETS.find((p) => Math.abs(p.meters - goal.distance_m) < 1)
    if (preset) {
      setPresetId(preset.id)
      setCustomDistanceMi('')
    } else {
      setPresetId('custom')
      setCustomDistanceMi(String(Math.round((goal.distance_m / 1609.34) * 100) / 100))
    }
  }, [goal])

  function resolveDistance(): { meters: number; label: string } | null {
    if (presetId === 'custom') {
      const mi = Number(customDistanceMi)
      if (Number.isNaN(mi) || mi <= 0) return null
      return { meters: Math.round(mi * 1609.34 * 100) / 100, label: `${mi} mi` }
    }
    const preset = DISTANCE_PRESETS.find((p) => p.id === presetId)
    return preset ? { meters: preset.meters, label: preset.label } : null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const distance = resolveDistance()
    const targetSec = parseDurationInput(targetTime)
    if (!distance || targetSec === null) {
      setError('Enter a valid distance and target time (m:ss).')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        distance_m: distance.meters,
        distance_label: distance.label,
        target_duration_sec: targetSec,
        deadline: deadline || undefined,
        notes: notes.trim() || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
          Distance
        </label>
        <div className="flex flex-wrap gap-2">
          {DISTANCE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPresetId(p.id)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                presetId === p.id
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'border border-[var(--color-border)] bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)]',
              )}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPresetId('custom')}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              presetId === 'custom'
                ? 'bg-[var(--color-accent)] text-white'
                : 'border border-[var(--color-border)] bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)]',
            )}
          >
            Custom
          </button>
        </div>
        {presetId === 'custom' && (
          <Input
            className="mt-3"
            label="Custom distance (miles)"
            type="number"
            min={0.1}
            step={0.1}
            value={customDistanceMi}
            onChange={(e) => setCustomDistanceMi(e.target.value)}
          />
        )}
      </div>

      <Input
        label="Target time (m:ss)"
        value={targetTime}
        onChange={(e) => setTargetTime(e.target.value)}
        placeholder="6:30"
        required
      />

      <Input
        label="Deadline (optional)"
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />

      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save goal' : 'Set goal'}
        </Button>
      </div>
    </form>
  )
}
