export type { CoachMode } from '@services/soccer/coachClient'

export interface CoachMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  isStreaming?: boolean
}

export interface CoachInsight {
  mode: 'training_plan' | 'technical' | 'tactical' | 'development'
  title: string
  content: string
  loading: boolean
  error: string | null
  updatedAt: string | null
}

export const INSIGHT_MODES: Array<{ mode: CoachInsight['mode']; title: string }> = [
  { mode: 'training_plan', title: 'Training Plan' },
  { mode: 'technical', title: 'Technical' },
  { mode: 'tactical', title: 'Tactical' },
  { mode: 'development', title: 'Development Plan' },
]
