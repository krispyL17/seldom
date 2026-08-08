export interface SessionLoadInput {
  session_date: string
  duration_min: number
  intensity: number
  energy_level: number
  focus: string
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
  runMinutesLast7: number
  volumePoints: number
  intensityPoints: number
  acwrPenalty: number
  energyAdjustment: number
  freshnessBonus: number
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

export interface MuscleLoad {
  id: string
  label: string
  stress: number
  region: 'upper' | 'lower' | 'core' | 'full'
}

const FOCUS_MUSCLES: Record<string, string[]> = {
  sprint: ['quads', 'hamstrings', 'calves'],
  speed: ['quads', 'hamstrings', 'calves'],
  shoot: ['quads', 'core', 'hip_flexors'],
  pass: ['hip_flexors', 'core', 'calves'],
  dribbl: ['hip_flexors', 'ankles', 'core'],
  run: ['quads', 'hamstrings', 'calves', 'hip_flexors'],
  cardio: ['quads', 'hamstrings', 'calves'],
  strength: ['core', 'quads', 'hamstrings', 'upper_back'],
  mobility: ['hip_flexors', 'hamstrings', 'calves'],
}

const MUSCLE_LABELS: Record<string, { label: string; region: MuscleLoad['region'] }> = {
  quads: { label: 'Quads', region: 'lower' },
  hamstrings: { label: 'Hamstrings', region: 'lower' },
  calves: { label: 'Calves', region: 'lower' },
  hip_flexors: { label: 'Hip flexors', region: 'lower' },
  core: { label: 'Core', region: 'core' },
  ankles: { label: 'Ankles', region: 'lower' },
  upper_back: { label: 'Upper back', region: 'upper' },
}

function daysAgoIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

function yesterdayIso(): string {
  return daysAgoIso(1)
}

function focusTextForMuscles(focus: string): string {
  const trimmed = focus.trim()
  const tabIdx = trimmed.indexOf(':')
  if (trimmed.startsWith('seldom-tab:') && tabIdx >= 0) {
    return trimmed.slice(tabIdx + 1).replace(/^custom:/, '').replace(/-/g, ' ')
  }
  return trimmed
}

function inferMuscles(focus: string): string[] {
  const lower = focusTextForMuscles(focus).toLowerCase()
  const found = new Set<string>()
  for (const [key, muscles] of Object.entries(FOCUS_MUSCLES)) {
    if (lower.includes(key)) muscles.forEach((m) => found.add(m))
  }
  if (found.size === 0) return ['quads', 'hamstrings', 'core']
  return [...found]
}

function sumSessionLoad(sessions: SessionLoadInput[], since: string): number {
  return sessions
    .filter((s) => s.session_date >= since)
    .reduce((sum, s) => sum + sessionLoadUnits(s.duration_min, s.intensity), 0)
}

function sumRunMinutes(runs: RunLoadInput[], since: string): number {
  return runs.filter((r) => r.run_date >= since).reduce((sum, r) => sum + r.minutes, 0)
}

function runLoadUnits(minutes: number): number {
  return minutes * 0.7
}

export function analyzeRecovery(
  sessions: SessionLoadInput[],
  runs: RunLoadInput[] = [],
): RecoverySnapshot {
  const since7 = daysAgoIso(7)
  const since28 = daysAgoIso(28)
  const recent = sessions.filter((s) => s.session_date >= since7)
  const sessionsLast7Days = recent.length
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
  const chronicWeeklyLoad = Math.round((load28 / 4) * 10) / 10
  const acwr =
    chronicWeeklyLoad > 0
      ? Math.round((acuteLoad / chronicWeeklyLoad) * 100) / 100
      : acuteLoad > 0
        ? 1.4
        : 1

  const volumePoints = Math.min(55, Math.round((acuteLoad / TARGET_WEEKLY_LOAD) * 55))
  const intensityPoints = Math.min(25, Math.round(avgIntensityLast7Days * 2.5))
  let acwrPenalty = 0
  if (acwr > 1.5) acwrPenalty = Math.min(20, Math.round((acwr - 1.5) * 40))
  else if (acwr > 1.3) acwrPenalty = Math.min(10, Math.round((acwr - 1.3) * 50))

  const workloadScore = Math.min(100, volumePoints + intensityPoints + acwrPenalty)

  const energyAdjustment =
    recent.length > 0 ? Math.round((avgEnergyLast7Days - 3) * 4) : 8

  const trainedYesterday = recent.some((s) => s.session_date >= yesterdayIso())
  const freshnessBonus =
    sessionsLast7Days > 0 && !trainedYesterday ? 10 : sessionsLast7Days === 0 ? 12 : 0

  const recoveryScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(100 - workloadScore * 0.82 + energyAdjustment + freshnessBonus),
    ),
  )

  let fatigueLevel: RecoverySnapshot['fatigueLevel'] = 'low'
  if (workloadScore >= 75 || acwr > 1.6) fatigueLevel = 'very_high'
  else if (workloadScore >= 55 || acwr > 1.4) fatigueLevel = 'high'
  else if (workloadScore >= 35 || acwr > 1.25) fatigueLevel = 'moderate'

  const muscleStress = new Map<string, number>()
  for (const session of recent) {
    const load = sessionLoadUnits(session.duration_min, session.intensity) / 10
    for (const m of inferMuscles(session.focus)) {
      muscleStress.set(m, (muscleStress.get(m) ?? 0) + load)
    }
  }
  if (runMinutesLast7 > 0) {
    const runLoad = runLoadUnits(runMinutesLast7) / 10
    for (const m of ['quads', 'hamstrings', 'calves', 'hip_flexors']) {
      muscleStress.set(m, (muscleStress.get(m) ?? 0) + runLoad)
    }
  }

  const muscleGroups: MuscleLoad[] = [...muscleStress.entries()]
    .map(([id, stress]) => ({
      id,
      label: MUSCLE_LABELS[id]?.label ?? id,
      region: MUSCLE_LABELS[id]?.region ?? 'full',
      stress: Math.round(stress * 10) / 10,
    }))
    .sort((a, b) => b.stress - a.stress)
    .slice(0, 8)

  const breakdown: RecoveryBreakdown = {
    acuteLoad: Math.round(acuteLoad),
    chronicWeeklyLoad,
    acwr,
    runMinutesLast7,
    volumePoints,
    intensityPoints,
    acwrPenalty,
    energyAdjustment,
    freshnessBonus,
  }

  const recommendations: string[] = []
  if (fatigueLevel === 'very_high' || fatigueLevel === 'high') {
    recommendations.push('High workload this week — consider a lighter day or active recovery.')
    recommendations.push('Prioritize sleep, hydration, and easy mobility.')
  } else if (sessionsLast7Days === 0) {
    recommendations.push('No sessions logged this week — a short skill or mobility block can restart momentum.')
  } else {
    recommendations.push('Workload looks manageable — maintain consistency and log how you feel.')
  }

  if (acwr > 1.5) {
    recommendations.push(
      `Acute:chronic ratio is ${acwr.toFixed(2)} (spike) — ease volume before adding intensity.`,
    )
  } else if (acwr < 0.8 && sessionsLast7Days > 0) {
    recommendations.push('Training load dropped vs your 4-week average — room to build back gradually.')
  }

  const topMuscle = muscleGroups[0]
  if (topMuscle && topMuscle.stress >= 4) {
    recommendations.push(`Repeated stress on ${topMuscle.label} — add mobility or alternate focus next session.`)
  }

  if (avgIntensityLast7Days >= 8 && sessionsLast7Days >= 4) {
    recommendations.push('High intensity frequency — mix in a lower-RPE session this week.')
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
