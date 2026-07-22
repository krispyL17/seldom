import type { TrainingSession, TechnicalRatingKey, TechnicalRatings } from './types'
import { TECHNICAL_RATING_KEYS } from './types'

export function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatSessionDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortSessionDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function sortSessionsChronologically(sessions: TrainingSession[]): TrainingSession[] {
  return [...sessions].sort((a, b) => {
    const dateCompare = b.session_date.localeCompare(a.session_date)
    if (dateCompare !== 0) return dateCompare
    return b.created_at.localeCompare(a.created_at)
  })
}

export function sortSessionsForCharts(sessions: TrainingSession[]): TrainingSession[] {
  return [...sessions].sort((a, b) => a.session_date.localeCompare(b.session_date))
}

export function averageTechnicalRating(ratings: TechnicalRatings): number {
  const sum = TECHNICAL_RATING_KEYS.reduce((acc, key) => acc + ratings[key], 0)
  return Math.round((sum / TECHNICAL_RATING_KEYS.length) * 10) / 10
}

export function parseTechnicalRatings(raw: unknown): TechnicalRatings | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const result = {} as TechnicalRatings
  for (const key of TECHNICAL_RATING_KEYS) {
    const val = obj[key]
    if (typeof val !== 'number' || val < 1 || val > 10) return null
    result[key] = val
  }
  return result
}

export function getSkillTrend(
  sessions: TrainingSession[],
  key: TechnicalRatingKey,
): number[] {
  return sortSessionsForCharts(sessions).map((s) => s.technical_ratings[key])
}

export function intensityVariant(intensity: number): 'success' | 'accent' | 'warning' | 'danger' {
  if (intensity <= 4) return 'success'
  if (intensity <= 6) return 'accent'
  if (intensity <= 8) return 'warning'
  return 'danger'
}
