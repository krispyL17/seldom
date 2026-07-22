import { getSupabaseClient } from '@lib/supabase'
import type { CreateCollegeInput, College, UpdateCollegeInput } from '@features/college/types'
import { JUNIOR_CHECKLIST } from '@features/college/types'
import { collegeToInsert, collegeToUpdate, mapCollegeRow } from '@features/college/mappers'

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

export const collegeService = {
  async fetchAll(): Promise<College[]> {
    const client = requireClient()
    const { data, error } = await client
      .from('colleges')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return (data ?? []).map(mapCollegeRow)
  },

  async create(userId: string, input: CreateCollegeInput): Promise<College> {
    const client = requireClient()
    const { data, error } = await client
      .from('colleges')
      .insert(
        collegeToInsert(userId, {
          ...input,
          checklist: JUNIOR_CHECKLIST,
        }),
      )
      .select()
      .single()

    if (error) throw error
    return mapCollegeRow(data)
  },

  async update(id: string, input: UpdateCollegeInput): Promise<College> {
    const client = requireClient()
    const { data, error } = await client
      .from('colleges')
      .update(collegeToUpdate(input))
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapCollegeRow(data)
  },

  async delete(id: string): Promise<void> {
    const client = requireClient()
    const { error } = await client.from('colleges').delete().eq('id', id)
    if (error) throw error
  },
}
