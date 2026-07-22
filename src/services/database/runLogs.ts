import { getSupabaseClient } from '@lib/supabase'
import type { TableUpdate } from '@/types/database'
import type {
  CreateRunGoalInput,
  CreateRunLogInput,
  RunGoal,
  RunLog,
  UpdateRunGoalInput,
  UpdateRunLogInput,
} from '@features/soccer/running/types'

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

export const runLogService = {
  async fetchAll(): Promise<RunLog[]> {
    const client = requireClient()
    const { data, error } = await client
      .from('run_logs')
      .select('*')
      .order('run_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as RunLog[]
  },

  async create(userId: string, input: CreateRunLogInput): Promise<RunLog> {
    const client = requireClient()
    const { data, error } = await client
      .from('run_logs')
      .insert({
        user_id: userId,
        run_date: input.run_date,
        distance_m: input.distance_m,
        distance_label: input.distance_label.trim(),
        duration_sec: input.duration_sec,
        notes: input.notes?.trim() || null,
      })
      .select()
      .single()

    if (error) throw error
    return data as RunLog
  },

  async update(id: string, input: UpdateRunLogInput): Promise<RunLog> {
    const client = requireClient()
    const payload: TableUpdate<'run_logs'> = {}

    if (input.run_date !== undefined) payload.run_date = input.run_date
    if (input.distance_m !== undefined) payload.distance_m = input.distance_m
    if (input.distance_label !== undefined) payload.distance_label = input.distance_label.trim()
    if (input.duration_sec !== undefined) payload.duration_sec = input.duration_sec
    if (input.notes !== undefined) payload.notes = input.notes?.trim() || null

    const { data, error } = await client
      .from('run_logs')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as RunLog
  },

  async delete(id: string): Promise<void> {
    const client = requireClient()
    const { error } = await client.from('run_logs').delete().eq('id', id)
    if (error) throw error
  },
}

export const runGoalService = {
  async fetchAll(): Promise<RunGoal[]> {
    const client = requireClient()
    const { data, error } = await client
      .from('run_goals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as RunGoal[]
  },

  async create(userId: string, input: CreateRunGoalInput): Promise<RunGoal> {
    const client = requireClient()
    const { data, error } = await client
      .from('run_goals')
      .insert({
        user_id: userId,
        distance_m: input.distance_m,
        distance_label: input.distance_label.trim(),
        target_duration_sec: input.target_duration_sec,
        deadline: input.deadline || null,
        notes: input.notes?.trim() || null,
      })
      .select()
      .single()

    if (error) throw error
    return data as RunGoal
  },

  async update(id: string, input: UpdateRunGoalInput): Promise<RunGoal> {
    const client = requireClient()
    const payload: TableUpdate<'run_goals'> = {}

    if (input.distance_m !== undefined) payload.distance_m = input.distance_m
    if (input.distance_label !== undefined) payload.distance_label = input.distance_label.trim()
    if (input.target_duration_sec !== undefined) payload.target_duration_sec = input.target_duration_sec
    if (input.deadline !== undefined) payload.deadline = input.deadline
    if (input.achieved_at !== undefined) payload.achieved_at = input.achieved_at
    if (input.notes !== undefined) payload.notes = input.notes?.trim() || null

    const { data, error } = await client.from('run_goals').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data as RunGoal
  },

  async delete(id: string): Promise<void> {
    const client = requireClient()
    const { error } = await client.from('run_goals').delete().eq('id', id)
    if (error) throw error
  },
}
