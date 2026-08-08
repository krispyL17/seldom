import { STREAK_MILESTONES, type StreakState } from './types'

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDays(iso: string, delta: number): string {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + delta)
  return isoDate(d)
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(`${b}T12:00:00`).getTime() - new Date(`${a}T12:00:00`).getTime()
  return Math.round(ms / 86_400_000)
}

function longestStreakRun(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0
  let longest = 1
  let run = 1
  for (let i = 1; i < sortedDates.length; i++) {
    if (daysBetween(sortedDates[i - 1]!, sortedDates[i]!) === 1) {
      run++
    } else {
      longest = Math.max(longest, run)
      run = 1
    }
  }
  return Math.max(longest, run)
}

function currentStreakFromToday(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0
  const set = new Set(sortedDates)
  const today = isoDate(new Date())
  let start = today
  if (!set.has(today)) {
    const yesterday = addDays(today, -1)
    if (!set.has(yesterday)) return 0
    start = yesterday
  }
  let count = 0
  let cursor = start
  while (set.has(cursor)) {
    count++
    cursor = addDays(cursor, -1)
  }
  return count
}

export interface StreakComputeInput {
  activityDates: string[]
  frozen: boolean
  frozenAtStreak: number | null
  previousLongest: number
  previousMilestones: number[]
}

export function computeStreak(input: StreakComputeInput): StreakState {
  const unique = [...new Set(input.activityDates)].filter(Boolean).sort()
  const lastActivityDate = unique.length > 0 ? unique[unique.length - 1]! : null
  let current = currentStreakFromToday(unique)
  const longestRun = longestStreakRun(unique)

  if (input.frozen && input.frozenAtStreak != null) {
    current = Math.max(current, input.frozenAtStreak)
  }

  const longest = Math.max(input.previousLongest, longestRun, current)
  const milestonesAchieved = [...input.previousMilestones]
  for (const m of STREAK_MILESTONES) {
    if (current >= m && !milestonesAchieved.includes(m)) {
      milestonesAchieved.push(m)
    }
  }
  milestonesAchieved.sort((a, b) => a - b)

  return {
    current,
    longest,
    lastActivityDate,
    frozen: input.frozen,
    frozenAtStreak: input.frozen ? (input.frozenAtStreak ?? current) : null,
    explained: false,
    milestonesAchieved,
  }
}

export function mergeStreakMeta(
  computed: StreakState,
  previous: StreakState,
): StreakState {
  return {
    ...computed,
    explained: previous.explained,
    milestonesAchieved: [
      ...new Set([...previous.milestonesAchieved, ...computed.milestonesAchieved]),
    ].sort((a, b) => a - b),
    longest: Math.max(computed.longest, previous.longest),
  }
}

export function streakMilestoneTier(current: number): number {
  let tier = 0
  for (const m of STREAK_MILESTONES) {
    if (current >= m) tier = m
  }
  return tier
}

export function nextStreakMilestone(current: number): number | null {
  return STREAK_MILESTONES.find((m) => m > current) ?? null
}

export function collectActivityDates(sources: {
  sessionDates: string[]
  runDates: string[]
  matchDates: string[]
}): string[] {
  return [...sources.sessionDates, ...sources.runDates, ...sources.matchDates]
}
