import { useMemo } from 'react'
import { useUserPreferences } from '@features/preferences'
import { useCollegeNavLabel } from '@hooks/useCollegeNavLabel'
import { PRIMARY_SIDEBAR_NAV, type NavItemConfig } from '@config/navigation'

export function useSidebarNav(): NavItemConfig[] {
  const { hobbyTabLabel, collegeEnabled } = useUserPreferences()
  const collegeNavLabel = useCollegeNavLabel()

  return useMemo(
    () =>
      PRIMARY_SIDEBAR_NAV.filter((item) => {
        if (item.id === 'college' && !collegeEnabled) return false
        return true
      }).map((item) => {
        if (item.id === 'soccer') return { ...item, label: hobbyTabLabel }
        if (item.id === 'college') return { ...item, label: collegeNavLabel }
        return item
      }),
    [hobbyTabLabel, collegeEnabled, collegeNavLabel],
  )
}
