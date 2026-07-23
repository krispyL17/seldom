import { useMemo } from 'react'
import { useUserPreferences } from '@features/preferences'
import { SIDEBAR_NAV, type NavItemConfig } from '@config/navigation'

/** Sidebar nav with user-customized hobby tab label */
export function useSidebarNav(): NavItemConfig[] {
  const { hobbyTabLabel } = useUserPreferences()

  return useMemo(
    () =>
      SIDEBAR_NAV.map((item) =>
        item.id === 'soccer' ? { ...item, label: hobbyTabLabel } : item,
      ),
    [hobbyTabLabel],
  )
}
