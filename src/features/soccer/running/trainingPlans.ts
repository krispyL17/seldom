import type { RunLog, TrainingPlanSuggestion } from './types'
import { MILE_M, FIVE_K_M } from './types'
import { bestRunForDistance, formatDuration, pacePerMile } from './utils'

interface TrainingSessionSummary {
  count: number
  avgIntensity: number
}

interface PlanContext {
  runs: RunLog[]
  sessions?: TrainingSessionSummary
  memorySnippets?: string[]
}

const PLAN_CATALOG: Omit<TrainingPlanSuggestion, 'matchReason'>[] = [
  {
    id: 'hal-higdon-5k-novice',
    title: 'Hal Higdon — 5K Novice',
    description: '8-week walk/run build for beginners. 3 days per week, low injury risk.',
    url: 'https://www.halhigdon.com/training-programs/5k-novice/',
    source: 'Hal Higdon',
  },
  {
    id: 'hal-higdon-5k-intermediate',
    title: 'Hal Higdon — 5K Intermediate',
    description: 'Speed work + tempo runs for runners with a base already built.',
    url: 'https://www.halhigdon.com/training-programs/5k-intermediate/',
    source: 'Hal Higdon',
  },
  {
    id: 'hal-higdon-half-novice',
    title: 'Hal Higdon — Half Marathon Novice',
    description: '12-week plan building to 13.1 miles. Good if your mile time is under 10:00.',
    url: 'https://www.halhigdon.com/training-programs/half-marathon-novice-1/',
    source: 'Hal Higdon',
  },
  {
    id: 'nike-5k',
    title: 'Nike Run Club — 5K Plan',
    description: 'Guided runs in the NRC app. Structured audio coaching for busy schedules.',
    url: 'https://www.nike.com/running/5k-training-plan',
    source: 'Nike Run Club',
  },
  {
    id: 'runners-world-mile',
    title: "Runner's World — Mile Speed Plans",
    description: 'Short-distance speed development. Ideal for breaking a mile PR during a busy season.',
    url: 'https://www.runnersworld.com/training/a20847201/how-to-run-a-faster-mile/',
    source: "Runner's World",
  },
  {
    id: 'strides-tempo',
    title: 'Strides + Tempo (Maintenance)',
    description: '2× mile tempo + strides after practice. In-season maintenance without extra volume.',
    url: 'https://www.runnersworld.com/training/a20847201/how-to-run-a-faster-mile/',
    source: 'Seldom AI',
  },
]

function milePaceSec(runs: RunLog[]): number | null {
  const best = bestRunForDistance(runs, MILE_M)
  return best ? best.duration_sec : null
}

function weeklyRunVolume(runs: RunLog[]): number {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 28)
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  return runs.filter((r) => r.run_date >= cutoffStr).length
}

/** Suggests training plans based on run history, session load, and memory context. */
export function suggestTrainingPlans(context: PlanContext): TrainingPlanSuggestion[] {
  const { runs, sessions, memorySnippets = [] } = context
  const mileSec = milePaceSec(runs)
  const volume = weeklyRunVolume(runs)
  const avgIntensity = sessions?.avgIntensity ?? 0
  const memoryText = memorySnippets.join(' ').toLowerCase()

  const suggestions: TrainingPlanSuggestion[] = []

  function add(id: string, reason: string) {
    const plan = PLAN_CATALOG.find((p) => p.id === id)
    if (plan && !suggestions.some((s) => s.id === id)) {
      suggestions.push({ ...plan, matchReason: reason })
    }
  }

  if (mileSec === null || mileSec > 600) {
    add('hal-higdon-5k-novice', 'No mile PR logged yet — start with a walk/run build.')
  } else if (mileSec > 480) {
    add('hal-higdon-5k-intermediate', `Mile PR ${formatDuration(mileSec)} — ready for structured speed work.`)
    add('nike-5k', 'App-guided runs fit a busy schedule.')
  } else if (mileSec <= 360) {
    add('runners-world-mile', `Strong mile (${formatDuration(mileSec)}) — focus on race-pace sharpening.`)
    add('hal-higdon-half-novice', 'Your aerobic base supports half marathon training.')
  } else {
    add('runners-world-mile', `Mile PR ${formatDuration(mileSec)} (${pacePerMile(mileSec, MILE_M)}) — time to push threshold pace.`)
    add('hal-higdon-5k-intermediate', 'Tempo intervals will translate to better endurance.')
  }

  if (avgIntensity >= 7 || memoryText.includes('intensity')) {
    add('strides-tempo', 'High session load detected — short tempo runs maintain fitness without overtraining.')
  }

  if (volume < 2) {
    add('hal-higdon-5k-novice', 'Low recent run volume — rebuild consistency before speed work.')
  }

  const has5k = bestRunForDistance(runs, FIVE_K_M)
  if (has5k && has5k.duration_sec > 1500) {
    add('hal-higdon-5k-intermediate', `5K PR ${formatDuration(has5k.duration_sec)} — intermediate plan targets sub-25.`)
  }

  if (memoryText.includes('college') || memoryText.includes('junior')) {
    suggestions.forEach((s) => {
      if (s.id === 'nike-5k') {
        s.matchReason += ' Flexible for school + practice schedule.'
      }
    })
  }

  return suggestions.slice(0, 4)
}
