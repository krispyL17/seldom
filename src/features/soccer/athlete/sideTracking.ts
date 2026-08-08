import type { SidePreference } from './types'

const FOOT_SPORTS = ['soccer', 'football', 'futsal', 'rugby', 'hockey']
const HAND_SPORTS = ['basketball', 'tennis', 'baseball', 'softball', 'volleyball', 'lacrosse']

export function sportUsesSideTracking(passion: string): boolean {
  const p = passion.toLowerCase()
  return FOOT_SPORTS.some((s) => p.includes(s)) || HAND_SPORTS.some((s) => p.includes(s))
}

export function sportUsesFeet(passion: string): boolean {
  return FOOT_SPORTS.some((s) => passion.toLowerCase().includes(s))
}

export function sportUsesHands(passion: string): boolean {
  return HAND_SPORTS.some((s) => passion.toLowerCase().includes(s))
}

export function inferWeakSide(dominant: SidePreference): SidePreference {
  if (dominant === 'left') return 'right'
  if (dominant === 'right') return 'left'
  return 'unknown'
}

export function dominantSideLabel(side: SidePreference): string {
  switch (side) {
    case 'left':
      return 'Left'
    case 'right':
      return 'Right'
    case 'both':
      return 'Both'
    default:
      return 'Not set'
  }
}

export interface SideBalancePoint {
  date: string
  dominant_pct: number
  weak_pct: number
}

export function aggregateSideBalanceHistory(
  sessions: { session_date: string; side_balance: { dominant_pct: number; weak_pct: number } | null }[],
): SideBalancePoint[] {
  return sessions
    .filter((s) => s.side_balance != null)
    .map((s) => ({
      date: s.session_date,
      dominant_pct: s.side_balance!.dominant_pct,
      weak_pct: s.side_balance!.weak_pct,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function averageWeakSidePct(points: SideBalancePoint[]): number | null {
  if (points.length === 0) return null
  return Math.round((points.reduce((s, p) => s + p.weak_pct, 0) / points.length) * 10) / 10
}
