/** Distance constants in meters */
export const MILE_M = 1609.34
export const TWO_MILE_M = 3218.69
export const FIVE_K_M = 5000
export const TEN_K_M = 10000

export interface DistancePreset {
  id: string
  label: string
  meters: number
}

export const DISTANCE_PRESETS: DistancePreset[] = [
  { id: '1mi', label: '1 mile', meters: MILE_M },
  { id: '2mi', label: '2 mile', meters: TWO_MILE_M },
  { id: '5k', label: '5K', meters: FIVE_K_M },
  { id: '10k', label: '10K', meters: TEN_K_M },
]

export interface RunLog {
  id: string
  user_id: string
  run_date: string
  distance_m: number
  distance_label: string
  duration_sec: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateRunLogInput {
  run_date: string
  distance_m: number
  distance_label: string
  duration_sec: number
  notes?: string
}

export interface UpdateRunLogInput {
  run_date?: string
  distance_m?: number
  distance_label?: string
  duration_sec?: number
  notes?: string | null
}

export interface RunGoal {
  id: string
  user_id: string
  distance_m: number
  distance_label: string
  target_duration_sec: number
  deadline: string | null
  achieved_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateRunGoalInput {
  distance_m: number
  distance_label: string
  target_duration_sec: number
  deadline?: string
  notes?: string
}

export interface UpdateRunGoalInput {
  distance_m?: number
  distance_label?: string
  target_duration_sec?: number
  deadline?: string | null
  achieved_at?: string | null
  notes?: string | null
}

export interface TrainingPlanSuggestion {
  id: string
  title: string
  description: string
  url: string
  source: string
  matchReason: string
}
