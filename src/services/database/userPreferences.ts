import { getSupabaseClient } from '@lib/supabase'
import type { TableUpdate } from '@/types/database'
import {
  DEFAULT_USER_PREFERENCES,
  type UserPreferences,
  type UserPreferencesPatch,
} from '@/types/userPreferences'

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

function mapRow(row: {
  user_id: string
  hobby_tab_label: string
  hobby_passion: string
  theme: string
  animations_enabled: boolean
  app_tutorial_completed_at: string | null
  browser_notifications_enabled?: boolean
  email_notifications_enabled?: boolean
  reminder_lead_minutes?: number
  calendar_sync_prompted_at?: string | null
  updated_at: string
}): UserPreferences {
  return {
    user_id: row.user_id,
    hobby_tab_label: row.hobby_tab_label,
    hobby_passion: row.hobby_passion,
    theme: row.theme as UserPreferences['theme'],
    animations_enabled: row.animations_enabled,
    app_tutorial_completed_at: row.app_tutorial_completed_at,
    browser_notifications_enabled: row.browser_notifications_enabled ?? false,
    email_notifications_enabled: row.email_notifications_enabled ?? false,
    reminder_lead_minutes: row.reminder_lead_minutes ?? 60,
    calendar_sync_prompted_at: row.calendar_sync_prompted_at ?? null,
    updated_at: row.updated_at,
  }
}

export const userPreferencesService = {
  async fetch(userId: string): Promise<UserPreferences | null> {
    const client = requireClient()
    const { data, error } = await client
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    return mapRow(data)
  },

  async ensure(userId: string): Promise<UserPreferences> {
    const existing = await userPreferencesService.fetch(userId)
    if (existing) return existing

    const client = requireClient()
    const { data, error } = await client
      .from('user_preferences')
      .insert({ user_id: userId, ...DEFAULT_USER_PREFERENCES })
      .select()
      .single()

    if (error) throw error
    return mapRow(data)
  },

  async patch(userId: string, payload: UserPreferencesPatch): Promise<UserPreferences> {
    const client = requireClient()
    await userPreferencesService.ensure(userId)

    const { data, error } = await client
      .from('user_preferences')
      .update(payload as TableUpdate<'user_preferences'>)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return mapRow(data)
  },

  async completeTutorial(userId: string, patch: UserPreferencesPatch): Promise<UserPreferences> {
    return userPreferencesService.patch(userId, {
      ...patch,
      app_tutorial_completed_at: new Date().toISOString(),
    })
  },
}
