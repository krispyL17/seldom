import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Textarea } from '@components/ui/Textarea'
import { GoalLinkSelect } from '@components/goals/GoalLinkSelect'
import { useUserPreferences } from '@features/preferences'
import { sportUsesSideTracking } from '../../athlete/sideTracking'
import { SideBalanceFields } from '../../athlete/components/AthleteSideProfileCard'
import { SessionTabSelect } from './SessionTabSelect'
import { decodeSessionTabCategory } from '../../utils/sessionTabCategory'
import type { CreateTrainingSessionInput, TrainingMood, TrainingSession } from '../types'
import { defaultSideBalance, ENERGY_LABELS, TRAINING_MOODS, TRAINING_MOOD_LABELS } from '../types'
import { todayIsoDate } from '../utils'
import { cn } from '@lib/utils'

interface TrainingSessionFormProps {
  session?: TrainingSession | null
  onSubmit: (input: CreateTrainingSessionInput) => Promise<void>
  onCancel: () => void
}

export function TrainingSessionForm({ session, onSubmit, onCancel }: TrainingSessionFormProps) {
  const isEdit = Boolean(session)
  const { hobbyPassion } = useUserPreferences()
  const trackSides = sportUsesSideTracking(hobbyPassion)

  const [sessionDate, setSessionDate] = useState(todayIsoDate())
  const [durationMin, setDurationMin] = useState(60)
  const [tabCategory, setTabCategory] = useState<string | null>(null)
  const [highPoints, setHighPoints] = useState('')
  const [workOn, setWorkOn] = useState('')
  const [intensity, setIntensity] = useState(6)
  const [mood, setMood] = useState<TrainingMood>('good')
  const [energyLevel, setEnergyLevel] = useState(3)
  const [notes, setNotes] = useState('')
  const [goalId, setGoalId] = useState<string | null>(null)
  const [dominantPct, setDominantPct] = useState(50)
  const [weakPct, setWeakPct] = useState(50)
  const [trackSideBalance, setTrackSideBalance] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!session) return
    setSessionDate(session.session_date)
    setDurationMin(session.duration_min)
    setTabCategory(decodeSessionTabCategory(session.position_played).tabKey)
    setHighPoints(session.high_points ?? '')
    setWorkOn(session.work_on ?? '')
    setIntensity(session.intensity)
    setMood(session.mood)
    setEnergyLevel(session.energy_level)
    setNotes(session.notes ?? '')
    setGoalId(session.goal_id)
    if (session.side_balance) {
      setTrackSideBalance(true)
      setDominantPct(session.side_balance.dominant_pct)
      setWeakPct(session.side_balance.weak_pct)
    }
  }, [session])

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
        tab_category: tabCategory,
        intensity,
        mood,
        energy_level: energyLevel,
        high_points: highPoints.trim() || undefined,
        work_on: workOn.trim() || undefined,
        notes: notes.trim() || undefined,
        goal_id: goalId,
        side_balance: trackSides && trackSideBalance ? { dominant_pct: dominantPct, weak_pct: weakPct } : null,
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

      <SessionTabSelect value={tabCategory} onChange={setTabCategory} />

      <Textarea
        label="High points"
        value={highPoints}
        onChange={(e) => setHighPoints(e.target.value)}
        placeholder="What went well during this session?"
        rows={2}
      />

      <Textarea
        label="To work on"
        value={workOn}
        onChange={(e) => setWorkOn(e.target.value)}
        placeholder="What do you want to improve next time?"
        rows={2}
      />

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

      <GoalLinkSelect value={goalId} onChange={setGoalId} />

      {trackSides && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={trackSideBalance}
              onChange={(e) => {
                setTrackSideBalance(e.target.checked)
                if (e.target.checked && !session?.side_balance) {
                  const defaults = defaultSideBalance()
                  setDominantPct(defaults.dominant_pct)
                  setWeakPct(defaults.weak_pct)
                }
              }}
            />
            Log dominant / weak side balance
          </label>
          {trackSideBalance && (
            <SideBalanceFields
              dominantPct={dominantPct}
              weakPct={weakPct}
              onChange={(d, w) => {
                setDominantPct(d)
                setWeakPct(w)
              }}
            />
          )}
        </div>
      )}

      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Anything else worth remembering…"
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
