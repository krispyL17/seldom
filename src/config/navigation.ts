import type { ComponentType, SVGProps } from 'react'
import {
  IconAnalytics,
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

/** Core hubs — always in sidebar / mobile drawer (Junior Prep gated by preference). */
export const PRIMARY_SIDEBAR_NAV: NavItemConfig[] = [
  { id: 'home', label: 'Today', href: '/', icon: IconHome },
  { id: 'tasks', label: 'Tasks', href: '/tasks', icon: IconTasks },
  { id: 'goals', label: 'Goals', href: '/goals', icon: IconGoals },
  { id: 'soccer', label: 'Performance', href: '/soccer/overview', icon: IconSoccer },
  { id: 'college', label: 'Junior Prep', href: '/college', icon: IconCollege },
  { id: 'journal', label: 'Journal', href: '/journal', icon: IconJournal },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: IconAnalytics },
]

/** Utilities — profile menu + search, not in sidebar. */
export const UTILITY_NAV: NavItemConfig[] = [
  { id: 'assistant', label: 'Seldom AI', href: '/assistant', icon: IconSparkles },
  { id: 'settings', label: 'Settings', href: '/settings', icon: IconSettings },
]

/** @deprecated Use PRIMARY_SIDEBAR_NAV — kept for theme tab color ids. */
export const SIDEBAR_NAV: NavItemConfig[] = [...PRIMARY_SIDEBAR_NAV, ...UTILITY_NAV]

/** Includes retired tabs (calendar) still used for accent colors. */
export const ALL_NAV_TAB_IDS = [...SIDEBAR_NAV.map((item) => item.id), 'calendar']

import { getSoccerPageTitle } from '@features/soccer/utils'
import { getCollegePageTitle } from '@features/college/collegeNav'

const PAGE_TITLE_NAV = [...PRIMARY_SIDEBAR_NAV, ...UTILITY_NAV]

/** Lookup page title from pathname for the mobile header */
export function getPageTitle(
  pathname: string,
  hobbyTabLabel = 'Performance',
  hobbyPassion = '',
): string {
  if (pathname === '/') return 'Today'

  if (pathname === '/college' || pathname.startsWith('/college/')) {
    return getCollegePageTitle(pathname)
  }

  if (pathname === '/soccer' || pathname.startsWith('/soccer/')) {
    if (pathname === '/soccer' || pathname === '/soccer/overview') {
      return hobbyTabLabel
    }
    return getSoccerPageTitle(pathname, hobbyPassion)
  }

  const exact = PAGE_TITLE_NAV.find((nav) => nav.href === pathname)
  if (exact) {
    return exact.id === 'soccer' ? hobbyTabLabel : exact.label
  }

  const nested = PAGE_TITLE_NAV.find(
    (nav) => nav.href !== '/' && pathname.startsWith(`${nav.href}/`),
  )
  if (nested?.id === 'soccer') return hobbyTabLabel
  return nested?.label ?? 'Seldom'
}

/** Map route pathname to sidebar nav tab id for accent scoping. */
export function getNavTabIdFromPath(pathname: string): string | null {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/college')) return 'college'
  if (pathname.startsWith('/soccer')) return 'soccer'

  const all = [...PRIMARY_SIDEBAR_NAV, ...UTILITY_NAV]
  const exact = all.find((item) => item.href === pathname)
  if (exact) return exact.id

  const nested = all.find(
    (item) => item.href !== '/' && pathname.startsWith(`${item.href}/`),
  )
  return nested?.id ?? null
}
