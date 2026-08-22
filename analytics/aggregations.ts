import type {
  AnalyticsDashboard,
  AnalyticsKpi,
  AnalyticsSyncPayload,
  ChartSeries,
} from './types.js'
import {
  ANALYTICS_WEEK_COUNT_FULL,
  ANALYTICS_WEEK_COUNT_INITIAL,
} from './constants.js'
import { dateInDay, dayLabel, isoInWeek, lastNDays, lastNWeeks } from './timeBuckets.js'

function collectActivityDates(payload: AnalyticsSyncPayload): string[] {
  return [
    ...payload.tasks.map((t) => t.updated_at.slice(0, 10)),
    ...payload.trainingSessions.map((s) => s.session_date),
    ...payload.runLogs.map((r) => r.run_date),
    ...payload.gymLogs.map((g) => g.session_date),
    ...payload.journalEntries.map((e) => e.entry_date),
  ]
}

/** Start at 2 weeks; expand to 4 once activity exists before the 2-week window. */
export function resolveAnalyticsWeekCount(payload: AnalyticsSyncPayload): number {
  const twoWeekStart = lastNWeeks(ANALYTICS_WEEK_COUNT_INITIAL)[0]?.start
  if (!twoWeekStart) return ANALYTICS_WEEK_COUNT_INITIAL

  const hasOlderActivity = collectActivityDates(payload).some((date) => date < twoWeekStart)
  return hasOlderActivity ? ANALYTICS_WEEK_COUNT_FULL : ANALYTICS_WEEK_COUNT_INITIAL
}

function computeTaskCompletion(payload: AnalyticsSyncPayload, dayCount: number): ChartSeries {
  const days = lastNDays(dayCount)
  const labels = days.map(dayLabel)
  const data = days.map((day) =>
    payload.tasks.filter((t) => t.completed && dateInDay(t.updated_at, day)).length,
  )

  return { labels, data, unit: 'completed' }
}

function computeGoalProgress(payload: AnalyticsSyncPayload, weekCount: number): ChartSeries {
  const weeks = lastNWeeks(weekCount)
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

function computeTrainingFrequency(payload: AnalyticsSyncPayload, weekCount: number): ChartSeries {
  const weeks = lastNWeeks(weekCount)
  const data = weeks.map(
    ({ start }) =>
      payload.trainingSessions.filter((s) => isoInWeek(s.session_date, start)).length,
  )
  return { labels: weeks.map((w) => w.label), data, unit: 'sessions' }
}

function computeRunning(
  payload: AnalyticsSyncPayload,
  weekCount: number,
  distanceUnit: 'km' | 'mi' = 'mi',
): ChartSeries {
  const weeks = lastNWeeks(weekCount)
  const data = weeks.map(({ start }) => {
    const runs = payload.runLogs.filter((r) => isoInWeek(r.run_date, start))
    if (distanceUnit === 'mi') {
      const totalMi = runs.reduce((s, r) => s + r.distance_m / 1609.34, 0)
      return Math.round(totalMi * 10) / 10
    }
    const totalKm = runs.reduce((s, r) => s + r.distance_m / 1000, 0)
    return Math.round(totalKm * 10) / 10
  })
  return { labels: weeks.map((w) => w.label), data, unit: distanceUnit }
}

function computeGym(payload: AnalyticsSyncPayload, weekCount: number): ChartSeries {
  const weeks = lastNWeeks(weekCount)
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

function computeJournalConsistency(payload: AnalyticsSyncPayload, dayCount: number): ChartSeries {
  const days = lastNDays(dayCount)
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

function trendFromDelta(delta: number | null, invert = false): 'up' | 'down' | 'neutral' {
  if (delta == null || delta === 0) return 'neutral'
  const positive = delta > 0
  const good = invert ? !positive : positive
  return good ? 'up' : 'down'
}

function deltaLabel(delta: number | null): string | undefined {
  if (delta == null || delta === 0) return undefined
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta} vs last wk`
}

function computeKpis(
  payload: AnalyticsSyncPayload,
  dashboard: Omit<AnalyticsDashboard, 'kpis'>,
  distanceUnit: 'km' | 'mi' = 'mi',
): AnalyticsKpi[] {
  const taskRate =
    payload.tasks.length > 0
      ? Math.round(
          (payload.tasks.filter((t) => t.completed).length / payload.tasks.length) * 100,
        )
      : 0

  const activeGoals = payload.goals.filter((g) => g.status === 'active')
  const avgGoal =
    activeGoals.length > 0
      ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length)
      : 0

  const journalStreak = computeJournalStreak(dashboard.journalConsistency.data)
  const journalSparkline = dashboard.journalConsistency.data.slice(-7)

  const trainingData = dashboard.trainingFrequency.data
  const weeklyTraining = trainingData.at(-1) ?? 0
  const priorTraining = trainingData.at(-2) ?? 0
  const trainingDelta = trainingData.length >= 2 ? weeklyTraining - priorTraining : null

  const runningData = dashboard.running.data
  const weeklyRuns = runningData.at(-1) ?? 0
  const priorRuns = runningData.at(-2) ?? 0
  const runningDelta = runningData.length >= 2 ? Math.round((weeklyRuns - priorRuns) * 10) / 10 : null

  const goalData = dashboard.goalProgress.data
  const goalValue = goalData.at(-1) ?? avgGoal
  const priorGoal = goalData.at(-2) ?? goalValue
  const goalDelta = goalData.length >= 2 ? goalValue - priorGoal : null

  const taskSparkline = dashboard.taskCompletion.data.slice(-7)
  const priorTaskRate = taskSparkline.length >= 2 ? taskSparkline.at(-2) ?? 0 : 0
  const taskDelta =
    taskSparkline.length >= 2 ? (taskSparkline.at(-1) ?? 0) - priorTaskRate : null

  const priorJournalStreak = computeJournalStreak(
    dashboard.journalConsistency.data.slice(0, -1),
  )
  const journalDelta =
    dashboard.journalConsistency.data.length >= 2 ? journalStreak - priorJournalStreak : null

  const collegeValue = payload.college?.overallProgress ?? 0

  return [
    {
      label: 'Task completion',
      value: taskRate,
      unit: '%',
      trend: trendFromDelta(taskDelta),
      delta: taskDelta,
      deltaLabel: deltaLabel(taskDelta),
      sparkline: taskSparkline,
    },
    {
      label: 'Goal progress',
      value: goalValue,
      unit: '%',
      trend: trendFromDelta(goalDelta),
      delta: goalDelta,
      deltaLabel: deltaLabel(goalDelta),
      sparkline: goalData.slice(-4),
    },
    {
      label: 'Training / wk',
      value: weeklyTraining,
      unit: 'sessions',
      trend: trendFromDelta(trainingDelta),
      delta: trainingDelta,
      deltaLabel: deltaLabel(trainingDelta),
      sparkline: trainingData.slice(-4),
    },
    {
      label: 'Running / wk',
      value: weeklyRuns,
      unit: distanceUnit,
      trend: trendFromDelta(runningDelta),
      delta: runningDelta,
      deltaLabel: deltaLabel(runningDelta),
      sparkline: runningData.slice(-4),
    },
    {
      label: 'College progress',
      value: collegeValue,
      unit: '%',
      trend: collegeValue >= 50 ? 'up' : 'neutral',
      sparkline: payload.college?.collegeProgress.slice(0, 6),
    },
    {
      label: 'Journal streak',
      value: journalStreak,
      unit: 'days',
      trend: trendFromDelta(journalDelta),
      delta: journalDelta,
      deltaLabel: deltaLabel(journalDelta),
      sparkline: journalSparkline,
    },
  ]
}

export function buildAnalyticsDashboard(
  payload: AnalyticsSyncPayload,
  source: 'sqlite' | 'local',
  distanceUnit: 'km' | 'mi' = 'mi',
): AnalyticsDashboard {
  const weekCount = resolveAnalyticsWeekCount(payload)
  const taskDayCount = weekCount >= ANALYTICS_WEEK_COUNT_FULL ? 14 : 7
  const journalDayCount = weekCount >= ANALYTICS_WEEK_COUNT_FULL ? 28 : 14

  const partial = {
    userId: payload.userId,
    computedAt: new Date().toISOString(),
    weekCount,
    taskCompletion: computeTaskCompletion(payload, taskDayCount),
    goalProgress: computeGoalProgress(payload, weekCount),
    trainingFrequency: computeTrainingFrequency(payload, weekCount),
    running: computeRunning(payload, weekCount, distanceUnit),
    gym: computeGym(payload, weekCount),
    collegeProgress: computeCollegeProgress(payload),
    journalConsistency: computeJournalConsistency(payload, journalDayCount),
    source,
  }

  return {
    ...partial,
    kpis: computeKpis(payload, partial, distanceUnit),
  }
}
