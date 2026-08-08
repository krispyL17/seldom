import { MILE_M } from './types'
import type { RunLog } from './types'

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

export function parseDurationInput(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  if (trimmed.includes(':')) {
    const parts = trimmed.split(':').map((p) => Number(p))
    if (parts.some((p) => Number.isNaN(p))) return null
    if (parts.length === 2) {
      return parts[0]! * 60 + parts[1]!
    }
    if (parts.length === 3) {
      return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!
    }
    return null
  }

  const minutes = Number(trimmed)
  if (Number.isNaN(minutes) || minutes <= 0) return null
  return Math.round(minutes * 60)
}

/** Pace per mile (mm:ss) */
export function pacePerMile(durationSec: number, distanceM: number): string {
  if (distanceM <= 0) return '—'
  const secPerMile = (durationSec / distanceM) * MILE_M
  return `${formatDuration(Math.round(secPerMile))}/mi`
}

export function sortRunsChronologically(runs: RunLog[]): RunLog[] {
  return [...runs].sort((a, b) => {
    const dateCmp = b.run_date.localeCompare(a.run_date)
    if (dateCmp !== 0) return dateCmp
    return b.created_at.localeCompare(a.created_at)
  })
}

export const MILE_DISTANCE_TOLERANCE = 0.02

export type MileRunPerformanceTag = 'pr' | 'above_avg' | 'below_avg'

export function isMileRun(run: RunLog, tolerance = MILE_DISTANCE_TOLERANCE): boolean {
  return Math.abs(run.distance_m - MILE_M) / MILE_M <= tolerance
}

export function filterMileRuns(runs: RunLog[], tolerance = MILE_DISTANCE_TOLERANCE): RunLog[] {
  return runs.filter((run) => isMileRun(run, tolerance))
}

export function averageMileDurationSec(mileRuns: RunLog[], excludeId?: string): number | null {
  const pool = excludeId ? mileRuns.filter((run) => run.id !== excludeId) : mileRuns
  if (pool.length === 0) return null
  return Math.round(pool.reduce((sum, run) => sum + run.duration_sec, 0) / pool.length)
}

/** Faster mile times are better — PR beats above/below avg tags. */
export function getMileRunPerformanceTag(run: RunLog, allRuns: RunLog[]): MileRunPerformanceTag | null {
  if (!isMileRun(run)) return null

  const mileRuns = filterMileRuns(allRuns)
  if (mileRuns.length === 0) return null

  const bestDuration = Math.min(...mileRuns.map((entry) => entry.duration_sec))
  if (run.duration_sec === bestDuration) return 'pr'

  const avg = averageMileDurationSec(mileRuns, run.id)
  if (avg === null) return 'pr'
  if (run.duration_sec < avg) return 'above_avg'
  if (run.duration_sec > avg) return 'below_avg'
  return null
}

export function bestRunForDistance(runs: RunLog[], distanceM: number, tolerance = 0.02): RunLog | null {
  const matches = runs.filter(
    (r) => Math.abs(r.distance_m - distanceM) / distanceM <= tolerance,
  )
  if (matches.length === 0) return null
  return matches.reduce((best, r) => (r.duration_sec < best.duration_sec ? r : best))
}

export function formatRunDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function metersToDisplay(m: number): string {
  if (Math.abs(m - MILE_M) < 1) return '1 mile'
  if (Math.abs(m - 5000) < 1) return '5K'
  if (m >= MILE_M) {
    const miles = m / MILE_M
    return `${Math.round(miles * 10) / 10} mi`
  }
  return `${Math.round(m)} m`
}

export function durationInputFromSeconds(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
