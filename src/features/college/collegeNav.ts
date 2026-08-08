/** Mobile header titles for college prep sub-routes */
const COLLEGE_PAGE_TITLES: Record<string, string> = {
  '/college': 'Overview',
  '/college/schools': 'Schools',
  '/college/deadlines': 'Deadlines',
  '/college/common-app': 'Common App',
  '/college/planning': 'Plan',
  '/college/advisor': 'AI Coach',
  '/college/timeline': 'Deadlines',
}

export function getCollegePageTitle(pathname: string): string {
  const normalized = pathname.replace(/\/$/, '') || '/college'
  if (/^\/college\/schools\/[^/]+$/.test(normalized)) return 'School'
  return COLLEGE_PAGE_TITLES[normalized] ?? 'Junior Prep'
}
