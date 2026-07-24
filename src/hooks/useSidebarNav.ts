import { useMemo } from 'react'
import { useUserPreferences } from '@features/preferences'
import { useAnalytics } from '@features/analytics'
import { analyticsHasEnoughData } from '@features/analytics/utils/unlock'
import { SIDEBAR_NAV, type NavItemConfig } from '@config/navigation'

/** Sidebar nav with user-customized labels and optional modules hidden until enabled. */
export function useSidebarNav(): NavItemConfig[] {
  const { hobbyTabLabel, collegeEnabled } = useUserPreferences()
  const { dashboard } = useAnalytics()
  const analyticsUnlocked = analyticsHasEnoughData(dashboard)

  return useMemo(
    () =>
      SIDEBAR_NAV.filter((item) => {
        if (item.id === 'college' && !collegeEnabled) return false
        if (item.id === 'analytics' && !analyticsUnlocked) return false
        return true
      }).map((item) => {
        if (item.id === 'soccer') return { ...item, label: hobbyTabLabel }
        return item
      }),
    [hobbyTabLabel, collegeEnabled, analyticsUnlocked],
  )
}
