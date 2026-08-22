import type {
  MatchRecord,
  SkillRating,
  TrainingSession,
} from './types'
import { getPerformancePageTitle } from './utils/performanceNav'

export function ratingVariant(value: number, max = 20): 'success' | 'accent' | 'warning' | 'danger' {
  const pct = (value / max) * 100
  if (pct >= 75) return 'success'
  if (pct >= 55) return 'accent'
  if (pct >= 40) return 'warning'
  return 'danger'
}

export function matchRatingVariant(rating: number): 'success' | 'accent' | 'warning' | 'danger' {
  if (rating >= 8) return 'success'
  if (rating >= 7) return 'accent'
  if (rating >= 6) return 'warning'
  return 'danger'
}

export function formatShortDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatFullDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function resultLabel(result: MatchRecord['result']): string {
  return result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'
}

export function resultVariant(result: MatchRecord['result']): 'success' | 'warning' | 'danger' {
  return result === 'W' ? 'success' : result === 'D' ? 'warning' : 'danger'
}

export function trendSymbol(trend?: SkillRating['trend'] | 'up' | 'down' | 'stable'): string {
  if (trend === 'up') return '↑'
  if (trend === 'down') return '↓'
  return '→'
}

export function avgTrainingRating(sessions: TrainingSession[]): number {
  if (sessions.length === 0) return 0
  const sum = sessions.reduce((acc, s) => acc + s.rating, 0)
  return Math.round((sum / sessions.length) * 10) / 10
}

export function avgMatchRating(matches: MatchRecord[]): number {
  if (matches.length === 0) return 0
  const sum = matches.reduce((acc, m) => acc + m.rating, 0)
  return Math.round((sum / matches.length) * 10) / 10
}

export function getSoccerPageTitle(pathname: string, _hobbyPassion = ''): string {
  return getPerformancePageTitle(pathname)
}

export { getPerformanceNav, getPerformancePageTitle } from './utils/performanceNav'
