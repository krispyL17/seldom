/** FM-style attribute rating 1–20 */
export interface SkillRating {
  id: string
  name: string
  value: number
  max?: number
  trend?: 'up' | 'down' | 'stable'
}

export interface TrainingSession {
  id: string
  date: string
  type: string
  durationMin: number
  intensity: 'Low' | 'Moderate' | 'Moderate-High' | 'High'
  rpe: number
  focus: string[]
  notes: string
  rating: number
}

export interface MatchRecord {
  id: string
  date: string
  opponent: string
  competition: string
  result: 'W' | 'D' | 'L'
  score: string
  minutes: number
  goals: number
  assists: number
  rating: number
  highlights: string
}

export interface PhysicalMetric {
  id: string
  name: string
  value: number
  unit: string
  benchmark: number
  trend?: 'up' | 'down' | 'stable'
}

export interface PerformanceInsight {
  id: string
  title: string
  description: string
  priority?: 'high' | 'medium' | 'low'
  category: string
}

export interface WeeklyLoad {
  week: string
  minutes: number
  sessions: number
  avgRpe: number
}

export interface RatingTrend {
  week: string
  matchRating: number
  trainingRating: number
}

export interface CoachMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface PlayerProfile {
  name: string
  position: string
  preferredFoot: string
  squadNumber: number
  season: string
  currentFocus: string
}

export const SOCCER_NAV = [
  { id: 'overview', label: 'Overview', href: '/soccer/overview' },
  { id: 'training', label: 'Training', href: '/soccer/training' },
  { id: 'running', label: 'Running', href: '/soccer/running' },
  { id: 'matches', label: 'Matches', href: '/soccer/matches' },
  { id: 'technical', label: 'Technical', href: '/soccer/technical' },
  { id: 'physical', label: 'Physical', href: '/soccer/physical' },
  { id: 'weaknesses', label: 'Weaknesses', href: '/soccer/weaknesses' },
  { id: 'strengths', label: 'Strengths', href: '/soccer/strengths' },
  { id: 'coach', label: 'AI Coach', href: '/soccer/coach' },
  { id: 'progress', label: 'Progress', href: '/soccer/progress' },
] as const

export type SoccerNavId = (typeof SOCCER_NAV)[number]['id']
