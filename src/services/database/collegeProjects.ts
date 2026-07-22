import { getSupabaseClient } from '@lib/supabase'
import type { TableUpdate } from '@/types/database'
import type { CreateProjectInput, Project, UpdateProjectInput } from '@features/college/types'
import { mapProjectRow, toJson } from '@features/college/mappers'

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

export const collegeProjectService = {
  async fetchAll(): Promise<Project[]> {
    const client = requireClient()
    const { data, error } = await client
      .from('college_projects')
      .select('*')
      .order('start_date', { ascending: false, nullsFirst: false })

    if (error) throw error
    return (data ?? []).map(mapProjectRow)
  },

  async create(userId: string, input: CreateProjectInput): Promise<Project> {
    const client = requireClient()
    const { data, error } = await client
      .from('college_projects')
      .insert({
        user_id: userId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        technologies: input.technologies ?? [],
        my_role: input.myRole?.trim() || null,
        results: input.results?.trim() || null,
        challenges: input.challenges?.trim() || null,
        lessons_learned: input.lessonsLearned?.trim() || null,
        documents: toJson(input.documents ?? []),
        start_date: input.startDate ?? null,
        end_date: input.endDate ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return mapProjectRow(data)
  },

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    const client = requireClient()
    const payload: TableUpdate<'college_projects'> = {}
    if (input.name !== undefined) payload.name = input.name.trim()
    if (input.description !== undefined) payload.description = input.description?.trim() || null
    if (input.technologies !== undefined) payload.technologies = input.technologies
    if (input.myRole !== undefined) payload.my_role = input.myRole?.trim() || null
    if (input.results !== undefined) payload.results = input.results?.trim() || null
    if (input.challenges !== undefined) payload.challenges = input.challenges?.trim() || null
    if (input.lessonsLearned !== undefined) payload.lessons_learned = input.lessonsLearned?.trim() || null
    if (input.documents !== undefined) payload.documents = toJson(input.documents)
    if (input.startDate !== undefined) payload.start_date = input.startDate
    if (input.endDate !== undefined) payload.end_date = input.endDate

    const { data, error } = await client
      .from('college_projects')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapProjectRow(data)
  },

  async delete(id: string): Promise<void> {
    const client = requireClient()
    const { error } = await client.from('college_projects').delete().eq('id', id)
    if (error) throw error
  },
}
