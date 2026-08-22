import { useMemo } from 'react'
import { buildDashboardInsights, type DashboardInsightsResult } from '@analytics/insights'
import { daysUntil, getUnifiedPlanningDeadlines, overallProgress } from '@features/college/utils'
import { useCollege } from '@features/college/hooks/useCollege'
import { useAnalytics } from '@features/analytics'
import { useGoals } from '@features/goals/hooks/useGoals'
import { useTasks } from '@features/tasks/hooks/useTasks'
import { useAthleteDevelopment } from '@features/soccer/hooks/useAthleteDevelopment'
import { useSoccerMatches } from '@features/soccer/matches/hooks/useSoccerMatches'
import { useJournal } from '@features/journal/hooks/useJournal'
import { useTrainingSessions } from '@features/soccer/training/hooks/useTrainingSessions'
import { useRunLogs } from '@features/soccer/running/hooks/useRunLogs'
import { isoInWeek, lastNWeeks } from '@analytics/timeBuckets'
import { computeSkillsIntelligence } from '@features/soccer/athlete/skillsIntelligence'

const DAILY_INSIGHT_KEY = 'seldom:daily-insight'

function readCachedDailyInsight(fresh: string): string {
  try {
    const raw = localStorage.getItem(DAILY_INSIGHT_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { date: string; text: string }
      const today = new Date().toISOString().slice(0, 10)
      if (parsed.date === today && parsed.text) return parsed.text
    }
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem(
      DAILY_INSIGHT_KEY,
      JSON.stringify({ date: new Date().toISOString().slice(0, 10), text: fresh }),
    )
  } catch {
    /* ignore */
  }
  return fresh
}

export function useDashboardInsights(): {
  loading: boolean
  insights: DashboardInsightsResult | null
} {
  const { dashboard, loading: analyticsLoading } = useAnalytics()
  const { tasks, loading: tasksLoading } = useTasks()
  const { goals, loading: goalsLoading } = useGoals()
  const { colleges, userData, applicationPhase, loading: collegeLoading } = useCollege()
  const { matches, loading: matchesLoading } = useSoccerMatches()
  const { runs, loading: runsLoading } = useRunLogs()
  const { entries: journalEntries, loading: journalLoading } = useJournal()
  const { sessions: trainingSessions, loading: trainingLoading } = useTrainingSessions()
  const { displaySkills, loading: athleteLoading } = useAthleteDevelopment()

  const loading =
    analyticsLoading ||
    tasksLoading ||
    goalsLoading ||
    collegeLoading ||
    matchesLoading ||
    runsLoading ||
    journalLoading ||
    trainingLoading ||
    athleteLoading

  const insights = useMemo((): DashboardInsightsResult | null => {
    if (!dashboard) return null

    const trainingThisWeek = dashboard.trainingFrequency.data.at(-1) ?? 0
    const trainingLastWeek = dashboard.trainingFrequency.data.at(-2) ?? 0
    const journalDaysLast14 = dashboard.journalConsistency.data.filter((v) => v > 0).length
    const financialAid = userData?.financialAid ?? []
    const scholarships = userData?.scholarships ?? []
    const nearest = getUnifiedPlanningDeadlines(colleges, financialAid, scholarships, 1)[0]

    const weeks = lastNWeeks(2)
    const thisWeekStart = weeks.at(-1)?.start ?? ''
    const lastWeekStart = weeks.at(-2)?.start ?? ''
    const sessionsThisWeek = trainingSessions.filter((s) => isoInWeek(s.session_date, thisWeekStart)).length
    const sessionsLastWeek = trainingSessions.filter((s) => isoInWeek(s.session_date, lastWeekStart)).length

    const skillIntel = computeSkillsIntelligence(displaySkills, trainingSessions, matches)
    const weaknesses = skillIntel.neglected.slice(0, 2).map((s) => s.label)

    const collegePhase =
      applicationPhase === 'senior' ? 'senior' : applicationPhase === 'junior' ? 'junior' : 'unknown'

    const built = buildDashboardInsights({
      tasks: tasks.map((t) => ({
        title: t.title,
        completed: t.completed,
        deadline: t.deadline,
      })),
      goals: goals.map((g) => ({
        title: g.title,
        progress: g.progress,
        status: g.status,
      })),
      journalEntries: journalEntries.map((e) => ({ entry_date: e.entry_date })),
      trainingSessions: trainingSessions.map((s) => ({ session_date: s.session_date })),
      runLogs: runs.map((r) => ({
        run_date: r.run_date,
        distance_m: r.distance_m,
        duration_sec: r.duration_sec,
      })),
      matches: matches.map((m) => ({
        match_date: m.match_date,
        opponent: m.opponent,
        rating: m.rating,
      })),
      weaknesses,
      collegePhase,
      collegesOnList: colleges.length,
      collegeProgress: overallProgress(colleges),
      nearestDeadlineDays: nearest ? daysUntil(nearest.date) : null,
      nearestDeadlineLabel: nearest?.label ?? null,
      trainingThisWeek: sessionsThisWeek || trainingThisWeek,
      trainingLastWeek: sessionsLastWeek || trainingLastWeek,
      journalDaysLast14,
      journalConsistencyData: dashboard.journalConsistency.data,
    })

    return { ...built, dailyInsight: readCachedDailyInsight(built.dailyInsight) }
  }, [
    dashboard,
    tasks,
    goals,
    colleges,
    userData,
    applicationPhase,
    matches,
    runs,
    journalEntries,
    trainingSessions,
    displaySkills,
  ])

  return { loading, insights }
}
