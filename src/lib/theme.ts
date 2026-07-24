import {
  defaultNavTabColors,
  resolveThemeTokens,
} from '@config/themePalettes'
import type { NavTabColors, ThemeAppearance, ThemePalette } from '@/types/userPreferences'

export interface ApplyThemeOptions {
  palette: ThemePalette
  appearance: ThemeAppearance
  animationsEnabled: boolean
  navTabColors?: NavTabColors
  navIds?: readonly string[]
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
  const { mode, tokens } = resolveThemeTokens(options.palette, options.appearance)

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
  const resolvedColors =
    Object.keys(options.navTabColors ?? {}).length > 0
      ? { ...defaultNavTabColors(options.palette, navIds), ...options.navTabColors }
      : defaultNavTabColors(options.palette, navIds)

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
): void {
  applyThemeToDocument({
    palette,
    appearance,
    animationsEnabled,
    navTabColors,
    navIds,
  })
}
