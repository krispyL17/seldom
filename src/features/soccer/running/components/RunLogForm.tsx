import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Textarea } from '@components/ui/Textarea'
import { useDistanceUnit } from '@hooks/useDistanceUnit'
import type { CreateRunLogInput, RunLog } from '../types'
import {
  durationInputFromSeconds,
  parseDurationInput,
  todayIsoDate,
} from '../utils'
import { cn } from '@lib/utils'

interface RunLogFormProps {
  run?: RunLog | null
  onSubmit: (input: CreateRunLogInput) => Promise<void>
  onCancel: () => void
}

export function RunLogForm({ run, onSubmit, onCancel }: RunLogFormProps) {
  const isEdit = Boolean(run)
  const { unit, shortLabel, presets, metersFromInput, inputFromMeters } = useDistanceUnit()

  const [runDate, setRunDate] = useState(todayIsoDate())
  const [presetId, setPresetId] = useState('1mi')
  const [customDistance, setCustomDistance] = useState('')
  const [durationInput, setDurationInput] = useState('8:00')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const defaultPresetId = useMemo(() => (unit === 'km' ? '5k' : '1mi'), [unit])

  useEffect(() => {
    if (run) return
    setPresetId(defaultPresetId)
    setCustomDistance('')
  }, [defaultPresetId, run])

  useEffect(() => {
    if (!run) return
    setRunDate(run.run_date)
    setDurationInput(durationInputFromSeconds(run.duration_sec))
    setNotes(run.notes ?? '')

    const preset = presets.find((p) => Math.abs(p.meters - run.distance_m) < 1)
    if (preset) {
      setPresetId(preset.id)
      setCustomDistance('')
    } else {
      setPresetId('custom')
      setCustomDistance(String(inputFromMeters(run.distance_m)))
    }
  }, [run, presets, inputFromMeters])

  function resolveDistance(): { meters: number; label: string } | null {
    if (presetId === 'custom') {
      const value = Number(customDistance)
      if (Number.isNaN(value) || value <= 0) return null
      const meters = metersFromInput(value)
      return { meters, label: `${value} ${shortLabel}` }
    }
    const preset = presets.find((p) => p.id === presetId)
    if (!preset) return null
    return { meters: preset.meters, label: preset.label }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const distance = resolveDistance()
    const durationSec = parseDurationInput(durationInput)

    if (!distance) {
      setError('Enter a valid distance.')
      return
    }
    if (durationSec === null) {
      setError('Enter time as m:ss (e.g. 7:30) or minutes.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        run_date: runDate,
        distance_m: distance.meters,
        distance_label: distance.label,
        duration_sec: durationSec,
        notes: notes.trim() || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save run')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Date"
        type="date"
        value={runDate}
        onChange={(e) => setRunDate(e.target.value)}
        required
      />

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
            placeholder={unit === 'km' ? 'e.g. 5' : 'e.g. 3.2'}
          />
        )}
      </div>

      <Input
        label="Time (m:ss or minutes)"
        value={durationInput}
        onChange={(e) => setDurationInput(e.target.value)}
        placeholder="7:30"
        required
      />

      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="How it felt, conditions, splits…"
        rows={2}
      />

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Log run'}
        </Button>
      </div>
    </form>
  )
}
