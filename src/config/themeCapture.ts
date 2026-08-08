import {
  defaultNavTabColors,
  paletteGradientStops,
} from '@config/themePalettes'
import type {
  CustomThemeDefinition,
  CustomThemeId,
  CustomThemes,
  NavTabColors,
  ThemePalette,
} from '@/types/userPreferences'
import { isCustomThemePalette } from '@/types/userPreferences'

/** Snapshot active palette + bookmark colors into a custom theme slot. */
export function captureThemeForCustomSlot(
  palette: ThemePalette,
  navTabColors: NavTabColors,
  navIds: readonly string[],
  customThemes: CustomThemes,
  slotId: CustomThemeId,
  slotName?: string,
): CustomThemeDefinition {
  let colors: [string, string, string]
  let bookmarks: NavTabColors

  if (isCustomThemePalette(palette)) {
    const existing = customThemes[palette]
    const stops = existing?.colors ?? paletteGradientStops('classic', customThemes)
    colors = [stops[0], stops[1] ?? stops[0], stops[2] ?? stops[1] ?? stops[0]]
    bookmarks =
      Object.keys(existing?.navTabColors ?? {}).length > 0
        ? { ...existing!.navTabColors! }
        : { ...navTabColors }
  } else {
    const stops = paletteGradientStops(palette, customThemes)
    colors = [stops[0], stops[1] ?? stops[0], stops[2] ?? stops[1] ?? stops[0]]
    const defaults = defaultNavTabColors(palette, navIds, customThemes)
    bookmarks = { ...defaults, ...navTabColors }
  }

  return {
    name: slotName ?? customThemes[slotId]?.name ?? 'Imported theme',
    colors,
    navTabColors: bookmarks,
  }
}

export function parsePastedCustomTheme(raw: string): CustomThemeDefinition | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  try {
    const parsed = JSON.parse(trimmed) as Partial<CustomThemeDefinition> & {
      colors?: unknown
      navTabColors?: unknown
      name?: unknown
    }
    if (!Array.isArray(parsed.colors) || parsed.colors.length < 3) return null
    const colors = parsed.colors.slice(0, 3).map(String) as [string, string, string]
    const navTabColors =
      parsed.navTabColors && typeof parsed.navTabColors === 'object'
        ? (parsed.navTabColors as NavTabColors)
        : undefined
    return {
      name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : 'Pasted theme',
      colors,
      navTabColors,
    }
  } catch {
    return null
  }
}
