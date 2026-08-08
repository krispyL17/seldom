import { useMemo } from 'react'
import { resolveNavTabColor } from '@config/themePalettes'
import { useSidebarNav } from '@hooks/useSidebarNav'
import { useUserPreferences } from '@features/preferences'
import type { NavTabColors, ThemePalette } from '@/types/userPreferences'

export function useNavTabColorMap(): Record<string, string> {
  const navItems = useSidebarNav()
  const { themePalette, navTabColors, customThemes, preferences } = useUserPreferences()
  const navIds = useMemo(() => navItems.map((item) => item.id), [navItems])

  return useMemo(
    () => {
      // Ensure we recalculate when any theme-related preference changes
      if (!preferences) return {}
      
      return Object.fromEntries(
        navIds.map((id) => [id, resolveNavTabColor(id, themePalette, navIds, navTabColors, customThemes)]),
      )
    },
    [navIds, themePalette, navTabColors, customThemes, preferences],
  )
}

export function useNavTabColor(navId: string): string {
  const map = useNavTabColorMap()
  return map[navId] ?? '#888888'
}

export function buildNavTabColorPreview(
  palette: ThemePalette,
  navIds: readonly string[],
  custom: NavTabColors,
  customThemes = {},
): Record<string, string> {
  return Object.fromEntries(
    navIds.map((id) => [id, resolveNavTabColor(id, palette, navIds, custom, customThemes)]),
  )
}
