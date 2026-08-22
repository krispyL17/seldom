import { useMemo, type CSSProperties } from 'react'
import { useLocation } from 'react-router-dom'
import { ALL_NAV_TAB_IDS, getNavTabIdFromPath } from '@config/navigation'
import {
  bookmarkAccentScopeVars,
  resolveNavTabColor,
  resolveThemeMode,
  shouldScopeTabAccent,
} from '@config/themePalettes'
import { useUserPreferences } from '@features/preferences'

/**
 * When the active tab's bookmark color differs from Today (or Today is customized),
 * remap accent and panel ledger tokens for everything rendered in the main content area.
 */
export function useTabAccentScopeStyle(): CSSProperties | undefined {
  const { pathname } = useLocation()
  const { theme, themePalette, navTabColors, customThemes, preferences } = useUserPreferences()

  return useMemo(() => {
    if (!preferences) return undefined

    const navId = getNavTabIdFromPath(pathname)
    if (!navId) return undefined

    const homeColor = resolveNavTabColor(
      'home',
      themePalette,
      ALL_NAV_TAB_IDS,
      navTabColors,
      customThemes,
    )
    const defaultHomeColor = resolveNavTabColor(
      'home',
      themePalette,
      ALL_NAV_TAB_IDS,
      {},
      customThemes,
    )
    const tabColor = resolveNavTabColor(
      navId,
      themePalette,
      ALL_NAV_TAB_IDS,
      navTabColors,
      customThemes,
    )

    if (!shouldScopeTabAccent(navId, tabColor, homeColor, defaultHomeColor)) {
      return undefined
    }

    const mode = resolveThemeMode(theme)
    return bookmarkAccentScopeVars(tabColor, mode) as CSSProperties
  }, [pathname, preferences, theme, themePalette, navTabColors, customThemes])
}
