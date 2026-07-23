import { getSupabaseClient } from '@lib/supabase'
import type { TableInsert } from '@/types/database'

export interface CreateSoccerInsightInput {
  insight_type: 'weakness' | 'strength'
  title: string
  description?: string
  priority?: 'high' | 'medium' | 'low'
  category?: string
}

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

export const soccerInsightService = {
  async create(userId: string, input: CreateSoccerInsightInput) {
    const client = requireClient()
    const row: TableInsert<'soccer_insights'> = {
      user_id: userId,
      insight_type: input.insight_type,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      priority: input.priority ?? 'medium',
      category: input.category?.trim() || null,
    }

    const { data, error } = await client.from('soccer_insights').insert(row).select().single()
    if (error) throw error
    return data
  },

  async fetchAll(userId: string) {
    const client = requireClient()
    const { data, error } = await client
      .from('soccer_insights')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },
}
