/**
 * Shared analytics types — used by SQLite server and React client.
 */

export interface ChartSeries {
  labels: string[]
  data: number[]
  unit?: string
}

export interface AnalyticsKpi {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  /** Change vs prior period (e.g. +2 sessions). */
  delta?: number | null
  deltaLabel?: string
  /** Recent values for inline sparkline (typically last 7 days or weeks). */
  sparkline?: number[]
}

export interface PersonalRecord {
  id: string
  label: string
  value: string
  detail?: string
  isRecent?: boolean
}

export interface StreakStat {
  id: string
  label: string
  count: number
  unit: string
}

export interface SuggestedAction {
  title: string
  description: string
  href: string
  duration?: string
}

export type WeekHeadlineTone = 'strong' | 'mixed' | 'quiet' | 'urgent'

export interface WeekHeadline {
  tone: WeekHeadlineTone
  adjective: string
  sentence: string
}

export interface PulseSummary {
  trainingSessions: number
  journalDays: number
  openTasks: number
  overdueTasks: number
  collegeApps: number
  collegeProgress: number
  message: string
}

export interface GymLog {
  id: string
  user_id: string
  session_date: string
  duration_min: number
  workout_type: string | null
  notes: string | null
  created_at: string
}

export interface AnalyticsDashboard {
  userId: string
  computedAt: string
  kpis: AnalyticsKpi[]
  taskCompletion: ChartSeries
  goalProgress: ChartSeries
  trainingFrequency: ChartSeries
  running: ChartSeries
  gym: ChartSeries
  collegeProgress: ChartSeries
  journalConsistency: ChartSeries
  source: 'sqlite' | 'local'
  /** 2 until activity spans older weeks, then 4. */
  weekCount: number
}

/** Raw records synced from Supabase (and local gym logs). */
export interface AnalyticsSyncPayload {
  userId: string
  tasks: Array<{
    completed: boolean
    updated_at: string
    created_at: string
  }>
  goals: Array<{
    progress: number
    status: string
    updated_at: string
    created_at: string
  }>
  journalEntries: Array<{ entry_date: string }>
  trainingSessions: Array<{
    session_date: string
    duration_min: number
    intensity: number
    technical_ratings: Record<string, number>
  }>
  runLogs: Array<{ run_date: string; distance_m: number; duration_sec: number }>
  gymLogs: GymLog[]
  college: {
    collegeNames: string[]
    collegeProgress: number[]
    overallProgress: number
  } | null
}

export interface AnalyticsServerConfig {
  port: number
  dbPath: string
}

export const DEFAULT_ANALYTICS_CONFIG: AnalyticsServerConfig = {
  port: 3849,
  dbPath: 'data/seldom-analytics.db',
}
