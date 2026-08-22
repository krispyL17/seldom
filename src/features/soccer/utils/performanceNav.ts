export interface PerformanceNavItem {
  id: string
  label: string
  href: string
}

/** Performance sub-nav (Overview · Cardio · Skills · optional Gym · Recovery). */
export function getPerformanceNav(
  _hobbyPassion = '',
  _injuryModeActive = false,
  gymEnabled = false,
): PerformanceNavItem[] {
  const nav: PerformanceNavItem[] = [
    { id: 'overview', label: 'Overview', href: '/soccer/overview' },
    { id: 'running', label: 'Cardio', href: '/soccer/running' },
    { id: 'skills', label: 'Skills', href: '/soccer/skills' },
  ]

  if (gymEnabled) {
    nav.push({ id: 'gym', label: 'Gym', href: '/soccer/gym' })
  }

  nav.push({ id: 'recovery', label: 'Recovery', href: '/soccer/recovery' })

  return nav
}

export function getPerformancePageTitle(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean)
  const segment = parts[parts.length - 1] ?? 'overview'

  if (segment === 'skills' || segment === 'progression' || segment === 'stats') return 'Skills'
  if (segment === 'recovery') return 'Recovery'
  if (segment === 'running') return 'Cardio'
  if (segment === 'gym') return 'Gym'
  if (segment === 'knowledge') return 'Import Knowledge'
  if (segment === 'overview' || segment === 'soccer') return 'Overview'

  const nav = getPerformanceNav()
  const match = nav.find((n) => n.href.endsWith(`/${segment}`))
  if (match) return match.label
  return 'Performance'
}
