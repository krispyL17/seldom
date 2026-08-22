/** Dark / light / system brightness — pairs with theme_palette for full appearance. */
export type ThemeAppearance = 'dark' | 'light' | 'system'

/** @deprecated Use ThemeAppearance */
export type AppTheme = ThemeAppearance

export type BuiltinThemePalette = 'classic' | 'sunset' | 'ocean'
export type CustomThemeId = 'custom-1' | 'custom-2'
export type ThemePalette = BuiltinThemePalette | CustomThemeId

export interface CustomThemeDefinition {
  name: string
  colors: [string, string, string]
  /** Bookmark colors saved with this custom theme slot */
  navTabColors?: NavTabColors
}

/** Up to two user-defined themes keyed by slot id. */
export type CustomThemes = Partial<Record<CustomThemeId, CustomThemeDefinition>>

export function isCustomThemePalette(palette: ThemePalette): palette is CustomThemeId {
  return palette === 'custom-1' || palette === 'custom-2'
}

export const CUSTOM_THEME_SLOTS: { id: CustomThemeId; defaultName: string }[] = [
  { id: 'custom-1', defaultName: 'My theme 1' },
  { id: 'custom-2', defaultName: 'My theme 2' },
]

export type DistanceUnit = 'km' | 'mi'

export type TabIntrosCompleted = Record<string, string>

/** Custom sidebar bookmark colors keyed by nav item id (empty = palette gradient defaults). */
export type NavTabColors = Record<string, string>

export type OverviewInsightMode = 'analytics' | 'college'

export interface UserPreferences {
  user_id: string
  hobby_tab_label: string
  hobby_passion: string
  /** Brightness mode */
  theme: ThemeAppearance
  theme_palette: ThemePalette
  custom_themes: CustomThemes
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
  /** Home bottom-left insight panel when college prep is off */
  overview_insight_mode: OverviewInsightMode
  overview_college_prompt_dismissed_at: string | null
  updated_at: string
}

export const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, 'user_id' | 'updated_at'> = {
  hobby_tab_label: 'Performance',
  hobby_passion: '',
  theme: 'dark',
  theme_palette: 'classic',
  custom_themes: {},
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
  overview_insight_mode: 'analytics',
  overview_college_prompt_dismissed_at: null,
}

export type UserPreferencesPatch = Partial<
  Pick<
    UserPreferences,
    | 'hobby_tab_label'
    | 'hobby_passion'
    | 'theme'
    | 'theme_palette'
    | 'custom_themes'
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
    | 'overview_insight_mode'
    | 'overview_college_prompt_dismissed_at'
  >
>
