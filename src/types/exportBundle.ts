import type { GymLog } from '@analytics/types'
import type { AssistantState } from '@features/assistant/types'
import type {
  CustomThemes,
  DistanceUnit,
  NavTabColors,
  ThemeAppearance,
  ThemePalette,
  UserPreferences,
} from '@/types/userPreferences'

export const EXPORT_SCHEMA_VERSION = 2
export const SELDOM_APP_VERSION = '0.2.1'

/** Theme + custom palette slots — explicit in v2 backups for reliable restore. */
export interface ExportAppearanceData {
  theme: ThemeAppearance
  theme_palette: ThemePalette
  custom_themes: CustomThemes
  nav_tab_colors: NavTabColors
  animations_enabled: boolean
  distance_unit: DistanceUnit
}

/** Raw Supabase rows keyed by table name. */
export interface ExportSupabaseData {
  goals: Record<string, unknown>[]
  tasks: Record<string, unknown>[]
  journal_entries: Record<string, unknown>[]
  training_sessions: Record<string, unknown>[]
  run_logs: Record<string, unknown>[]
  run_goals: Record<string, unknown>[]
  colleges: Record<string, unknown>[]
  college_activities: Record<string, unknown>[]
  college_awards: Record<string, unknown>[]
  college_projects: Record<string, unknown>[]
  college_user_data: Record<string, unknown> | null
  soccer_matches: Record<string, unknown>[]
  soccer_insights: Record<string, unknown>[]
  soccer_user_data: Record<string, unknown> | null
  user_preferences: Record<string, unknown> | null
  memories: Record<string, unknown>[]
}

export interface ExportLocalData {
  gymLogs: GymLog[]
  assistant: AssistantState
  preferences: Omit<UserPreferences, 'user_id'> | null
}

export interface ExportBundle {
  schemaVersion: number
  exportedAt: string
  appVersion: string
  sourceUserId: string | null
  supabase: ExportSupabaseData
  local: ExportLocalData
  /** v2 — theme palette, custom themes, nav colors */
  appearance?: ExportAppearanceData
}

export type ImportMode = 'merge' | 'replace'

export interface ImportResult {
  imported: Record<string, number>
  skipped: string[]
}

export const SUPPORTED_EXPORT_SCHEMA_VERSIONS = [1, 2] as const
