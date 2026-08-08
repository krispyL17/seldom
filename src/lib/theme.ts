import {
  defaultNavTabColors,
  resolveThemeTokens,
} from '@config/themePalettes'
import type { CustomThemes, CustomThemeId, NavTabColors, ThemeAppearance, ThemePalette } from '@/types/userPreferences'
import { isCustomThemePalette } from '@/types/userPreferences'

export interface ApplyThemeOptions {
  palette: ThemePalette
  appearance: ThemeAppearance
  animationsEnabled: boolean
  navTabColors?: NavTabColors
  navIds?: readonly string[]
  customThemes?: CustomThemes
}

/** @deprecated Use ApplyThemeOptions — kept for gradual migration */
export type LegacyAppTheme = ThemeAppearance

export function applyThemeToDocument(options: ApplyThemeOptions): void
export function applyThemeToDocument(appearance: ThemeAppearance, animationsEnabled: boolean): void
export function applyThemeToDocument(
  appearanceOrOptions: ApplyThemeOptions | ThemeAppearance,
  animationsEnabled?: boolean,
): void {
  const options: ApplyThemeOptions =
    typeof appearanceOrOptions === 'object'
      ? appearanceOrOptions
      : {
          palette: 'classic',
          appearance: appearanceOrOptions,
          animationsEnabled: animationsEnabled ?? true,
        }

  const root = document.documentElement
  const { mode, tokens } = resolveThemeTokens(
    options.palette,
    options.appearance,
    options.customThemes ?? {},
  )

  root.dataset.theme = mode
  root.dataset.palette = options.palette
  root.classList.toggle('animations-disabled', !options.animationsEnabled)
  root.style.colorScheme = mode

  for (const [key, value] of Object.entries(tokens)) {
    if (value != null) root.style.setProperty(key, value)
  }

  if (options.palette === 'classic') {
    root.style.removeProperty('--color-surface-base-gradient')
  }

  const navIds = options.navIds ?? []
  const customThemes = options.customThemes ?? {}
  const slotBookmarks =
    isCustomThemePalette(options.palette) && options.palette in customThemes
      ? customThemes[options.palette as CustomThemeId]?.navTabColors
      : undefined
  const bookmarkOverrides =
    slotBookmarks && Object.keys(slotBookmarks).length > 0 ? slotBookmarks : (options.navTabColors ?? {})
  const resolvedColors =
    Object.keys(bookmarkOverrides).length > 0 || isCustomThemePalette(options.palette)
      ? { ...defaultNavTabColors(options.palette, navIds, customThemes), ...bookmarkOverrides }
      : defaultNavTabColors(options.palette, navIds, customThemes)

  for (const id of navIds) {
    root.style.setProperty(`--nav-tab-${id}`, resolvedColors[id] ?? '')
  }
}

export function applyThemeFromPreferences(
  palette: ThemePalette,
  appearance: ThemeAppearance,
  animationsEnabled: boolean,
  navTabColors: NavTabColors,
  navIds: readonly string[],
  customThemes: CustomThemes = {},
): void {
  applyThemeToDocument({
    palette,
    appearance,
    animationsEnabled,
    navTabColors,
    navIds,
    customThemes,
  })
}
