import { computeRegionalLoad, countSkillTaggedSessions } from './regionalLoad'
import { rollingWindowStartIso, todayIso, yesterdayIso } from '@lib/rollingWindow'

export const ACUTE_ROLLING_DAYS = 7
export const CHRONIC_ROLLING_DAYS = 28

export interface SessionLoadInput {
  session_date: string
  duration_min: number
  intensity: number
  energy_level: number
  /** @deprecated Legacy focus label — not used for regional load */
  focus?: string
  skills?: { slug: string; label: string }[]
  team_session?: boolean
}

export interface RunLoadInput {
  run_date: string
  minutes: number
}

/** Per-session load in arbitrary units (duration × relative intensity). */
export function sessionLoadUnits(durationMin: number, intensity: number): number {
  return durationMin * (intensity / 10)
}

/** Target weekly load for a moderate training week (~5×60 min @ RPE 7). */
export const TARGET_WEEKLY_LOAD = 350

export interface RecoveryBreakdown {
  acuteLoad: number
  chronicWeeklyLoad: number
  acwr: number
  /** False until there are 7+ logged training days in the rolling 28-day window. */
  acwrReady: boolean
  /** Calendar days from first logged activity through today (scales volume target for new users). */
  historyDaysAvailable: number
  /** Distinct training days in the rolling 7-day acute window. */
  trainingDaysLast7: number
  runMinutesLast7: number
  volumePoints: number
  intensityPoints: number
  acwrPenalty: number
  energyAdjustment: number
  freshnessBonus: number
  /** Distinct days with sessions/runs in the last 28 days. */
  trainingDaysLast28: number
  /** 0–1; low when history is sparse — dampens ACWR spike penalties. */
  sampleConfidence: number
}

export interface MuscleLoad {
  id: string
  label: string
  stress: number
  percent: number
  sessionTouches: number
  sources: string[]
  region: 'upper' | 'lower' | 'core' | 'full'
}

export interface RecoverySnapshot {
  workloadScore: number
  recoveryScore: number
  fatigueLevel: 'low' | 'moderate' | 'high' | 'very_high'
  sessionsLast7Days: number
  minutesLast7Days: number
  avgIntensityLast7Days: number
  avgEnergyLast7Days: number
  muscleGroups: MuscleLoad[]
  recommendations: string[]
  breakdown: RecoveryBreakdown
}

function sumSessionLoad(
  sessions: SessionLoadInput[],
  since: string,
  until: string = todayIso(),
): number {
  return sessions
    .filter((s) => s.session_date >= since && s.session_date <= until)
    .reduce((sum, s) => sum + sessionLoadUnits(s.duration_min, s.intensity), 0)
}

function sumRunMinutes(
  runs: RunLoadInput[],
  since: string,
  until: string = todayIso(),
): number {
  return runs
    .filter((r) => r.run_date >= since && r.run_date <= until)
    .reduce((sum, r) => sum + r.minutes, 0)
}

function distinctTrainingDays(
  sessions: SessionLoadInput[],
  runs: RunLoadInput[],
  since: string,
  until: string = todayIso(),
): Set<string> {
  const days = new Set<string>()
  for (const s of sessions) {
    if (s.session_date >= since && s.session_date <= until) days.add(s.session_date)
  }
  for (const r of runs) {
    if (r.run_date >= since && r.run_date <= until) days.add(r.run_date)
  }
  return days
}

/** Weeks spanned by logged activity (1–4), not always 4 — avoids ACWR spikes with few days of data. */
export function weeksRepresentedForChronicLoad(trainingDays: Set<string>): number {
  if (trainingDays.size === 0) return 1
  const sorted = [...trainingDays].sort()
  const first = new Date(`${sorted[0]}T12:00:00`)
  const last = new Date(`${sorted[sorted.length - 1]}T12:00:00`)
  const spanDays = Math.max(1, Math.round((last.getTime() - first.getTime()) / 86_400_000) + 1)
  return Math.min(4, Math.max(1, Math.ceil(spanDays / 7)))
}

/** Full confidence at ~2 weeks of logged training days in the 28-day window. */
export function sampleConfidenceFromTrainingDays(trainingDaysLast28: number): number {
  return Math.min(1, trainingDaysLast28 / 14)
}

/** Calendar days from first logged activity through today (inclusive). */
export function historyDaysAvailable(
  sessions: SessionLoadInput[],
  runs: RunLoadInput[],
): number {
  const allDays = distinctTrainingDays(sessions, runs, '1970-01-01')
  if (allDays.size === 0) return 0
  const sorted = [...allDays].sort()
  const first = new Date(`${sorted[0]}T12:00:00`)
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return Math.max(1, Math.round((today.getTime() - first.getTime()) / 86_400_000) + 1)
}

export function acwrIsReady(trainingDaysInChronicWindow: number): boolean {
  return trainingDaysInChronicWindow >= ACUTE_ROLLING_DAYS
}

/** Weekly load target scaled while the user has less than 7 days of logging history. */
export function targetLoadForAcutePeriod(historyDays: number): number {
  const comparableDays = Math.min(ACUTE_ROLLING_DAYS, Math.max(historyDays, 1))
  return TARGET_WEEKLY_LOAD * (comparableDays / ACUTE_ROLLING_DAYS)
}

function runLoadUnits(minutes: number): number {
  return minutes * 0.7
}

export function analyzeRecovery(
  sessions: SessionLoadInput[],
  runs: RunLoadInput[] = [],
): RecoverySnapshot {
  const since7 = rollingWindowStartIso(ACUTE_ROLLING_DAYS)
  const since28 = rollingWindowStartIso(CHRONIC_ROLLING_DAYS)
  const recent = sessions.filter(
    (s) => s.session_date >= since7 && s.session_date <= todayIso(),
  )
  const sessionsLast7Days = recent.length
  const trainingDaysInAcuteWindow = distinctTrainingDays(sessions, runs, since7)
  const trainingDaysLast7 = trainingDaysInAcuteWindow.size
  const historyDays = historyDaysAvailable(sessions, runs)
  const trainingDaysLast28 = distinctTrainingDays(sessions, runs, since28)
  const acwrReady = acwrIsReady(trainingDaysLast28.size)
  const runMinutesLast7 = sumRunMinutes(runs, since7)
  const minutesLast7Days = recent.reduce((s, x) => s + x.duration_min, 0) + runMinutesLast7
  const avgIntensityLast7Days =
    recent.length > 0
      ? Math.round((recent.reduce((s, x) => s + x.intensity, 0) / recent.length) * 10) / 10
      : 0
  const avgEnergyLast7Days =
    recent.length > 0
      ? Math.round((recent.reduce((s, x) => s + x.energy_level, 0) / recent.length) * 10) / 10
      : 0

  const acuteLoad = sumSessionLoad(recent, since7) + runLoadUnits(runMinutesLast7)
  const load28 =
    sumSessionLoad(sessions, since28) + runLoadUnits(sumRunMinutes(runs, since28))
  const sampleConfidence = sampleConfidenceFromTrainingDays(trainingDaysLast28.size)
  const weeksRepresented = weeksRepresentedForChronicLoad(trainingDaysLast28)
  const chronicWeeklyLoad = Math.round((load28 / weeksRepresented) * 10) / 10
  const acwr =
    acwrReady && chronicWeeklyLoad > 0
      ? Math.round((acuteLoad / chronicWeeklyLoad) * 100) / 100
      : 1

  const targetForAcutePeriod = targetLoadForAcutePeriod(historyDays)
  const volumePoints = Math.min(55, Math.round((acuteLoad / targetForAcutePeriod) * 55))
  const intensityPoints = Math.min(25, Math.round(avgIntensityLast7Days * 2.5))
  let rawAcwrPenalty = 0
  if (acwrReady && acwr > 1.5) rawAcwrPenalty = Math.min(20, Math.round((acwr - 1.5) * 40))
  else if (acwrReady && acwr > 1.3) rawAcwrPenalty = Math.min(10, Math.round((acwr - 1.3) * 50))
  const acwrPenalty = acwrReady ? Math.round(rawAcwrPenalty * sampleConfidence) : 0

  const workloadScore = Math.min(100, volumePoints + intensityPoints + acwrPenalty)

  const energyAdjustment =
    recent.length > 0 ? Math.round((avgEnergyLast7Days - 3) * 4) : 8

  const yday = yesterdayIso()
  const trainedYesterday =
    recent.some((s) => s.session_date === yday) || runs.some((r) => r.run_date === yday)
  const freshnessBonus =
    sessionsLast7Days > 0 && !trainedYesterday ? 10 : sessionsLast7Days === 0 ? 12 : 0

  const recoveryScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(100 - workloadScore * 0.82 + energyAdjustment + freshnessBonus),
    ),
  )

  const acwrCountsForFatigue = acwrReady && sampleConfidence >= 0.5
  let fatigueLevel: RecoverySnapshot['fatigueLevel'] = 'low'
  if (workloadScore >= 75 || (acwrCountsForFatigue && acwr > 1.6)) fatigueLevel = 'very_high'
  else if (workloadScore >= 55 || (acwrCountsForFatigue && acwr > 1.4)) fatigueLevel = 'high'
  else if (workloadScore >= 35 || (acwrCountsForFatigue && acwr > 1.25)) fatigueLevel = 'moderate'

  const regionalEntries = computeRegionalLoad(sessions, runMinutesLast7, since7)
  const skillTaggedSessions = countSkillTaggedSessions(sessions, since7)
  const muscleGroups: MuscleLoad[] = regionalEntries.map((entry) => ({
    id: entry.id,
    label: entry.label,
    stress: entry.load,
    percent: entry.percent,
    sessionTouches: entry.sessionTouches,
    sources: entry.sources,
    region: entry.region,
  }))

  const breakdown: RecoveryBreakdown = {
    acuteLoad: Math.round(acuteLoad),
    chronicWeeklyLoad,
    acwr,
    acwrReady,
    historyDaysAvailable: historyDays,
    trainingDaysLast7,
    runMinutesLast7,
    volumePoints,
    intensityPoints,
    acwrPenalty,
    energyAdjustment,
    freshnessBonus,
    trainingDaysLast28: trainingDaysLast28.size,
    sampleConfidence,
  }

  const recommendations: string[] = []
  if (!acwrReady && trainingDaysLast28.size > 0) {
    const daysLeft = ACUTE_ROLLING_DAYS - trainingDaysLast28.size
    if (daysLeft > 0) {
      recommendations.push(
        `ACWR needs ${ACUTE_ROLLING_DAYS} logged training days in the last ${CHRONIC_ROLLING_DAYS} days — ${daysLeft} more to go.`,
      )
    }
    if (historyDays < ACUTE_ROLLING_DAYS) {
      recommendations.push(
        `Volume target scaled to your first ${historyDays} day${historyDays === 1 ? '' : 's'} of logging.`,
      )
    }
  } else if (sampleConfidence < 0.5) {
    recommendations.push(
      'Limited training history logged — workload estimates will stabilize as you add more sessions (prior rest is not penalized).',
    )
  }
  if (fatigueLevel === 'very_high' || fatigueLevel === 'high') {
    recommendations.push(
      'High workload in the last 7 days — consider a lighter day or active recovery.',
    )
    recommendations.push('Prioritize sleep, hydration, and easy mobility.')
  } else if (sessionsLast7Days === 0 && runMinutesLast7 === 0) {
    recommendations.push(
      'No sessions logged in the last 7 days — a short skill or mobility block can restart momentum.',
    )
  } else {
    recommendations.push('Workload looks manageable — maintain consistency and log how you feel.')
  }

  if (acwrReady && acwr > 1.5 && sampleConfidence >= 0.5) {
    recommendations.push(
      `Acute:chronic ratio is ${acwr.toFixed(2)} (spike) — ease volume before adding intensity.`,
    )
  } else if (acwrReady && acwr < 0.8 && sessionsLast7Days > 0 && sampleConfidence >= 0.5) {
    recommendations.push(
      'Training load dropped vs your recent 28-day average — room to build back gradually.',
    )
  }

  const topMuscle = muscleGroups[0]
  if (topMuscle && topMuscle.percent >= 45 && skillTaggedSessions > 0) {
    const from = topMuscle.sources.slice(0, 2).join(', ')
    recommendations.push(
      `Load skewed toward ${topMuscle.label}${from ? ` (${from})` : ''} — rotate skills or add mobility.`,
    )
  } else if (sessionsLast7Days > 0 && skillTaggedSessions === 0 && runMinutesLast7 === 0) {
    recommendations.push('Check skills when logging sessions — regional load uses your skill checklist, not guesses.')
  }

  if (avgIntensityLast7Days >= 8 && sessionsLast7Days >= 4) {
    recommendations.push('High intensity frequency — mix in a lower-RPE session soon.')
  }

  if (avgEnergyLast7Days <= 2 && sessionsLast7Days >= 3) {
    recommendations.push('Logged energy is low — extra rest or lighter sessions may help readiness.')
  }

  return {
    workloadScore,
    recoveryScore,
    fatigueLevel,
    sessionsLast7Days,
    minutesLast7Days,
    avgIntensityLast7Days,
    avgEnergyLast7Days,
    muscleGroups,
    recommendations,
    breakdown,
  }
}

export function fatigueLabel(level: RecoverySnapshot['fatigueLevel']): string {
  switch (level) {
    case 'very_high':
      return 'Very high'
    case 'high':
      return 'High'
    case 'moderate':
      return 'Moderate'
    default:
      return 'Low'
  }
}
