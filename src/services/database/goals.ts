import { getSupabaseClient } from '@lib/supabase'
import type { Json, TableUpdate } from '@/types/database'
import type {
  CreateGoalInput,
  Goal,
  Milestone,
  UpdateGoalInput,
} from '@features/goals/types'

type GoalRow = Omit<Goal, 'milestones'> & { milestones: Json }

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

function parseMilestones(raw: Json): Milestone[] {
  if (!Array.isArray(raw)) return []
  return raw as unknown as Milestone[]
}

function normalizeGoal(row: GoalRow): Goal {
  return {
    ...row,
    milestones: parseMilestones(row.milestones),
  }
}

function milestonesToJson(milestones: Milestone[]): Json {
  return milestones as unknown as Json
}

export const goalService = {
  async fetchAll(): Promise<Goal[]> {
    const client = requireClient()
    const { data, error } = await client
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []).map((row) => normalizeGoal(row as GoalRow))
  },

  async create(userId: string, input: CreateGoalInput): Promise<Goal> {
    const client = requireClient()
    const { data, error } = await client
      .from('goals')
      .insert({
        user_id: userId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        target_date: input.target_date ?? null,
        progress: input.progress ?? 0,
        milestones: milestonesToJson(input.milestones ?? []),
        category: input.category?.trim() || null,
        status: input.status ?? 'active',
      })
      .select()
      .single()

    if (error) throw error
    return normalizeGoal(data as GoalRow)
  },

  async update(id: string, input: UpdateGoalInput): Promise<Goal> {
    const client = requireClient()
    const payload: TableUpdate<'goals'> = {}

    if (input.title !== undefined) payload.title = input.title.trim()
    if (input.description !== undefined) payload.description = input.description?.trim() || null
    if (input.target_date !== undefined) payload.target_date = input.target_date
    if (input.progress !== undefined) payload.progress = input.progress
    if (input.milestones !== undefined) payload.milestones = milestonesToJson(input.milestones)
    if (input.category !== undefined) payload.category = input.category?.trim() || null
    if (input.status !== undefined) payload.status = input.status

    const { data, error } = await client
      .from('goals')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return normalizeGoal(data as GoalRow)
  },

  async delete(id: string): Promise<void> {
    const client = requireClient()
    const { error } = await client.from('goals').delete().eq('id', id)
    if (error) throw error
  },

  async archive(id: string): Promise<Goal> {
    return goalService.update(id, { status: 'archived' })
  },

  async restore(id: string): Promise<Goal> {
    return goalService.update(id, { status: 'active' })
  },

  /** Nudge linked goal progress after completing related work. */
  async bumpProgress(id: string, amount = 5): Promise<Goal | null> {
    const client = requireClient()
    const { data: row, error: fetchError } = await client
      .from('goals')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!row || row.status !== 'active') return null

    const next = Math.min(100, (row.progress ?? 0) + amount)
    return goalService.update(id, {
      progress: next,
      status: next >= 100 ? 'completed' : 'active',
    })
  },
}
