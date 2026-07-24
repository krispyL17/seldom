import type { ComponentType, SVGProps } from 'react'
import {
  IconAnalytics,
  IconCalendar,
  IconCollege,
  IconGoals,
  IconHome,
  IconJournal,
  IconSettings,
  IconSoccer,
  IconSparkles,
  IconTasks,
} from '@components/ui/icons'

/** Sidebar navigation item definition */
export interface NavItemConfig {
  id: string
  label: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

/**
 * Primary sidebar navigation — athlete command center modules.
 */
export const SIDEBAR_NAV: NavItemConfig[] = [
  { id: 'home', label: 'Home', href: '/', icon: IconHome },
  { id: 'tasks', label: 'Tasks', href: '/tasks', icon: IconTasks },
  { id: 'goals', label: 'Goals', href: '/goals', icon: IconGoals },
  { id: 'college', label: 'Junior Prep', href: '/college', icon: IconCollege },
  { id: 'soccer', label: 'Performance', href: '/soccer', icon: IconSoccer },
  { id: 'journal', label: 'Journal', href: '/journal', icon: IconJournal },
  { id: 'calendar', label: 'Calendar', href: '/calendar', icon: IconCalendar },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: IconAnalytics },
  { id: 'assistant', label: 'Seldom AI', href: '/assistant', icon: IconSparkles },
  { id: 'settings', label: 'Settings', href: '/settings', icon: IconSettings },
]

import { getSoccerPageTitle } from '@features/soccer/utils'

/** Lookup page title from pathname for the mobile header */
export function getPageTitle(
  pathname: string,
  hobbyTabLabel = 'Performance',
  hobbyPassion = '',
): string {
  if (pathname === '/soccer' || pathname.startsWith('/soccer/')) {
    if (pathname === '/soccer' || pathname === '/soccer/overview') {
      return hobbyTabLabel
    }
    return getSoccerPageTitle(pathname, hobbyPassion)
  }

  const exact = SIDEBAR_NAV.find((nav) => nav.href === pathname)
  if (exact) {
    return exact.id === 'soccer' ? hobbyTabLabel : exact.label
  }

  const nested = SIDEBAR_NAV.find(
    (nav) => nav.href !== '/' && pathname.startsWith(`${nav.href}/`),
  )
  if (nested?.id === 'soccer') return hobbyTabLabel
  return nested?.label ?? 'Seldom'
}
