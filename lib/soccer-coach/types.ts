import type { AssistantEnv } from '../assistant/types.js'

export type CoachMode = 'chat' | 'training_plan' | 'technical' | 'tactical' | 'development'

export interface CoachChatRequest {
  message: string
  mode?: CoachMode
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface CoachGenerateRequest {
  mode: Exclude<CoachMode, 'chat'>
}

export interface CoachResponse {
  reply: string
  meta: {
    mode: CoachMode
    memoriesUsed: number
    searchUsed: boolean
    model: string
    contextSummary: {
      sessions: number
      matches: number
      weaknesses: number
      strengths: number
      goals: number
    }
  }
}

export interface SoccerPlayerContext {
  playerProfile?: {
    name?: string
    position?: string
    currentFocus?: string
    preferredFoot?: string
    season?: string
  } | null
  trainingSessions: TrainingSessionSummary[]
  matches: MatchSummary[]
  weaknesses: InsightSummary[]
  strengths: InsightSummary[]
  goals: GoalSummary[]
  derivedSkills: DerivedSkillSummary[]
  loadSummary: LoadSummary
  athleteDevelopment?: AthleteDevelopmentSummary | null
  performanceTab?: {
    label: string
    passion: string
    customTabs: Array<{ label: string; focusHint: string }>
    gymEnabled: boolean
  }
}

export interface AthleteDevelopmentSummary {
  streakCurrent: number
  streakLongest: number
  streakFrozen: boolean
  injuryModeActive: boolean
  dominantSide: string
  weakSide: string
  avgWeakSidePct: number | null
  recoveryScore: number | null
  workloadScore: number | null
  fatigueLevel: string | null
  knowledgeChunkCount: number
  customTabs?: Array<{ label?: string; focusHint?: string }>
  gymEnabled?: boolean
}

export interface TrainingSessionSummary {
  date: string
  durationMin: number
  position: string
  intensity: number
  mood: string
  energy: number
  notes: string | null
  ratings: Record<string, number>
  sideBalance?: { dominant_pct: number; weak_pct: number } | null
}

export interface MatchSummary {
  date: string
  opponent: string
  competition: string | null
  result: string
  score: string | null
  minutes: number
  goals: number
  assists: number
  rating: number | null
  highlights: string | null
}

export interface InsightSummary {
  title: string
  description: string | null
  priority: string | null
  category: string | null
}

export interface GoalSummary {
  title: string
  description: string | null
  progress: number
  targetDate: string | null
  status: string
}

export interface DerivedSkillSummary {
  skill: string
  average: number
  trend: 'low' | 'mid' | 'high'
}

export interface LoadSummary {
  sessionsLast14Days: number
  totalMinutesLast14Days: number
  avgIntensityLast14Days: number
  avgEnergyLast14Days: number
}


export type CoachEnv = AssistantEnv

export { loadAssistantEnv as loadCoachEnv } from '../assistant/types.js'
