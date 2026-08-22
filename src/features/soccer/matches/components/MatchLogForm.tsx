import { useState } from 'react'
import { Button } from '@components/ui/Button'
import type { CreateSoccerMatchInput, GameEventType, GameResult, SoccerMatch } from '../types'
import { EVENT_TYPE_LABELS, RESULT_LABELS } from '../types'
import { todayIsoDate } from '../../training/utils'

interface MatchLogFormProps {
  match?: SoccerMatch | null
  onSubmit: (input: CreateSoccerMatchInput) => Promise<void>
  onCancel: () => void
}

export function MatchLogForm({ match, onSubmit, onCancel }: MatchLogFormProps) {
  const [matchDate, setMatchDate] = useState(match?.match_date ?? todayIsoDate())
  const [eventType, setEventType] = useState<GameEventType>('game')
  const [opponent, setOpponent] = useState(match?.opponent === 'Self-reported' ? '' : (match?.opponent ?? ''))
  const [result, setResult] = useState<GameResult>(match?.result ?? 'D')
  const [minutes, setMinutes] = useState(String(match?.minutes ?? ''))
  const [goals, setGoals] = useState(String(match?.goals ?? 0))
  const [assists, setAssists] = useState(String(match?.assists ?? 0))
  const [notes, setNotes] = useState(match?.notes ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        match_date: matchDate,
        event_type: eventType,
        opponent: opponent.trim() || undefined,
        result,
        minutes: minutes.trim() ? Number(minutes) : 0,
        goals: Number(goals) || 0,
        assists: Number(assists) || 0,
        notes: notes.trim() || undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[var(--color-text-secondary)]">Date</span>
          <input
            type="date"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5"
            required
          />
        </label>
        <label className="block">
          <span className="text-[var(--color-text-secondary)]">What was it?</span>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as GameEventType)}
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5"
          >
            {(Object.keys(EVENT_TYPE_LABELS) as GameEventType[]).map((key) => (
              <option key={key} value={key}>
                {EVENT_TYPE_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-[var(--color-text-secondary)]">Opponent (optional)</span>
        <input
          type="text"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          placeholder="e.g. Central High, pickup, IDK"
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5"
        />
      </label>

      <fieldset>
        <legend className="text-[var(--color-text-secondary)]">How did it go?</legend>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {(Object.keys(RESULT_LABELS) as GameResult[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setResult(key)}
              className={`rounded-[var(--radius-sm)] border px-2.5 py-1 text-xs ${
                result === key
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
                  : 'border-[var(--color-border)]'
              }`}
            >
              {RESULT_LABELS[key]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-3 gap-2">
        <label className="block">
          <span className="text-[var(--color-text-secondary)]">Minutes</span>
          <input
            type="number"
            min={0}
            max={120}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="—"
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5"
          />
        </label>
        <label className="block">
          <span className="text-[var(--color-text-secondary)]">Goals</span>
          <input
            type="number"
            min={0}
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5"
          />
        </label>
        <label className="block">
          <span className="text-[var(--color-text-secondary)]">Assists</span>
          <input
            type="number"
            min={0}
            value={assists}
            onChange={(e) => setAssists(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-[var(--color-text-secondary)]">Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="What went well? What to work on?"
          className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5"
        />
      </label>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Saving…' : match ? 'Update' : 'Log game'}
        </Button>
      </div>
    </form>
  )
}
