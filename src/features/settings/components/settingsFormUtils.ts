import type { NavTabColors, OverviewInsightMode, ThemeAppearance, ThemePalette, CustomThemes } from '@/types/userPreferences'

export const SETTINGS_INPUT_CLASS =
  'mt-1.5 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-base sm:text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]'

export const SETTINGS_CHECKBOX_CLASS =
  'h-4 w-4 shrink-0 rounded accent-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]'

export const DISPLAY_NAME_MAX = 50
export const TAB_LABEL_MAX = 30
export const PASSION_MAX = 50

export function clampReminderMinutes(raw: string): number {
  return Math.max(5, Math.min(10_080, Number(raw) || 60))
}

export function reminderMinutesInvalid(raw: string): boolean {
  const n = Number(raw)
  return !Number.isFinite(n) || n < 5 || n > 10_080
}

export interface SettingsFormSnapshot {
  displayName: string
  tabLabel: string
  passion: string
  selectedAppearance: ThemeAppearance
  selectedPalette: ThemePalette
  selectedCustomThemes: CustomThemes
  selectedNavTabColors: NavTabColors
  animations: boolean
  reminderEnabled: boolean
  leadMinutes: number
  collegeTabEnabled: boolean
  overviewInsight: OverviewInsightMode
}

export function normalizeNavTabColors(colors: NavTabColors): NavTabColors {
  return Object.fromEntries(
    Object.entries(colors).filter(
      ([, value]) => typeof value === 'string' && value.trim().length > 0,
    ),
  )
}

export function normalizeCustomThemes(themes: CustomThemes): CustomThemes {
  const next: CustomThemes = {}
  for (const [key, theme] of Object.entries(themes)) {
    if (!theme || typeof theme !== 'object') continue
    next[key as keyof CustomThemes] = theme
  }
  return next
}

export function settingsFormDirty(
  form: SettingsFormSnapshot,
  saved: {
    displayName: string
    hobbyTabLabel: string
    hobbyPassion: string
    theme: ThemeAppearance
    themePalette: ThemePalette
    customThemes: CustomThemes
    navTabColors: NavTabColors
    animationsEnabled: boolean
    browserNotificationsEnabled: boolean
    reminderLeadMinutes: number
    collegeEnabled: boolean
    overviewInsightMode: OverviewInsightMode
  },
): boolean {
  return (
    form.displayName.trim() !== saved.displayName.trim() ||
    form.tabLabel.trim() !== saved.hobbyTabLabel ||
    form.passion.trim() !== saved.hobbyPassion.trim() ||
    form.selectedAppearance !== saved.theme ||
    form.selectedPalette !== saved.themePalette ||
    JSON.stringify(normalizeCustomThemes(form.selectedCustomThemes)) !==
      JSON.stringify(normalizeCustomThemes(saved.customThemes)) ||
    JSON.stringify(normalizeNavTabColors(form.selectedNavTabColors)) !==
      JSON.stringify(normalizeNavTabColors(saved.navTabColors)) ||
    form.animations !== saved.animationsEnabled ||
    form.reminderEnabled !== saved.browserNotificationsEnabled ||
    form.leadMinutes !== saved.reminderLeadMinutes ||
    form.collegeTabEnabled !== saved.collegeEnabled ||
    form.overviewInsight !== saved.overviewInsightMode
  )
}
