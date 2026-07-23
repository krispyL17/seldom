import type {
  AnalyticsDashboard,
  AnalyticsKpi,
  AnalyticsSyncPayload,
  ChartSeries,
  SkillTrendSeries,
} from './types.js'
import { dateInDay, dayLabel, isoInWeek, lastNDays, lastNWeeks } from './timeBuckets.js'

const TECHNICAL_KEYS = [
  'first_touch',
  'passing',
  'dribbling',
  'crossing',
  'shooting',
  'decision_making',
  'weak_foot',
  'acceleration',
  'agility',
  'confidence',
] as const

const TECHNICAL_LABELS: Record<string, string> = {
  first_touch: 'First Touch',
  passing: 'Passing',
  dribbling: 'Dribbling',
  crossing: 'Crossing',
  shooting: 'Shooting',
  decision_making: 'Decision Making',
  weak_foot: 'Weak Foot',
  acceleration: 'Acceleration',
  agility: 'Agility',
  confidence: 'Confidence',
}

function computeTaskCompletion(payload: AnalyticsSyncPayload): ChartSeries {
  const days = lastNDays(7)
  const labels = days.map(dayLabel)
  const data = days.map((day) => {
    const completedToday = payload.tasks.filter(
      (t) => t.completed && dateInDay(t.updated_at, day),
    ).length
    const total = payload.tasks.length
    if (total === 0) return 0
    return Math.round((completedToday / total) * 100)
  })

  return { labels, data, unit: '%' }
}

function computeGoalProgress(payload: AnalyticsSyncPayload): ChartSeries {
  const weeks = lastNWeeks(8)
  const active = payload.goals.filter((g) => g.status === 'active')

  const data = weeks.map(({ start }) => {
    const inWeek = active.filter((g) => isoInWeek(g.updated_at, start))
    if (inWeek.length === 0) {
      const avg = active.length
        ? Math.round(active.reduce((s, g) => s + g.progress, 0) / active.length)
        : 0
      return avg
    }
    return Math.round(inWeek.reduce((s, g) => s + g.progress, 0) / inWeek.length)
  })

  return { labels: weeks.map((w) => w.label), data, unit: '%' }
}

function computeTrainingFrequency(payload: AnalyticsSyncPayload): ChartSeries {
  const weeks = lastNWeeks(8)
  const data = weeks.map(
    ({ start }) =>
      payload.trainingSessions.filter((s) => isoInWeek(s.session_date, start)).length,
  )
  return { labels: weeks.map((w) => w.label), data, unit: 'sessions' }
}

function computeTechnicalSkills(payload: AnalyticsSyncPayload): SkillTrendSeries[] {
  const sessions = [...payload.trainingSessions].sort((a, b) =>
    a.session_date.localeCompare(b.session_date),
  )
  const labels = sessions.map((s) =>
    new Date(`${s.session_date}T12:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  )

  return TECHNICAL_KEYS.map((key) => {
    const data = sessions.map((s) => s.technical_ratings[key] ?? 0)
    return {
      skill: TECHNICAL_LABELS[key] ?? key,
      labels,
      data,
      latest: data.at(-1) ?? 0,
    }
  }).filter((s) => s.data.some((v) => v > 0))
}

function computeRunning(payload: AnalyticsSyncPayload): ChartSeries {
  const weeks = lastNWeeks(8)
  const data = weeks.map(({ start }) => {
    const runs = payload.runLogs.filter((r) => isoInWeek(r.run_date, start))
    const totalKm = runs.reduce((s, r) => s + r.distance_m / 1000, 0)
    return Math.round(totalKm * 10) / 10
  })
  return { labels: weeks.map((w) => w.label), data, unit: 'km' }
}

function computeGym(payload: AnalyticsSyncPayload): ChartSeries {
  const weeks = lastNWeeks(8)
  const data = weeks.map(({ start }) => {
    const sessions = payload.gymLogs.filter((g) => isoInWeek(g.session_date, start))
    return sessions.reduce((s, g) => s + g.duration_min, 0)
  })
  return { labels: weeks.map((w) => w.label), data, unit: 'min' }
}

function computeCollegeProgress(payload: AnalyticsSyncPayload): ChartSeries {
  if (!payload.college || payload.college.collegeNames.length === 0) {
    return { labels: ['Overall'], data: [payload.college?.overallProgress ?? 0], unit: '%' }
  }
  return {
    labels: payload.college.collegeNames,
    data: payload.college.collegeProgress,
    unit: '%',
  }
}

function computeJournalConsistency(payload: AnalyticsSyncPayload): ChartSeries {
  const days = lastNDays(14)
  const labels = days.map((d) =>
    new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
  )
  const data = days.map((day) =>
    payload.journalEntries.some((e) => dateInDay(e.entry_date, day)) ? 1 : 0,
  )
  return { labels, data, unit: 'entries' }
}

function computeJournalStreak(data: number[]): number {
  let streak = 0
  for (let i = data.length - 1; i >= 0; i -= 1) {
    if (data[i] === 0) break
    streak += 1
  }
  return streak
}

function computeKpis(payload: AnalyticsSyncPayload, dashboard: Omit<AnalyticsDashboard, 'kpis'>): AnalyticsKpi[] {
  const taskRate =
    payload.tasks.length > 0
      ? Math.round(
          (payload.tasks.filter((t) => t.completed).length / payload.tasks.length) * 100,
        )
      : 0

  const avgGoal =
    payload.goals.filter((g) => g.status === 'active').length > 0
      ? Math.round(
          payload.goals
            .filter((g) => g.status === 'active')
            .reduce((s, g) => s + g.progress, 0) /
            payload.goals.filter((g) => g.status === 'active').length,
        )
      : 0

  const journalStreak = computeJournalStreak(dashboard.journalConsistency.data)

  const weeklyTraining = dashboard.trainingFrequency.data.at(-1) ?? 0
  const weeklyRuns = dashboard.running.data.at(-1) ?? 0

  return [
    { label: 'Task completion', value: taskRate, unit: '%', trend: taskRate >= 50 ? 'up' : 'neutral' },
    { label: 'Goal progress', value: avgGoal, unit: '%', trend: 'up' },
    { label: 'Training / wk', value: weeklyTraining, unit: 'sessions', trend: 'up' },
    { label: 'Running / wk', value: weeklyRuns, unit: 'km', trend: 'neutral' },
    { label: 'College progress', value: payload.college?.overallProgress ?? 0, unit: '%', trend: 'up' },
    { label: 'Journal streak', value: journalStreak, unit: 'days', trend: journalStreak >= 3 ? 'up' : 'neutral' },
  ]
}

export function buildAnalyticsDashboard(
  payload: AnalyticsSyncPayload,
  source: 'sqlite' | 'local',
): AnalyticsDashboard {
  const partial = {
    userId: payload.userId,
    computedAt: new Date().toISOString(),
    taskCompletion: computeTaskCompletion(payload),
    goalProgress: computeGoalProgress(payload),
    trainingFrequency: computeTrainingFrequency(payload),
    technicalSkills: computeTechnicalSkills(payload),
    running: computeRunning(payload),
    gym: computeGym(payload),
    collegeProgress: computeCollegeProgress(payload),
    journalConsistency: computeJournalConsistency(payload),
    source,
  }

  return {
    ...partial,
    kpis: computeKpis(payload, partial),
  }
}
