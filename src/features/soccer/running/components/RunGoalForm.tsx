import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Textarea } from '@components/ui/Textarea'
import { DateTimeField } from '@components/ui/DateTimeField'
import { useDistanceUnit } from '@hooks/useDistanceUnit'
import type { CreateRunGoalInput, RunGoal } from '../types'
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
  const { unit, shortLabel, presets, metersFromInput, inputFromMeters } = useDistanceUnit()

  const [presetId, setPresetId] = useState('1mi')
  const [customDistance, setCustomDistance] = useState('')
  const [targetTime, setTargetTime] = useState('7:00')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const defaultPresetId = useMemo(() => (unit === 'km' ? '5k' : '1mi'), [unit])

  useEffect(() => {
    if (goal) return
    setPresetId(defaultPresetId)
    setCustomDistance('')
  }, [defaultPresetId, goal])

  useEffect(() => {
    if (!goal) return
    setTargetTime(durationInputFromSeconds(goal.target_duration_sec))
    setDeadline(goal.deadline ?? '')
    setNotes(goal.notes ?? '')

    const preset = presets.find((p) => Math.abs(p.meters - goal.distance_m) < 1)
    if (preset) {
      setPresetId(preset.id)
      setCustomDistance('')
    } else {
      setPresetId('custom')
      setCustomDistance(String(inputFromMeters(goal.distance_m)))
    }
  }, [goal, presets, inputFromMeters])

  function resolveDistance(): { meters: number; label: string } | null {
    if (presetId === 'custom') {
      const value = Number(customDistance)
      if (Number.isNaN(value) || value <= 0) return null
      const meters = metersFromInput(value)
      return { meters, label: `${value} ${shortLabel}` }
    }
    const preset = presets.find((p) => p.id === presetId)
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
          {presets.map((p) => (
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
            label={`Custom distance (${shortLabel})`}
            type="number"
            min={0.1}
            step={0.1}
            value={customDistance}
            onChange={(e) => setCustomDistance(e.target.value)}
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

      <DateTimeField
        label="Deadline (optional)"
        dateValue={deadline}
        timeValue=""
        onDateChange={setDeadline}
        onTimeChange={() => {}}
        dateOnly
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
