import { useMemo } from 'react'
import { resolveNavTabColor } from '@config/themePalettes'
import { useSidebarNav } from '@hooks/useSidebarNav'
import { useUserPreferences } from '@features/preferences'
import type { NavTabColors, ThemePalette } from '@/types/userPreferences'

export function useNavTabColorMap(): Record<string, string> {
  const navItems = useSidebarNav()
  const { themePalette, navTabColors } = useUserPreferences()
  const navIds = useMemo(() => navItems.map((item) => item.id), [navItems])

  return useMemo(
    () =>
      Object.fromEntries(
        navIds.map((id) => [id, resolveNavTabColor(id, themePalette, navIds, navTabColors)]),
      ),
    [navIds, themePalette, navTabColors],
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
): Record<string, string> {
  return Object.fromEntries(
    navIds.map((id) => [id, resolveNavTabColor(id, palette, navIds, custom)]),
  )
}
