import { getSupabaseClient } from '@lib/supabase'
import type { TableUpdate } from '@/types/database'
import type {
  CreateJournalEntryInput,
  JournalEntry,
  UpdateJournalEntryInput,
} from '@features/journal/types'

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

export const journalService = {
  async fetchAll(): Promise<JournalEntry[]> {
    const client = requireClient()
    const { data, error } = await client
      .from('journal_entries')
      .select('*')
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as JournalEntry[]
  },

  async create(userId: string, input: CreateJournalEntryInput): Promise<JournalEntry> {
    const client = requireClient()
    const { data, error } = await client
      .from('journal_entries')
      .insert({
        user_id: userId,
        entry_date: input.entry_date,
        mood: input.mood,
        energy_level: input.energy_level,
        reflection: input.reflection?.trim() || null,
        wins: input.wins?.trim() || null,
        challenges: input.challenges?.trim() || null,
        tomorrows_focus: input.tomorrows_focus?.trim() || null,
      })
      .select()
      .single()

    if (error) throw error
    return data as JournalEntry
  },

  async update(id: string, input: UpdateJournalEntryInput): Promise<JournalEntry> {
    const client = requireClient()
    const payload: TableUpdate<'journal_entries'> = {}

    if (input.entry_date !== undefined) payload.entry_date = input.entry_date
    if (input.mood !== undefined) payload.mood = input.mood
    if (input.energy_level !== undefined) payload.energy_level = input.energy_level
    if (input.reflection !== undefined) payload.reflection = input.reflection?.trim() || null
    if (input.wins !== undefined) payload.wins = input.wins?.trim() || null
    if (input.challenges !== undefined) payload.challenges = input.challenges?.trim() || null
    if (input.tomorrows_focus !== undefined) {
      payload.tomorrows_focus = input.tomorrows_focus?.trim() || null
    }

    const { data, error } = await client
      .from('journal_entries')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as JournalEntry
  },

  async delete(id: string): Promise<void> {
    const client = requireClient()
    const { error } = await client.from('journal_entries').delete().eq('id', id)
    if (error) throw error
  },
}
