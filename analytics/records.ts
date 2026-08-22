import type { PersonalRecord, StreakStat } from './types.js'
import { isoInWeek, lastNDays, lastNWeeks } from './timeBuckets.js'

export interface RecordsInput {
  runLogs: Array<{ run_date: string; distance_m: number; duration_sec: number }>
  matches: Array<{ match_date: string; opponent: string; rating: number | null }>
  trainingSessions: Array<{ session_date: string }>
  journalEntries: Array<{ entry_date: string }>
  journalConsistencyData: number[]
}

function formatPace(durationSec: number, distanceM: number): string {
  if (distanceM <= 0) return '—'
  const secPerMi = durationSec / (distanceM / 1609.34)
  const min = Math.floor(secPerMi / 60)
  const sec = Math.round(secPerMi % 60)
  return `${min}:${sec.toString().padStart(2, '0')}/mi`
}

function formatRunDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function isWithinDays(date: string, days: number): boolean {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return date >= cutoff.toISOString().slice(0, 10)
}

export function computePersonalRecords(input: RecordsInput): PersonalRecord[] {
  const records: PersonalRecord[] = []

  const mileRuns = input.runLogs.filter((r) => r.distance_m >= 1500 && r.distance_m <= 1800)
  if (mileRuns.length > 0) {
    const best = mileRuns.reduce((a, b) => (a.duration_sec < b.duration_sec ? a : b))
    records.push({
      id: 'mile-pr',
      label: 'Mile PR',
      value: formatPace(best.duration_sec, best.distance_m),
      detail: formatRunDate(best.run_date),
      isRecent: isWithinDays(best.run_date, 7),
    })
  }

  const ratedMatches = input.matches.filter((m) => m.rating != null)
  if (ratedMatches.length > 0) {
    const best = ratedMatches.reduce((a, b) => ((a.rating ?? 0) >= (b.rating ?? 0) ? a : b))
    records.push({
      id: 'match-rating',
      label: 'Best match',
      value: String(best.rating),
      detail: `vs ${best.opponent}`,
      isRecent: isWithinDays(best.match_date, 14),
    })
  }

  const weeks = lastNWeeks(4)
  const sessionCounts = weeks.map(({ start }) =>
    input.trainingSessions.filter((s) => isoInWeek(s.session_date, start)).length,
  )
  const maxSessions = Math.max(...sessionCounts, 0)
  if (maxSessions > 0) {
    records.push({
      id: 'training-week',
      label: 'Best training week',
      value: String(maxSessions),
      detail: `${maxSessions} sessions (last 4 wks)`,
    })
  }

  return records.slice(0, 4)
}

function countJournalStreak(data: number[]): number {
  let streak = 0
  for (let i = data.length - 1; i >= 0; i -= 1) {
    if (data[i] === 0) break
    streak += 1
  }
  return streak
}

function countTrainingWeekStreak(sessionDates: string[]): number {
  const weeks = lastNWeeks(8)
  let streak = 0
  for (let i = weeks.length - 1; i >= 0; i -= 1) {
    const { start } = weeks[i]!
    const hasSession = sessionDates.some((d) => isoInWeek(d, start))
    if (!hasSession) break
    streak += 1
  }
  return streak
}

export function computeStreaks(input: RecordsInput): StreakStat[] {
  const streaks: StreakStat[] = []

  const journalStreak = countJournalStreak(input.journalConsistencyData)
  if (journalStreak > 0) {
    streaks.push({ id: 'journal', label: 'Journal', count: journalStreak, unit: 'days' })
  }

  const trainingWeeks = countTrainingWeekStreak(input.trainingSessions.map((s) => s.session_date))
  if (trainingWeeks > 0) {
    streaks.push({
      id: 'training',
      label: 'Training logged',
      count: trainingWeeks,
      unit: trainingWeeks === 1 ? 'week' : 'weeks',
    })
  }

  const last14 = lastNDays(14)
  const loggingDays = last14.filter((day) =>
    input.journalEntries.some((e) => e.entry_date === day) ||
    input.trainingSessions.some((s) => s.session_date === day),
  ).length
  if (loggingDays >= 5) {
    streaks.push({ id: 'active', label: 'Active days', count: loggingDays, unit: 'of 14' })
  }

  return streaks.slice(0, 4)
}
