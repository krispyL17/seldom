import { SOCCER_NAV, type SoccerNavId } from '../types'

/** Sub-tabs trimmed for a focused performance workspace. */
const HIDDEN_TABS = new Set<SoccerNavId>([
  'overview',
  'matches',
  'technical',
  'physical',
  'weaknesses',
  'strengths',
  'coach',
  'progress',
])

const GENERIC_LABELS: Partial<Record<SoccerNavId, string>> = {
  training: 'Sessions',
  running: 'Cardio',
}

/** Sub-nav items for the performance tab — passion-agnostic labels. */
export function getPerformanceNav(_hobbyPassion = '') {
  return SOCCER_NAV.filter((item) => !HIDDEN_TABS.has(item.id)).map((item) => {
    const label = GENERIC_LABELS[item.id] ?? item.label
    return label === item.label ? item : { ...item, label }
  })
}

export function getPerformancePageTitle(pathname: string, _hobbyPassion = ''): string {
  const segment = (pathname.split('/').pop() ?? 'training') as SoccerNavId
  const nav = getPerformanceNav()
  const match = nav.find((n) => n.id === segment)
  if (match) {
    if (match.id === 'training') return 'Practice Sessions'
    return match.label
  }
  return 'Performance'
}
