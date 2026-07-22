import { getSupabaseClient } from '@lib/supabase'
import type { TableUpdate } from '@/types/database'
import type {
  CreateActivityInput,
  Activity,
  UpdateActivityInput,
} from '@features/college/types'
import { mapActivityRow } from '@features/college/mappers'

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

export const collegeActivityService = {
  async fetchAll(): Promise<Activity[]> {
    const client = requireClient()
    const { data, error } = await client
      .from('college_activities')
      .select('*')
      .order('start_date', { ascending: false, nullsFirst: false })

    if (error) throw error
    return (data ?? []).map(mapActivityRow)
  },

  async create(userId: string, input: CreateActivityInput): Promise<Activity> {
    const client = requireClient()
    const { data, error } = await client
      .from('college_activities')
      .insert({
        user_id: userId,
        name: input.name.trim(),
        category: input.category,
        organization: input.organization?.trim() || null,
        role: input.role?.trim() || null,
        description: input.description?.trim() || null,
        start_date: input.startDate ?? null,
        end_date: input.endDate ?? null,
        weekly_hours: input.weeklyHours ?? null,
        weeks_per_year: input.weeksPerYear ?? null,
        leadership: input.leadership?.trim() || null,
        achievements: input.achievements?.trim() || null,
        skills: input.skills ?? [],
      })
      .select()
      .single()

    if (error) throw error
    return mapActivityRow(data)
  },

  async update(id: string, input: UpdateActivityInput): Promise<Activity> {
    const client = requireClient()
    const payload: TableUpdate<'college_activities'> = {}
    if (input.name !== undefined) payload.name = input.name.trim()
    if (input.category !== undefined) payload.category = input.category
    if (input.organization !== undefined) payload.organization = input.organization?.trim() || null
    if (input.role !== undefined) payload.role = input.role?.trim() || null
    if (input.description !== undefined) payload.description = input.description?.trim() || null
    if (input.startDate !== undefined) payload.start_date = input.startDate
    if (input.endDate !== undefined) payload.end_date = input.endDate
    if (input.weeklyHours !== undefined) payload.weekly_hours = input.weeklyHours
    if (input.weeksPerYear !== undefined) payload.weeks_per_year = input.weeksPerYear
    if (input.leadership !== undefined) payload.leadership = input.leadership?.trim() || null
    if (input.achievements !== undefined) payload.achievements = input.achievements?.trim() || null
    if (input.skills !== undefined) payload.skills = input.skills

    const { data, error } = await client
      .from('college_activities')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapActivityRow(data)
  },

  async delete(id: string): Promise<void> {
    const client = requireClient()
    const { error } = await client.from('college_activities').delete().eq('id', id)
    if (error) throw error
  },
}
