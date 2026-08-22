import { getSupabaseClient } from '@lib/supabase'
import type { Json, TableUpdate } from '@/types/database'
import type {
  CreateTrainingSessionInput,
  TechnicalRatings,
  TrainingSession,
  UpdateTrainingSessionInput,
} from '@features/soccer/training/types'
import type { SideBalance } from '@features/soccer/athlete/types'
import { defaultTechnicalRatings } from '@features/soccer/training/types'
import { parseTechnicalRatings } from '@features/soccer/training/utils'
import { positionPlayedFromSessionInput } from '@features/soccer/utils/sessionTabCategory'

type TrainingSessionRow = Omit<TrainingSession, 'technical_ratings'> & { technical_ratings: Json }

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

function ratingsToJson(ratings: TechnicalRatings): Json {
  return ratings as unknown as Json
}

function sideBalanceToJson(balance: SideBalance | null | undefined): Json | null {
  if (!balance) return null
  return balance as unknown as Json
}

function parseSideBalance(raw: unknown): SideBalance | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Partial<SideBalance>
  if (typeof o.dominant_pct !== 'number' || typeof o.weak_pct !== 'number') return null
  return { dominant_pct: o.dominant_pct, weak_pct: o.weak_pct }
}

function parseSkillsTrained(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((id): id is string => typeof id === 'string')
}

function normalizeSession(row: TrainingSessionRow): TrainingSession {
  const ratings = parseTechnicalRatings(row.technical_ratings)
  if (!ratings) throw new Error('Invalid technical ratings in database row')
  return {
    ...row,
    high_points: row.high_points ?? null,
    work_on: row.work_on ?? null,
    goal_id: row.goal_id ?? null,
    side_balance: parseSideBalance(row.side_balance),
    skills_trained: parseSkillsTrained((row as { skills_trained?: unknown }).skills_trained),
    team_session: Boolean((row as { team_session?: boolean }).team_session),
    technical_ratings: ratings,
  }
}

function categoryFromInput(input: { tab_category?: string | null; focus?: string }): string {
  return positionPlayedFromSessionInput(input)
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
        position_played: categoryFromInput(input),
        intensity: input.intensity,
        mood: input.mood,
        energy_level: input.energy_level,
        technical_ratings: ratingsToJson(input.technical_ratings ?? defaultTechnicalRatings()),
        high_points: input.high_points?.trim() || null,
        work_on: input.work_on?.trim() || null,
        notes: input.notes?.trim() || null,
        goal_id: input.goal_id ?? null,
        side_balance: sideBalanceToJson(input.side_balance),
        skills_trained: (input.skills_trained ?? []) as unknown as Json,
        team_session: input.team_session ?? false,
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
    if (input.tab_category !== undefined || input.focus !== undefined) {
      payload.position_played = categoryFromInput(input)
    }
    if (input.intensity !== undefined) payload.intensity = input.intensity
    if (input.mood !== undefined) payload.mood = input.mood
    if (input.energy_level !== undefined) payload.energy_level = input.energy_level
    if (input.high_points !== undefined) payload.high_points = input.high_points?.trim() || null
    if (input.work_on !== undefined) payload.work_on = input.work_on?.trim() || null
    if (input.notes !== undefined) payload.notes = input.notes?.trim() || null
    if (input.goal_id !== undefined) payload.goal_id = input.goal_id
    if (input.side_balance !== undefined) payload.side_balance = sideBalanceToJson(input.side_balance)
    if (input.skills_trained !== undefined) {
      payload.skills_trained = input.skills_trained as unknown as Json
    }
    if (input.team_session !== undefined) payload.team_session = input.team_session
    if (input.technical_ratings !== undefined) {
      payload.technical_ratings = ratingsToJson(input.technical_ratings)
    }

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
