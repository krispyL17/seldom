/**
 * Maps current pathname to a tab intro config key.
 */
export function getTabIntroId(pathname: string): string | null {
  if (pathname === '/') return 'home'
  if (pathname === '/tasks') return 'tasks'
  if (pathname === '/goals') return 'goals'
  if (pathname === '/journal') return 'journal'
  if (pathname === '/calendar') return 'calendar'
  if (pathname === '/analytics') return 'analytics'
  if (pathname === '/assistant') return 'assistant'
  if (pathname === '/settings') return 'settings'

  if (pathname === '/college' || pathname === '/college/') return 'college'

  if (pathname.startsWith('/college/')) {
    const segment = pathname.split('/')[2]
    if (segment === 'activities') return 'college-activities'
    if (segment === 'common-app') return 'college-common-app'
    if (segment === 'timeline') return 'college-timeline'
    if (segment === 'schools') return 'college'
    return 'college'
  }

  if (pathname === '/soccer' || pathname === '/soccer/overview') return 'performance'

  if (pathname.startsWith('/soccer/')) {
    const segment = pathname.split('/')[2]
    if (!segment) return 'performance'
    return `soccer-${segment}`
  }

  return null
}
