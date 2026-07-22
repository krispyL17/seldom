import { getSupabaseClient } from '@lib/supabase'
import type { TableUpdate } from '@/types/database'
import type { Award, CreateAwardInput, UpdateAwardInput } from '@features/college/types'
import { mapAwardRow } from '@features/college/mappers'

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

export const collegeAwardService = {
  async fetchAll(): Promise<Award[]> {
    const client = requireClient()
    const { data, error } = await client
      .from('college_awards')
      .select('*')
      .order('award_date', { ascending: false, nullsFirst: false })

    if (error) throw error
    return (data ?? []).map(mapAwardRow)
  },

  async create(userId: string, input: CreateAwardInput): Promise<Award> {
    const client = requireClient()
    const { data, error } = await client
      .from('college_awards')
      .insert({
        user_id: userId,
        name: input.name.trim(),
        organization: input.organization?.trim() || null,
        award_date: input.awardDate ?? null,
        level: input.level?.trim() || null,
        description: input.description?.trim() || null,
      })
      .select()
      .single()

    if (error) throw error
    return mapAwardRow(data)
  },

  async update(id: string, input: UpdateAwardInput): Promise<Award> {
    const client = requireClient()
    const payload: TableUpdate<'college_awards'> = {}
    if (input.name !== undefined) payload.name = input.name.trim()
    if (input.organization !== undefined) payload.organization = input.organization?.trim() || null
    if (input.awardDate !== undefined) payload.award_date = input.awardDate
    if (input.level !== undefined) payload.level = input.level?.trim() || null
    if (input.description !== undefined) payload.description = input.description?.trim() || null

    const { data, error } = await client
      .from('college_awards')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapAwardRow(data)
  },

  async delete(id: string): Promise<void> {
    const client = requireClient()
    const { error } = await client.from('college_awards').delete().eq('id', id)
    if (error) throw error
  },
}
