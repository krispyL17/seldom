import { getSupabaseClient } from '@lib/supabase'
import type { TableUpdate } from '@/types/database'
import type {
  CreateSoccerMatchInput,
  SoccerMatch,
  UpdateSoccerMatchInput,
} from '@features/soccer/matches/types'
import { EVENT_TYPE_LABELS } from '@features/soccer/matches/types'

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

function competitionFromEvent(type: CreateSoccerMatchInput['event_type']): string {
  return EVENT_TYPE_LABELS[type]
}

export const soccerMatchService = {
  async fetchAll(): Promise<SoccerMatch[]> {
    const client = requireClient()
    const { data, error } = await client
      .from('soccer_matches')
      .select('*')
      .order('match_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as SoccerMatch[]
  },

  async create(userId: string, input: CreateSoccerMatchInput): Promise<SoccerMatch> {
    const client = requireClient()
    const opponent = input.opponent?.trim() || 'Self-reported'
    const { data, error } = await client
      .from('soccer_matches')
      .insert({
        user_id: userId,
        match_date: input.match_date,
        opponent,
        competition: competitionFromEvent(input.event_type),
        result: input.result,
        minutes: input.minutes ?? 0,
        goals: input.goals ?? 0,
        assists: input.assists ?? 0,
        notes: input.notes?.trim() || null,
        rating: null,
      })
      .select()
      .single()

    if (error) throw error
    return data as SoccerMatch
  },

  async update(id: string, input: UpdateSoccerMatchInput): Promise<SoccerMatch> {
    const client = requireClient()
    const payload: TableUpdate<'soccer_matches'> = {}
    if (input.match_date != null) payload.match_date = input.match_date
    if (input.opponent != null) payload.opponent = input.opponent.trim() || 'Self-reported'
    if (input.event_type != null) payload.competition = competitionFromEvent(input.event_type)
    if (input.result != null) payload.result = input.result
    if (input.minutes != null) payload.minutes = input.minutes
    if (input.goals != null) payload.goals = input.goals
    if (input.assists != null) payload.assists = input.assists
    if (input.notes !== undefined) payload.notes = input.notes?.trim() || null

    const { data, error } = await client.from('soccer_matches').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data as SoccerMatch
  },

  async delete(id: string): Promise<void> {
    const client = requireClient()
    const { error } = await client.from('soccer_matches').delete().eq('id', id)
    if (error) throw error
  },
}
