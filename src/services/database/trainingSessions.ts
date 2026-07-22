import { getSupabaseClient } from '@lib/supabase'
import type { Json, TableUpdate } from '@/types/database'
import type {
  CreateTrainingSessionInput,
  TechnicalRatings,
  TrainingSession,
  UpdateTrainingSessionInput,
} from '@features/soccer/training/types'
import { parseTechnicalRatings } from '@features/soccer/training/utils'

type TrainingSessionRow = Omit<TrainingSession, 'technical_ratings'> & { technical_ratings: Json }

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

function ratingsToJson(ratings: TechnicalRatings): Json {
  return ratings as unknown as Json
}

function normalizeSession(row: TrainingSessionRow): TrainingSession {
  const ratings = parseTechnicalRatings(row.technical_ratings)
  if (!ratings) throw new Error('Invalid technical ratings in database row')
  return { ...row, technical_ratings: ratings }
}

export const trainingSessionService = {
  async fetchAll(): Promise<TrainingSession[]> {
    const client = requireClient()
    const { data, error } = await client
      .from('training_sessions')
      .select('*')
      .order('session_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []).map((row) => normalizeSession(row as TrainingSessionRow))
  },

  async create(userId: string, input: CreateTrainingSessionInput): Promise<TrainingSession> {
    const client = requireClient()
    const { data, error } = await client
      .from('training_sessions')
      .insert({
        user_id: userId,
        session_date: input.session_date,
        duration_min: input.duration_min,
        position_played: input.position_played.trim(),
        intensity: input.intensity,
        mood: input.mood,
        energy_level: input.energy_level,
        technical_ratings: ratingsToJson(input.technical_ratings),
        notes: input.notes?.trim() || null,
      })
      .select()
      .single()

    if (error) throw error
    return normalizeSession(data as TrainingSessionRow)
  },

  async update(id: string, input: UpdateTrainingSessionInput): Promise<TrainingSession> {
    const client = requireClient()
    const payload: TableUpdate<'training_sessions'> = {}

    if (input.session_date !== undefined) payload.session_date = input.session_date
    if (input.duration_min !== undefined) payload.duration_min = input.duration_min
    if (input.position_played !== undefined) payload.position_played = input.position_played.trim()
    if (input.intensity !== undefined) payload.intensity = input.intensity
    if (input.mood !== undefined) payload.mood = input.mood
    if (input.energy_level !== undefined) payload.energy_level = input.energy_level
    if (input.technical_ratings !== undefined) {
      payload.technical_ratings = ratingsToJson(input.technical_ratings)
    }
    if (input.notes !== undefined) payload.notes = input.notes?.trim() || null

    const { data, error } = await client
      .from('training_sessions')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return normalizeSession(data as TrainingSessionRow)
  },

  async delete(id: string): Promise<void> {
    const client = requireClient()
    const { error } = await client.from('training_sessions').delete().eq('id', id)
    if (error) throw error
  },
}
