/**
 * Seldom OS — modular AI orchestration types.
 */

export type OSModuleId =
  | 'daily_planning'
  | 'weekly_reviews'
  | 'goal_breakdown'
  | 'brainstorming'
  | 'essay_ideas'
  | 'project_ideas'
  | 'coding_ideas'
  | 'soccer_drills'
  | 'research_topics'
  | 'college_planning'
  | 'scholarship_ideas'
  | 'personal_recommendations'
  | 'reflection'
  | 'project_management'
  | 'memory_retrieval'

export type OSMode =
  | 'chat'
  | 'daily_plan'
  | 'weekly_review'
  | 'goal_breakdown'
  | 'brainstorm'
  | 'essay_ideas'
  | 'project_ideas'
  | 'coding_ideas'
  | 'soccer_drills'
  | 'research_topics'
  | 'college_planning'
  | 'scholarship_ideas'
  | 'personal_recommendations'
  | 'reflection'
  | 'project_management'

export interface OSModuleDefinition {
  id: OSModuleId
  mode: OSMode
  label: string
  description: string
  keywords: string[]
}

export interface ProactiveInsight {
  id: string
  title: string
  description: string
  suggestedMode: OSMode
  priority: 'high' | 'medium' | 'low'
}

export interface OSContextSummary {
  openTasks: number
  completedTasks: number
  activeGoals: number
  journalEntriesLast14Days: number
  trainingSessionsLast14Days: number
  runsLast14Days: number
  collegesOnList: number
  collegePhase: 'junior' | 'senior' | 'unknown'
}

export interface OSUserContext {
  summary: OSContextSummary
  tasks: Array<{ title: string; completed: boolean; priority: string; deadline: string | null }>
  goals: Array<{ title: string; progress: number; status: string; category: string | null }>
  journal: Array<{ date: string; mood: string; reflection: string | null }>
  training: Array<{ date: string; durationMin: number; intensity: number; position: string }>
  runs: Array<{ date: string; distanceKm: number; durationMin: number }>
  college: {
    phase: 'junior' | 'senior' | 'unknown'
    studentName: string | null
    graduationYear: string | null
    highSchool: string | null
    teamQuality: string | null
    universityLinks: string | null
    intendedMajor: string | null
    testScores: { sat: string | null; act: string | null }
    schools: Array<{ id: string; name: string; location: string; status: string; progress: number; majors: string[] }>
  }
  performance: {
    tabLabel: string
    passion: string
    customTabs: Array<{ label: string; focusHint: string }>
    gymEnabled: boolean
  }
  soccer: {
    weaknesses: string[]
    strengths: string[]
    sessionsLast14Days: number
  }
}

export interface OSChatRequest {
  message: string
  mode?: OSMode
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface OSChatResponse {
  reply: string
  meta: {
    mode: OSMode
    module: OSModuleId | null
    memoriesUsed: number
    searchUsed: boolean
    model: string
    proactiveInsights: ProactiveInsight[]
    contextSummary: OSContextSummary
    suggestedTitle?: string
    actionsExecuted?: Array<{ type: string; success: boolean; summary: string }>
  }
}

export interface OSBootstrapResponse {
  welcome: string
  suggestions: string[]
  modules: OSModuleDefinition[]
  proactiveInsights: ProactiveInsight[]
}
