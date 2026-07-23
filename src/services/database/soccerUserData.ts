import { getSupabaseClient } from '@lib/supabase'
import type { TableUpdate } from '@/types/database'
import type { Json } from '@/types/database'

export interface SoccerPlayerProfile {
  name: string
  position: string
  preferredFoot: string
  squadNumber: number | null
  season: string
  currentFocus: string
}

export interface SoccerUserData {
  user_id: string
  profile: SoccerPlayerProfile | null
  onboarding_completed_at: string | null
  updated_at: string
}

export const EMPTY_SOCCER_PROFILE: SoccerPlayerProfile = {
  name: '',
  position: 'CM',
  preferredFoot: 'Right',
  squadNumber: null,
  season: '2026–27',
  currentFocus: '',
}

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

function mapRow(row: {
  user_id: string
  profile: Json
  onboarding_completed_at: string | null
  updated_at: string
}): SoccerUserData {
  const profileRaw = row.profile as Partial<SoccerPlayerProfile> | null
  const profile =
    profileRaw && profileRaw.name
      ? {
          name: profileRaw.name ?? '',
          position: profileRaw.position ?? 'CM',
          preferredFoot: profileRaw.preferredFoot ?? 'Right',
          squadNumber: profileRaw.squadNumber ?? null,
          season: profileRaw.season ?? '2026–27',
          currentFocus: profileRaw.currentFocus ?? '',
        }
      : null

  return {
    user_id: row.user_id,
    profile,
    onboarding_completed_at: row.onboarding_completed_at,
    updated_at: row.updated_at,
  }
}

export const soccerUserDataService = {
  async fetch(userId: string): Promise<SoccerUserData | null> {
    const client = requireClient()
    const { data, error } = await client
      .from('soccer_user_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    return mapRow(data)
  },

  async ensure(userId: string): Promise<SoccerUserData> {
    const existing = await soccerUserDataService.fetch(userId)
    if (existing) return existing

    const client = requireClient()
    const { data, error } = await client
      .from('soccer_user_data')
      .insert({ user_id: userId, profile: {} })
      .select()
      .single()

    if (error) throw error
    return mapRow(data)
  },

  async updateProfile(userId: string, profile: SoccerPlayerProfile): Promise<SoccerUserData> {
    return soccerUserDataService.patch(userId, { profile: profile as unknown as Json })
  },

  async completeOnboarding(userId: string, profile: SoccerPlayerProfile): Promise<SoccerUserData> {
    return soccerUserDataService.patch(userId, {
      profile: profile as unknown as Json,
      onboarding_completed_at: new Date().toISOString(),
    })
  },

  async patch(userId: string, payload: TableUpdate<'soccer_user_data'>): Promise<SoccerUserData> {
    const client = requireClient()
    await soccerUserDataService.ensure(userId)

    const { data, error } = await client
      .from('soccer_user_data')
      .update(payload)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return mapRow(data)
  },
}
