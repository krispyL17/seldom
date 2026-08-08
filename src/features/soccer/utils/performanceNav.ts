import { SOCCER_NAV, type SoccerNavId } from '../types'
import type { CustomPerformanceTab } from '../athlete/types'

const HIDDEN_TABS = new Set<SoccerNavId>([
  'physical',
  'weaknesses',
  'strengths',
  'coach',
  'technical',
  'progress',
  'training',
  'stats',
  'matches',
])

const GENERIC_LABELS: Partial<Record<SoccerNavId, string>> = {
  overview: 'Overview',
  training: 'Sessions',
  running: 'Cardio',
  matches: 'Games',
  stats: 'Stats',
}

export interface PerformanceNavItem {
  id: string
  label: string
  href: string
}

export function getPerformanceNav(
  _hobbyPassion = '',
  customTabs: CustomPerformanceTab[] = [],
  injuryModeActive = false,
  gymEnabled = false,
): PerformanceNavItem[] {
  const base = SOCCER_NAV.filter((item) => !HIDDEN_TABS.has(item.id)).map((item) => {
    const label = GENERIC_LABELS[item.id] ?? item.label
    return {
      id: item.id,
      label: label === item.label ? item.label : label,
      href: item.href,
    }
  })

  const gymTab: PerformanceNavItem[] = gymEnabled
    ? [{ id: 'gym', label: 'Gym', href: '/soccer/gym' }]
    : []

  const extended: PerformanceNavItem[] = [
    { id: 'progression', label: 'Progression', href: '/soccer/progression' },
    {
      id: 'recovery',
      label: injuryModeActive ? 'Recovery' : 'Recovery',
      href: '/soccer/recovery',
    },
    { id: 'preferences', label: 'Tab preferences', href: '/soccer/preferences' },
  ]

  const sportTabs = customTabs.slice(0, 4).map((tab) => ({
    id: tab.id,
    label: tab.label,
    href: `/soccer/tab/${tab.slug}`,
  }))

  return [...base, ...gymTab, ...extended, ...sportTabs]
}

export function getPerformancePageTitle(
  pathname: string,
  customTabs: CustomPerformanceTab[] = [],
): string {
  const parts = pathname.split('/').filter(Boolean)
  const segment = parts[parts.length - 1] ?? 'overview'

  if (parts.includes('tab') && segment) {
    const tab = customTabs.find((t) => t.slug === segment)
    if (tab) return tab.label
  }

  if (segment === 'progression') return 'Progression'
  if (segment === 'recovery') return 'Recovery'
  if (segment === 'gym') return 'Gym'
  if (segment === 'preferences') return 'Tab preferences'
  if (segment === 'knowledge') return 'Import Knowledge'
  if (segment === 'training') return 'Overview'
  if (segment === 'stats') return 'Progression'
  if (segment === 'matches') return 'Overview'

  const nav = getPerformanceNav()
  const match = nav.find((n) => n.href.endsWith(`/${segment}`))
  if (match) return match.label
  return 'Performance'
}
