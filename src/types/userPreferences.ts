/** Dark / light / system brightness — pairs with theme_palette for full appearance. */
export type ThemeAppearance = 'dark' | 'light' | 'system'

/** @deprecated Use ThemeAppearance */
export type AppTheme = ThemeAppearance

export type ThemePalette = 'classic' | 'sunset' | 'ocean'

export type DistanceUnit = 'km' | 'mi'

export type TabIntrosCompleted = Record<string, string>

/** Custom sidebar bookmark colors keyed by nav item id (empty = palette gradient defaults). */
export type NavTabColors = Record<string, string>

export interface UserPreferences {
  user_id: string
  hobby_tab_label: string
  hobby_passion: string
  /** Brightness mode */
  theme: ThemeAppearance
  theme_palette: ThemePalette
  nav_tab_colors: NavTabColors
  animations_enabled: boolean
  app_tutorial_completed_at: string | null
  tab_intros_completed: TabIntrosCompleted
  browser_notifications_enabled: boolean
  email_notifications_enabled: boolean
  reminder_lead_minutes: number
  calendar_sync_prompted_at: string | null
  distance_unit: DistanceUnit
  college_enabled: boolean
  updated_at: string
}

export const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, 'user_id' | 'updated_at'> = {
  hobby_tab_label: 'Performance',
  hobby_passion: '',
  theme: 'dark',
  theme_palette: 'classic',
  nav_tab_colors: {},
  animations_enabled: true,
  app_tutorial_completed_at: null,
  tab_intros_completed: {},
  browser_notifications_enabled: false,
  email_notifications_enabled: false,
  reminder_lead_minutes: 60,
  calendar_sync_prompted_at: null,
  distance_unit: 'mi',
  college_enabled: false,
}

export type UserPreferencesPatch = Partial<
  Pick<
    UserPreferences,
    | 'hobby_tab_label'
    | 'hobby_passion'
    | 'theme'
    | 'theme_palette'
    | 'nav_tab_colors'
    | 'animations_enabled'
    | 'app_tutorial_completed_at'
    | 'tab_intros_completed'
    | 'browser_notifications_enabled'
    | 'email_notifications_enabled'
    | 'reminder_lead_minutes'
    | 'calendar_sync_prompted_at'
    | 'distance_unit'
    | 'college_enabled'
  >
>
