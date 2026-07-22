import type { JournalEntry, JournalMood } from './types'
import { MOOD_LABELS } from './types'

export function moodLabel(mood: JournalMood): string {
  return MOOD_LABELS[mood]
}

export function moodBadgeVariant(
  mood: JournalMood,
): 'success' | 'accent' | 'default' | 'warning' | 'danger' {
  switch (mood) {
    case 'great':
      return 'success'
    case 'good':
      return 'accent'
    case 'okay':
      return 'default'
    case 'low':
      return 'warning'
    case 'rough':
      return 'danger'
  }
}

export function formatEntryDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortEntryDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function sortEntriesChronologically(entries: JournalEntry[]): JournalEntry[] {
  return [...entries].sort((a, b) => {
    const dateCompare = b.entry_date.localeCompare(a.entry_date)
    if (dateCompare !== 0) return dateCompare
    return b.created_at.localeCompare(a.created_at)
  })
}

export function energyVariant(level: number): 'danger' | 'warning' | 'accent' | 'success' {
  if (level <= 2) return 'danger'
  if (level === 3) return 'warning'
  if (level === 4) return 'accent'
  return 'success'
}

export function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
