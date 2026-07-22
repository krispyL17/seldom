import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Textarea } from '@components/ui/Textarea'
import type { CreateJournalEntryInput, JournalEntry, JournalMood } from '../types'
import { ENERGY_LABELS, JOURNAL_MOODS, MOOD_LABELS } from '../types'
import { todayIsoDate } from '../utils'
import { cn } from '@lib/utils'

interface JournalEntryFormProps {
  entry?: JournalEntry | null
  onSubmit: (input: CreateJournalEntryInput) => Promise<void>
  onCancel: () => void
}

export function JournalEntryForm({ entry, onSubmit, onCancel }: JournalEntryFormProps) {
  const isEdit = Boolean(entry)

  const [entryDate, setEntryDate] = useState(todayIsoDate())
  const [mood, setMood] = useState<JournalMood>('good')
  const [energyLevel, setEnergyLevel] = useState(3)
  const [reflection, setReflection] = useState('')
  const [wins, setWins] = useState('')
  const [challenges, setChallenges] = useState('')
  const [tomorrowsFocus, setTomorrowsFocus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!entry) return
    setEntryDate(entry.entry_date)
    setMood(entry.mood)
    setEnergyLevel(entry.energy_level)
    setReflection(entry.reflection ?? '')
    setWins(entry.wins ?? '')
    setChallenges(entry.challenges ?? '')
    setTomorrowsFocus(entry.tomorrows_focus ?? '')
  }, [entry])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({
        entry_date: entryDate,
        mood,
        energy_level: energyLevel,
        reflection: reflection.trim() || undefined,
        wins: wins.trim() || undefined,
        challenges: challenges.trim() || undefined,
        tomorrows_focus: tomorrowsFocus.trim() || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Date"
        type="date"
        value={entryDate}
        onChange={(e) => setEntryDate(e.target.value)}
        required
      />

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
          Mood
        </legend>
        <div className="flex flex-wrap gap-2">
          {JOURNAL_MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                mood === m
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'border border-[var(--color-border)] bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/40',
              )}
            >
              {MOOD_LABELS[m]}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
          Energy level — {ENERGY_LABELS[energyLevel]}
        </label>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={energyLevel}
          onChange={(e) => setEnergyLevel(Number(e.target.value))}
          className="w-full accent-[var(--color-accent)]"
        />
        <div className="mt-1 flex justify-between text-[10px] text-[var(--color-text-tertiary)]">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>

      <Textarea
        label="Reflection"
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder="How was your day? What stood out?"
        rows={4}
      />

      <Textarea
        label="Wins"
        value={wins}
        onChange={(e) => setWins(e.target.value)}
        placeholder="What went well today?"
        rows={2}
      />

      <Textarea
        label="Challenges"
        value={challenges}
        onChange={(e) => setChallenges(e.target.value)}
        placeholder="What was difficult?"
        rows={2}
      />

      <Textarea
        label="Tomorrow's focus"
        value={tomorrowsFocus}
        onChange={(e) => setTomorrowsFocus(e.target.value)}
        placeholder="One priority for tomorrow"
        rows={2}
      />

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add entry'}
        </Button>
      </div>
    </form>
  )
}
