import type { PersonalRecord, PulseSummary, StreakStat, SuggestedAction, WeekHeadline } from './types.js'
import { buildDailyInsight, buildPulseSummary, buildWeekHeadline, type NarrativeInput } from './narrative.js'
import { computePersonalRecords, computeStreaks, type RecordsInput } from './records.js'

export type InsightPriority = 'high' | 'medium' | 'low'

export interface DashboardInsight {
  id: string
  title: string
  description: string
  priority: InsightPriority
  mode: string
}

export interface DashboardInsightsResult {
  insights: DashboardInsight[]
  personalRecords: PersonalRecord[]
  streaks: StreakStat[]
  suggestedAction: SuggestedAction | null
  weekHeadline: WeekHeadline
  pulse: PulseSummary
  dailyInsight: string
  narrativeInput: NarrativeInput
}

export interface DashboardInsightsInput {
  tasks: Array<{ title: string; completed: boolean; deadline: string | null }>
  goals: Array<{ title: string; progress: number; status: string }>
  journalEntries: Array<{ entry_date: string }>
  trainingSessions: Array<{ session_date: string }>
  runLogs: Array<{ run_date: string; distance_m: number; duration_sec: number }>
  matches: Array<{ match_date: string; opponent: string; rating: number | null }>
  weaknesses: string[]
  collegePhase: 'junior' | 'senior' | 'unknown'
  collegesOnList: number
  collegeProgress: number
  nearestDeadlineDays: number | null
  nearestDeadlineLabel: string | null
  trainingThisWeek: number
  trainingLastWeek: number
  journalDaysLast14: number
  journalConsistencyData: number[]
}

function detectPatterns(input: DashboardInsightsInput): DashboardInsight[] {
  const today = new Date().toISOString().slice(0, 10)
  const insights: DashboardInsight[] = []

  const overdue = input.tasks.filter(
    (t) => !t.completed && t.deadline && t.deadline.slice(0, 10) < today,
  )
  if (overdue.length > 0) {
    insights.push({
      id: 'overdue-tasks',
      title: `${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`,
      description: `"${overdue[0]!.title}" needs attention — reprioritize or reschedule.`,
      priority: 'high',
      mode: 'project_management',
    })
  }

  const openTasks = input.tasks.filter((t) => !t.completed)
  const completedTasks = input.tasks.filter((t) => t.completed)
  if (openTasks.length >= 8 && completedTasks.length > 0) {
    const rate = Math.round((completedTasks.length / (openTasks.length + completedTasks.length)) * 100)
    if (rate < 40) {
      insights.push({
        id: 'low-task-completion',
        title: 'Task completion is lagging',
        description: `Only ~${rate}% of tracked tasks are done. Try a daily planning block.`,
        priority: 'medium',
        mode: 'daily_plan',
      })
    }
  }

  const stagnant = input.goals.filter((g) => g.status === 'active' && g.progress < 20)
  if (stagnant.length >= 2) {
    insights.push({
      id: 'stagnant-goals',
      title: 'Goals need clearer next steps',
      description: `${stagnant.length} active goals are below 20% — break them into weekly actions.`,
      priority: 'high',
      mode: 'goal_breakdown',
    })
  }

  if (input.journalDaysLast14 === 0) {
    insights.push({
      id: 'journal-gap',
      title: 'No journal entries recently',
      description: 'Try a 5-minute evening check-in — reflection improves consistency.',
      priority: 'medium',
      mode: 'reflection',
    })
  } else if (input.journalDaysLast14 < 3) {
    insights.push({
      id: 'journal-sparse',
      title: 'Journal consistency is low',
      description: 'Only a few entries in 14 days. A weekly review could rebuild the habit.',
      priority: 'low',
      mode: 'weekly_review',
    })
  }

  if (input.trainingThisWeek === 0 && input.weaknesses.length > 0) {
    insights.push({
      id: 'training-gap',
      title: 'No training logged this week',
      description: `You track ${input.weaknesses[0]} as a focus area — plan a targeted session.`,
      priority: 'high',
      mode: 'soccer_drills',
    })
  }

  if (input.collegePhase === 'junior' && input.collegesOnList === 0) {
    insights.push({
      id: 'college-list-empty',
      title: 'College list is empty',
      description: 'Add schools you are curious about — no preset list required.',
      priority: 'medium',
      mode: 'college_planning',
    })
  }

  if (
    input.collegePhase === 'senior' &&
    input.nearestDeadlineDays != null &&
    input.nearestDeadlineDays <= 14
  ) {
    insights.push({
      id: 'deadline-soon',
      title: `${input.nearestDeadlineLabel ?? 'Deadline'} in ${input.nearestDeadlineDays} days`,
      description: 'Protect time this week for checklist items and essays.',
      priority: 'high',
      mode: 'college_planning',
    })
  }

  const activeGoals = input.goals.filter((g) => g.status === 'active')
  if (activeGoals.length === 0 && openTasks.length === 0) {
    insights.push({
      id: 'empty-os',
      title: 'Define your next focus',
      description: 'No active goals or open tasks — brainstorm what matters this month.',
      priority: 'medium',
      mode: 'brainstorm',
    })
  }

  const order = { high: 0, medium: 1, low: 2 }
  return insights.sort((a, b) => order[a.priority] - order[b.priority])
}

export function resolveSuggestedAction(insight: DashboardInsight | undefined): SuggestedAction | null {
  if (!insight) return null

  switch (insight.mode) {
    case 'project_management':
      return {
        title: 'Clear overdue tasks',
        description: insight.description,
        href: '/tasks',
        duration: '15 min',
      }
    case 'daily_plan':
      return {
        title: 'Plan your day',
        description: insight.description,
        href: '/assistant',
        duration: '10 min',
      }
    case 'goal_breakdown':
      return {
        title: 'Break down a goal',
        description: insight.description,
        href: '/goals',
        duration: '20 min',
      }
    case 'reflection':
      return {
        title: 'Evening journal check-in',
        description: insight.description,
        href: '/journal',
        duration: '5 min',
      }
    case 'weekly_review':
      return {
        title: 'Run a weekly review',
        description: insight.description,
        href: '/assistant',
        duration: '15 min',
      }
    case 'soccer_drills':
      return {
        title: 'Log a training session',
        description: insight.description,
        href: '/soccer/overview',
        duration: '45 min',
      }
    case 'college_planning':
      return {
        title: insight.id === 'college-list-empty' ? 'Add a college' : 'Review deadlines',
        description: insight.description,
        href: insight.id === 'college-list-empty' ? '/college/overview' : '/college/deadlines',
        duration: '30 min',
      }
    default:
      return {
        title: 'Ask Seldom OS',
        description: insight.description,
        href: '/assistant',
      }
  }
}

export function buildDashboardInsights(input: DashboardInsightsInput): DashboardInsightsResult {
  const openTasks = input.tasks.filter((t) => !t.completed).length
  const overdueTasks = input.tasks.filter((t) => {
    if (t.completed || !t.deadline) return false
    return t.deadline.slice(0, 10) < new Date().toISOString().slice(0, 10)
  }).length

  const narrativeInput: NarrativeInput = {
    trainingThisWeek: input.trainingThisWeek,
    trainingLastWeek: input.trainingLastWeek,
    journalDaysLast14: input.journalDaysLast14,
    overdueTasks,
    openTasks,
    collegePhase: input.collegePhase,
    nearestDeadlineDays: input.nearestDeadlineDays,
    nearestDeadlineLabel: input.nearestDeadlineLabel,
    collegeProgress: input.collegeProgress,
    collegesOnList: input.collegesOnList,
  }

  const weekHeadline = buildWeekHeadline(narrativeInput)
  const pulse = buildPulseSummary(narrativeInput)
  const insights = detectPatterns(input)
  const suggestedAction = resolveSuggestedAction(insights[0])
  const dailyInsight = buildDailyInsight(weekHeadline, pulse, insights[0]?.title ?? null)

  const recordsInput: RecordsInput = {
    runLogs: input.runLogs,
    matches: input.matches,
    trainingSessions: input.trainingSessions,
    journalEntries: input.journalEntries,
    journalConsistencyData: input.journalConsistencyData,
  }

  return {
    insights,
    personalRecords: computePersonalRecords(recordsInput),
    streaks: computeStreaks(recordsInput),
    suggestedAction,
    weekHeadline,
    pulse,
    dailyInsight,
    narrativeInput,
  }
}
