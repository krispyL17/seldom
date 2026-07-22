import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Textarea } from '@components/ui/Textarea'
import type {
  CreateTrainingSessionInput,
  TechnicalRatingKey,
  TechnicalRatings,
  TrainingSession,
  TrainingMood,
} from '../types'
import {
  defaultTechnicalRatings,
  ENERGY_LABELS,
  POSITIONS,
  TECHNICAL_RATING_KEYS,
  TECHNICAL_RATING_LABELS,
  TRAINING_MOODS,
  TRAINING_MOOD_LABELS,
} from '../types'
import { todayIsoDate } from '../utils'
import { cn } from '@lib/utils'

interface TrainingSessionFormProps {
  session?: TrainingSession | null
  onSubmit: (input: CreateTrainingSessionInput) => Promise<void>
  onCancel: () => void
}

const selectClass =
  'w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]'

export function TrainingSessionForm({ session, onSubmit, onCancel }: TrainingSessionFormProps) {
  const isEdit = Boolean(session)

  const [sessionDate, setSessionDate] = useState(todayIsoDate())
  const [durationMin, setDurationMin] = useState(90)
  const [position, setPosition] = useState('CM')
  const [intensity, setIntensity] = useState(6)
  const [mood, setMood] = useState<TrainingMood>('good')
  const [energyLevel, setEnergyLevel] = useState(3)
  const [ratings, setRatings] = useState<TechnicalRatings>(defaultTechnicalRatings())
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!session) return
    setSessionDate(session.session_date)
    setDurationMin(session.duration_min)
    setPosition(session.position_played)
    setIntensity(session.intensity)
    setMood(session.mood)
    setEnergyLevel(session.energy_level)
    setRatings(session.technical_ratings)
    setNotes(session.notes ?? '')
  }, [session])

  function setRating(key: TechnicalRatingKey, value: number) {
    setRatings((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (durationMin <= 0) {
      setError('Duration must be greater than 0.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        session_date: sessionDate,
        duration_min: durationMin,
        position_played: position,
        intensity,
        mood,
        energy_level: energyLevel,
        technical_ratings: ratings,
        notes: notes.trim() || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save session')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Date"
          type="date"
          value={sessionDate}
          onChange={(e) => setSessionDate(e.target.value)}
          required
        />
        <Input
          label="Duration (minutes)"
          type="number"
          min={1}
          max={600}
          value={durationMin}
          onChange={(e) => setDurationMin(Number(e.target.value))}
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
          Position played
        </label>
        <select value={position} onChange={(e) => setPosition(e.target.value)} className={selectClass}>
          {POSITIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
          Intensity — {intensity}/10
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full accent-[var(--color-accent)]"
        />
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">Mood</legend>
        <div className="flex flex-wrap gap-2">
          {TRAINING_MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                mood === m
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'border border-[var(--color-border)] bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)]',
              )}
            >
              {TRAINING_MOOD_LABELS[m]}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
          Energy — {ENERGY_LABELS[energyLevel]}
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={energyLevel}
          onChange={(e) => setEnergyLevel(Number(e.target.value))}
          className="w-full accent-[var(--color-accent)]"
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-[var(--color-text-secondary)]">
          Technical ratings (1–10)
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {TECHNICAL_RATING_KEYS.map((key) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-[var(--color-text-secondary)]">{TECHNICAL_RATING_LABELS[key]}</span>
                <span className="tabular-nums text-[var(--color-text-tertiary)]">{ratings[key]}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={ratings[key]}
                onChange={(e) => setRating(key, Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>
          ))}
        </div>
      </div>

      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Session observations, focus areas, how you felt…"
        rows={3}
      />

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Log session'}
        </Button>
      </div>
    </form>
  )
}
