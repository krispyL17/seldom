import type { ComponentType, SVGProps } from 'react'
import {
  IconAnalytics,
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
  { id: 'soccer', label: 'Soccer', href: '/soccer', icon: IconSoccer },
  { id: 'journal', label: 'Journal', href: '/journal', icon: IconJournal },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: IconAnalytics },
  { id: 'assistant', label: 'AI Assistant', href: '/assistant', icon: IconSparkles },
  { id: 'settings', label: 'Settings', href: '/settings', icon: IconSettings },
]

/** Lookup page title from pathname for the mobile header */
export function getPageTitle(pathname: string): string {
  const exact = SIDEBAR_NAV.find((nav) => nav.href === pathname)
  if (exact) return exact.label

  const nested = SIDEBAR_NAV.find(
    (nav) => nav.href !== '/' && pathname.startsWith(`${nav.href}/`),
  )
  return nested?.label ?? 'Seldom'
}
