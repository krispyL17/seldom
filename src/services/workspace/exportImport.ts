import type { GymLog } from '@analytics/types'
import { ASSISTANT_STORAGE_KEY, type AssistantState } from '@features/assistant/types'
import { getSupabaseClient } from '@lib/supabase'
import type { AppearancePrefs } from '@services/workspace/resetWorkspace'
import { resetWorkspaceForUser } from '@services/workspace/resetWorkspace'
import { userPreferencesService } from '@services/database/userPreferences'
import { localPreferencesService } from '@services/preferences/localPreferences'
import { fetchLocalGymLogs } from '@services/analytics/gymLogsLocal'
import type {
  ExportAppearanceData,
  ExportBundle,
  ExportLocalData,
  ExportSupabaseData,
  ImportMode,
  ImportResult,
} from '@/types/exportBundle'
import {
  EXPORT_SCHEMA_VERSION,
  SELDOM_APP_VERSION,
  SUPPORTED_EXPORT_SCHEMA_VERSIONS,
} from '@/types/exportBundle'
import {
  DEFAULT_USER_PREFERENCES,
  type CustomThemes,
  type NavTabColors,
  type ThemeAppearance,
  type ThemePalette,
} from '@/types/userPreferences'

const ARRAY_TABLES = [
  'goals',
  'tasks',
  'journal_entries',
  'training_sessions',
  'run_logs',
  'run_goals',
  'colleges',
  'college_activities',
  'college_awards',
  'college_projects',
  'soccer_matches',
  'soccer_insights',
  'memories',
] as const

const IMPORT_ORDER = [
  'goals',
  'tasks',
  'journal_entries',
  'training_sessions',
  'run_logs',
  'run_goals',
  'college_activities',
  'college_awards',
  'college_projects',
  'colleges',
  'college_user_data',
  'soccer_matches',
  'soccer_insights',
  'soccer_user_data',
  'user_preferences',
  'memories',
] as const

const GYM_LOGS_KEY = 'seldom-gym-logs'
const PREFS_KEY = 'seldom-user-preferences'

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

async function fetchTableRows(table: string): Promise<Record<string, unknown>[]> {
  const client = requireClient()
  const { data, error } = await client.from(table).select('*')
  if (error) throw new Error(`Failed to export ${table}: ${error.message}`)
  return (data ?? []) as Record<string, unknown>[]
}

async function fetchSingletonRow(table: string): Promise<Record<string, unknown> | null> {
  const client = requireClient()
  const { data, error } = await client.from(table).select('*').maybeSingle()
  if (error) throw new Error(`Failed to export ${table}: ${error.message}`)
  return (data as Record<string, unknown> | null) ?? null
}

function readAssistantState(): AssistantState {
  try {
    const raw = localStorage.getItem(ASSISTANT_STORAGE_KEY)
    if (!raw) return { conversations: [], activeConversationId: null }
    return JSON.parse(raw) as AssistantState
  } catch {
    return { conversations: [], activeConversationId: null }
  }
}

function readLocalPreferences(): ExportLocalData['preferences'] {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ExportLocalData['preferences']
  } catch {
    return null
  }
}

function parseThemePalette(value: unknown): ThemePalette {
  if (
    value === 'sunset' ||
    value === 'ocean' ||
    value === 'custom-1' ||
    value === 'custom-2'
  ) {
    return value
  }
  return 'classic'
}

function parseCustomThemes(value: unknown): CustomThemes {
  if (!value || typeof value !== 'object') return {}
  return value as CustomThemes
}

function parseNavTabColors(value: unknown): NavTabColors {
  if (!value || typeof value !== 'object') return {}
  return value as NavTabColors
}

function appearanceFromRecord(record: Record<string, unknown> | null | undefined): ExportAppearanceData {
  const source = record ?? {}
  return {
    theme: (source.theme === 'light' || source.theme === 'system' ? source.theme : 'dark') as ThemeAppearance,
    theme_palette: parseThemePalette(source.theme_palette),
    custom_themes: parseCustomThemes(source.custom_themes),
    nav_tab_colors: parseNavTabColors(source.nav_tab_colors),
    animations_enabled: source.animations_enabled !== false,
    distance_unit: source.distance_unit === 'km' ? 'km' : 'mi',
  }
}

function extractAppearanceFromBundle(bundle: ExportBundle): ExportAppearanceData {
  if (bundle.appearance) return bundle.appearance
  if (bundle.supabase.user_preferences) {
    return appearanceFromRecord(bundle.supabase.user_preferences)
  }
  if (bundle.local.preferences) {
    return appearanceFromRecord(bundle.local.preferences as unknown as Record<string, unknown>)
  }
  return {
    theme: DEFAULT_USER_PREFERENCES.theme,
    theme_palette: DEFAULT_USER_PREFERENCES.theme_palette,
    custom_themes: DEFAULT_USER_PREFERENCES.custom_themes,
    nav_tab_colors: DEFAULT_USER_PREFERENCES.nav_tab_colors,
    animations_enabled: DEFAULT_USER_PREFERENCES.animations_enabled,
    distance_unit: DEFAULT_USER_PREFERENCES.distance_unit,
  }
}

function mergeCustomThemes(current: CustomThemes, incoming: CustomThemes): CustomThemes {
  return { ...current, ...incoming }
}

async function importAppearance(
  userId: string,
  bundle: ExportBundle,
  mode: ImportMode,
): Promise<number> {
  const incoming = extractAppearanceFromBundle(bundle)
  const current = await userPreferencesService.ensure(userId)

  const patch: AppearancePrefs = {
    theme: incoming.theme,
    theme_palette: incoming.theme_palette,
    custom_themes:
      mode === 'merge'
        ? mergeCustomThemes(current.custom_themes, incoming.custom_themes)
        : incoming.custom_themes,
    nav_tab_colors:
      mode === 'merge'
        ? { ...current.nav_tab_colors, ...incoming.nav_tab_colors }
        : incoming.nav_tab_colors,
    animations_enabled: incoming.animations_enabled,
    distance_unit: incoming.distance_unit,
  }

  await userPreferencesService.patch(userId, patch)
  localPreferencesService.patch(userId, patch)
  return 1
}

function stripUserId(row: Record<string, unknown>): Record<string, unknown> {
  const { user_id: _userId, ...rest } = row
  return rest
}

function withUserId(userId: string, row: Record<string, unknown>): Record<string, unknown> {
  return { ...row, user_id: userId }
}

async function upsertRows(table: string, rows: Record<string, unknown>[]): Promise<number> {
  if (rows.length === 0) return 0
  const client = requireClient()
  const chunkSize = 100
  let count = 0

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await client.from(table).upsert(chunk as never[], { onConflict: 'id' })
    if (error) throw new Error(`Failed to import ${table}: ${error.message}`)
    count += chunk.length
  }

  return count
}

async function upsertSingleton(
  table: string,
  row: Record<string, unknown> | null,
  userId: string,
): Promise<number> {
  if (!row) return 0
  const client = requireClient()
  const payload = withUserId(userId, stripUserId(row))
  const { error } = await client.from(table).upsert(payload as never, { onConflict: 'user_id' })
  if (error) throw new Error(`Failed to import ${table}: ${error.message}`)
  return 1
}

function importGymLogs(userId: string, logs: GymLog[], mode: ImportMode): number {
  if (logs.length === 0) return 0

  let existing: GymLog[] = []
  try {
    const raw = localStorage.getItem(GYM_LOGS_KEY)
    if (raw) existing = JSON.parse(raw) as GymLog[]
  } catch {
    existing = []
  }

  const imported = logs.map((log) => ({ ...log, user_id: userId }))
  const importedIds = new Set(imported.map((log) => log.id))

  const kept =
    mode === 'replace'
      ? existing.filter((log) => log.user_id !== userId)
      : existing.filter((log) => log.user_id !== userId || !importedIds.has(log.id))

  localStorage.setItem(GYM_LOGS_KEY, JSON.stringify([...imported, ...kept]))
  return imported.length
}

function importAssistantState(state: AssistantState, mode: ImportMode): number {
  if (state.conversations.length === 0) return 0

  if (mode === 'replace') {
    localStorage.setItem(ASSISTANT_STORAGE_KEY, JSON.stringify(state))
    return state.conversations.length
  }

  const current = readAssistantState()
  const existingIds = new Set(current.conversations.map((c) => c.id))
  const merged = [
    ...state.conversations,
    ...current.conversations.filter((c) => !existingIds.has(c.id)),
  ]
  const activeId =
    state.activeConversationId && merged.some((c) => c.id === state.activeConversationId)
      ? state.activeConversationId
      : current.activeConversationId

  localStorage.setItem(
    ASSISTANT_STORAGE_KEY,
    JSON.stringify({ conversations: merged, activeConversationId: activeId }),
  )
  return state.conversations.length
}

export async function exportWorkspaceData(userId: string): Promise<ExportBundle> {
  const supabase: ExportSupabaseData = {
    goals: await fetchTableRows('goals'),
    tasks: await fetchTableRows('tasks'),
    journal_entries: await fetchTableRows('journal_entries'),
    training_sessions: await fetchTableRows('training_sessions'),
    run_logs: await fetchTableRows('run_logs'),
    run_goals: await fetchTableRows('run_goals'),
    colleges: await fetchTableRows('colleges'),
    college_activities: await fetchTableRows('college_activities'),
    college_awards: await fetchTableRows('college_awards'),
    college_projects: await fetchTableRows('college_projects'),
    college_user_data: await fetchSingletonRow('college_user_data'),
    soccer_matches: await fetchTableRows('soccer_matches'),
    soccer_insights: await fetchTableRows('soccer_insights'),
    soccer_user_data: await fetchSingletonRow('soccer_user_data'),
    user_preferences: await fetchSingletonRow('user_preferences'),
    memories: await fetchTableRows('memories'),
  }

  const userPrefsRow = supabase.user_preferences

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: SELDOM_APP_VERSION,
    sourceUserId: userId,
    supabase,
    appearance: appearanceFromRecord(userPrefsRow ?? readLocalPreferences()),
    local: {
      gymLogs: fetchLocalGymLogs(userId),
      assistant: readAssistantState(),
      preferences: readLocalPreferences(),
    },
  }
}

export function downloadExportBundle(bundle: ExportBundle): void {
  const json = JSON.stringify(bundle, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const stamp = new Date().toISOString().slice(0, 10)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `seldom-backup-${stamp}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function parseExportBundle(raw: string): ExportBundle {
  const parsed = JSON.parse(raw) as ExportBundle
  if (!SUPPORTED_EXPORT_SCHEMA_VERSIONS.includes(parsed.schemaVersion as 1 | 2)) {
    throw new Error(`Unsupported backup version (${parsed.schemaVersion}). Update Seldom and try again.`)
  }
  if (!parsed.supabase || !parsed.local) {
    throw new Error('Invalid backup file — missing data sections.')
  }
  if (!parsed.appearance) {
    parsed.appearance = extractAppearanceFromBundle(parsed)
  }
  return parsed
}

export async function importWorkspaceData(
  userId: string,
  bundle: ExportBundle,
  mode: ImportMode,
  appearance?: AppearancePrefs,
): Promise<ImportResult> {
  if (mode === 'replace') {
    if (!appearance) {
      throw new Error('Appearance preferences are required for replace mode.')
    }
    await resetWorkspaceForUser(userId, appearance)
  }

  const imported: Record<string, number> = {}
  const skipped: string[] = []

  for (const table of IMPORT_ORDER) {
    if (table === 'college_user_data' || table === 'soccer_user_data' || table === 'user_preferences') {
      const row = bundle.supabase[table]
      imported[table] = await upsertSingleton(table, row, userId)
      continue
    }

    const rows = bundle.supabase[table as keyof ExportSupabaseData]
    if (!Array.isArray(rows)) {
      skipped.push(table)
      continue
    }

    const payload = rows.map((row) => withUserId(userId, stripUserId(row as Record<string, unknown>)))
    imported[table] = await upsertRows(table, payload)
  }

  imported.gymLogs = importGymLogs(userId, bundle.local.gymLogs ?? [], mode)
  imported.assistantConversations = importAssistantState(
    bundle.local.assistant ?? { conversations: [], activeConversationId: null },
    mode,
  )
  imported.appearance = await importAppearance(userId, bundle, mode)

  if (bundle.local.preferences && mode === 'replace' && !bundle.supabase.user_preferences) {
    await userPreferencesService.patch(userId, bundle.local.preferences)
    localPreferencesService.patch(userId, bundle.local.preferences)
    imported.preferences = 1
  }

  return { imported, skipped }
}

export function countExportItems(bundle: ExportBundle): number {
  let total = 0
  for (const table of ARRAY_TABLES) {
    total += bundle.supabase[table]?.length ?? 0
  }
  if (bundle.supabase.college_user_data) total += 1
  if (bundle.supabase.soccer_user_data) total += 1
  if (bundle.supabase.user_preferences) total += 1
  if (bundle.appearance) total += 1
  total += bundle.local.gymLogs?.length ?? 0
  total += bundle.local.assistant?.conversations?.length ?? 0
  return total
}
