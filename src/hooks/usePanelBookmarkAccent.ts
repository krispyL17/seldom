import { useMemo, type CSSProperties } from 'react'
import { ALL_NAV_TAB_IDS } from '@config/navigation'
import { bookmarkPanelAccents, resolveNavTabColor } from '@config/themePalettes'
import { useUserPreferences } from '@features/preferences'

/** CSS variables for panel ledger accents tinted from a nav bookmark color. */
export function usePanelBookmarkAccent(navId?: string): CSSProperties | undefined {
  const { themePalette, navTabColors, customThemes, preferences } = useUserPreferences()

  return useMemo(() => {
    if (!navId || !preferences) return undefined

    const bookmark = resolveNavTabColor(
      navId,
      themePalette,
      ALL_NAV_TAB_IDS,
      navTabColors,
      customThemes,
    )
    const accents = bookmarkPanelAccents(bookmark)

    return {
      '--panel-accent-rule': accents.rule,
      '--panel-accent-mark': accents.mark,
      '--panel-heading': accents.heading,
    } as CSSProperties
  }, [navId, themePalette, navTabColors, customThemes, preferences])
}
