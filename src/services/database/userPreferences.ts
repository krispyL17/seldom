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
  theme_palette?: string
  nav_tab_colors?: Record<string, string> | null
  animations_enabled: boolean
  app_tutorial_completed_at: string | null
  tab_intros_completed?: Record<string, string> | null
  browser_notifications_enabled?: boolean
  email_notifications_enabled?: boolean
  reminder_lead_minutes?: number
  calendar_sync_prompted_at?: string | null
  distance_unit?: string
  college_enabled?: boolean
  updated_at: string
}): UserPreferences {
  return {
    user_id: row.user_id,
    hobby_tab_label: row.hobby_tab_label,
    hobby_passion: row.hobby_passion,
    theme: row.theme as UserPreferences['theme'],
    theme_palette:
      row.theme_palette === 'sunset' || row.theme_palette === 'ocean'
        ? row.theme_palette
        : 'classic',
    nav_tab_colors: (row.nav_tab_colors as Record<string, string> | null) ?? {},
    animations_enabled: row.animations_enabled,
    app_tutorial_completed_at: row.app_tutorial_completed_at,
    tab_intros_completed: (row.tab_intros_completed as Record<string, string> | null) ?? {},
    browser_notifications_enabled: row.browser_notifications_enabled ?? false,
    email_notifications_enabled: row.email_notifications_enabled ?? false,
    reminder_lead_minutes: row.reminder_lead_minutes ?? 60,
    calendar_sync_prompted_at: row.calendar_sync_prompted_at ?? null,
    distance_unit: row.distance_unit === 'km' ? 'km' : 'mi',
    college_enabled: row.college_enabled ?? false,
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

  async markTabIntroComplete(userId: string, tabId: string): Promise<UserPreferences> {
    const current = await userPreferencesService.ensure(userId)
    const tab_intros_completed = {
      ...current.tab_intros_completed,
      [tabId]: new Date().toISOString(),
    }
    return userPreferencesService.patch(userId, { tab_intros_completed })
  },
}
