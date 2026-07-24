import type { JournalMood } from '@features/journal/types'

export type TrainingMood = JournalMood

export type TechnicalRatingKey =
  | 'first_touch'
  | 'passing'
  | 'dribbling'
  | 'crossing'
  | 'shooting'
  | 'decision_making'
  | 'weak_foot'
  | 'acceleration'
  | 'agility'
  | 'confidence'

export const TECHNICAL_RATING_KEYS: TechnicalRatingKey[] = [
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
]

export const TECHNICAL_RATING_LABELS: Record<TechnicalRatingKey, string> = {
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

export interface TechnicalRatings {
  first_touch: number
  passing: number
  dribbling: number
  crossing: number
  shooting: number
  decision_making: number
  weak_foot: number
  acceleration: number
  agility: number
  confidence: number
}

export interface TrainingSession {
  id: string
  user_id: string
  session_date: string
  duration_min: number
  /** Session focus label (stored in position_played column for compatibility) */
  position_played: string
  intensity: number
  mood: TrainingMood
  energy_level: number
  technical_ratings: TechnicalRatings
  high_points: string | null
  work_on: string | null
  notes: string | null
  goal_id: string | null
  created_at: string
  updated_at: string
}

export interface CreateTrainingSessionInput {
  session_date: string
  duration_min: number
  focus: string
  intensity: number
  mood: TrainingMood
  energy_level: number
  high_points?: string
  work_on?: string
  notes?: string
  goal_id?: string | null
  technical_ratings?: TechnicalRatings
}

export interface UpdateTrainingSessionInput {
  session_date?: string
  duration_min?: number
  focus?: string
  intensity?: number
  mood?: TrainingMood
  energy_level?: number
  high_points?: string | null
  work_on?: string | null
  notes?: string | null
  goal_id?: string | null
  technical_ratings?: TechnicalRatings
}

export const TRAINING_MOODS: TrainingMood[] = ['great', 'good', 'okay', 'low', 'rough']

export const TRAINING_MOOD_LABELS: Record<TrainingMood, string> = {
  great: 'Great',
  good: 'Good',
  okay: 'Okay',
  low: 'Low',
  rough: 'Rough',
}

export const ENERGY_LABELS: Record<number, string> = {
  1: 'Drained',
  2: 'Low',
  3: 'Steady',
  4: 'Energized',
  5: 'Peak',
}

export function defaultTechnicalRatings(): TechnicalRatings {
  return {
    first_touch: 5,
    passing: 5,
    dribbling: 5,
    crossing: 5,
    shooting: 5,
    decision_making: 5,
    weak_foot: 5,
    acceleration: 5,
    agility: 5,
    confidence: 5,
  }
}
