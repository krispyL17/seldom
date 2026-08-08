export type GameResult = 'W' | 'D' | 'L'

export type GameEventType = 'game' | 'scrim' | 'practice' | 'tournament'

export interface SoccerMatch {
  id: string
  user_id: string
  match_date: string
  opponent: string
  competition: string | null
  result: GameResult
  score: string | null
  minutes: number
  goals: number
  assists: number
  rating: number | null
  highlights: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateSoccerMatchInput {
  match_date: string
  event_type: GameEventType
  opponent?: string
  result: GameResult
  minutes?: number
  goals?: number
  assists?: number
  notes?: string
}

export interface UpdateSoccerMatchInput extends Partial<CreateSoccerMatchInput> {}

export const EVENT_TYPE_LABELS: Record<GameEventType, string> = {
  game: 'Game',
  scrim: 'Scrimmage',
  practice: 'Team practice',
  tournament: 'Tournament',
}

export const RESULT_LABELS: Record<GameResult, string> = {
  W: 'Win',
  D: 'Draw / tie',
  L: 'Loss',
}
