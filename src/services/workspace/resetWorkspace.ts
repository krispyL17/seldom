import { getSupabaseClient } from '@lib/supabase'
import { clearLocalAppData } from '@lib/clearLocalAppData'
import { TUTORIAL_RESET_STORAGE_KEY, TUTORIAL_RESET_VERSION } from '@config/tutorialReset'
import type { UserPreferences } from '@/types/userPreferences'

const DELETE_TABLES = [
  'tasks',
  'journal_entries',
  'training_sessions',
  'run_logs',
  'run_goals',
  'goals',
  'college_activities',
  'college_awards',
  'college_projects',
  'colleges',
  'soccer_matches',
  'soccer_insights',
  'memories',
] as const

export type AppearancePrefs = Pick<
  UserPreferences,
  | 'theme'
  | 'theme_palette'
  | 'custom_themes'
  | 'nav_tab_colors'
  | 'animations_enabled'
  | 'distance_unit'
>

/** Wipe app data for the signed-in user; keeps auth account and appearance preferences. */
export async function resetWorkspaceForUser(
  userId: string,
  appearance: AppearancePrefs,
): Promise<void> {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')

  for (const table of DELETE_TABLES) {
    const { error } = await client.from(table).delete().eq('user_id', userId)
    if (error) throw new Error(`Failed to reset ${table}: ${error.message}`)
  }

  await client
    .from('soccer_user_data')
    .update({ onboarding_completed_at: null, profile: {} })
    .eq('user_id', userId)

  await client.from('college_user_data').update({
    test_scores: {
      sat: { score: null, status: 'not_taken', date: null },
      act: { score: null, status: 'not_taken', date: null },
    },
    financial_aid: [],
    recommendations: [],
    scholarships: [],
    ai_recommendations: [],
    common_app: {
      activityDescriptions: [],
      essayIdeas: [],
      personalStatementDrafts: [],
      supplementalTracking: [],
      reflectionNotes: [],
    },
    resume_settings: {
      template: 'classic',
      selectedActivityIds: [],
      selectedAwardIds: [],
      selectedProjectIds: [],
      applicationPhase: 'junior',
      seniorModeStartedAt: null,
      onboardingCompletedAt: null,
      studentProfile: null,
    },
  }).eq('user_id', userId)

  await client
    .from('user_preferences')
    .update({
      app_tutorial_completed_at: null,
      tab_intros_completed: {},
      hobby_tab_label: 'Performance',
      hobby_passion: '',
      college_enabled: false,
      browser_notifications_enabled: false,
      email_notifications_enabled: false,
      theme: appearance.theme,
      theme_palette: appearance.theme_palette,
      custom_themes: appearance.custom_themes,
      nav_tab_colors: appearance.nav_tab_colors,
      animations_enabled: appearance.animations_enabled,
      distance_unit: appearance.distance_unit,
    })
    .eq('user_id', userId)

  clearLocalAppData()
  try {
    localStorage.setItem(TUTORIAL_RESET_STORAGE_KEY, String(TUTORIAL_RESET_VERSION))
  } catch {
    /* ignore */
  }
}
