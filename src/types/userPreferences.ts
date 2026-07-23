export type AppTheme = 'dark' | 'light' | 'system'

export interface UserPreferences {
  user_id: string
  hobby_tab_label: string
  hobby_passion: string
  theme: AppTheme
  animations_enabled: boolean
  app_tutorial_completed_at: string | null
  browser_notifications_enabled: boolean
  email_notifications_enabled: boolean
  reminder_lead_minutes: number
  calendar_sync_prompted_at: string | null
  updated_at: string
}

export const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, 'user_id' | 'updated_at'> = {
  hobby_tab_label: 'Performance',
  hobby_passion: '',
  theme: 'dark',
  animations_enabled: true,
  app_tutorial_completed_at: null,
  browser_notifications_enabled: false,
  email_notifications_enabled: false,
  reminder_lead_minutes: 60,
  calendar_sync_prompted_at: null,
}

export type UserPreferencesPatch = Partial<
  Pick<
    UserPreferences,
    | 'hobby_tab_label'
    | 'hobby_passion'
    | 'theme'
    | 'animations_enabled'
    | 'app_tutorial_completed_at'
    | 'browser_notifications_enabled'
    | 'email_notifications_enabled'
    | 'reminder_lead_minutes'
    | 'calendar_sync_prompted_at'
  >
>
