/** Mood options for a journal entry */
export type JournalMood = 'great' | 'good' | 'okay' | 'low' | 'rough'

export interface JournalEntry {
  id: string
  user_id: string
  entry_date: string
  mood: JournalMood
  energy_level: number
  reflection: string | null
  wins: string | null
  challenges: string | null
  tomorrows_focus: string | null
  created_at: string
  updated_at: string
}

export interface CreateJournalEntryInput {
  entry_date: string
  mood: JournalMood
  energy_level: number
  reflection?: string
  wins?: string
  challenges?: string
  tomorrows_focus?: string
}

export interface UpdateJournalEntryInput {
  entry_date?: string
  mood?: JournalMood
  energy_level?: number
  reflection?: string | null
  wins?: string | null
  challenges?: string | null
  tomorrows_focus?: string | null
}

export const JOURNAL_MOODS: JournalMood[] = ['great', 'good', 'okay', 'low', 'rough']

export const MOOD_LABELS: Record<JournalMood, string> = {
  great: 'Great',
  good: 'Good',
  okay: 'Okay',
  low: 'Low',
  rough: 'Rough',
}

export const ENERGY_LABELS: Record<number, string> = {
  1: 'Drained',
  2: 'Low',
  3: 'Steady',
  4: 'Energized',
  5: 'Peak',
}
