/** Goal lifecycle status */
export type GoalStatus = 'active' | 'completed' | 'archived'

/** Single milestone within a goal */
export interface Milestone {
  id: string
  title: string
  completed: boolean
  target_date: string | null
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  target_date: string | null
  progress: number
  milestones: Milestone[]
  category: string | null
  status: GoalStatus
  created_at: string
  updated_at: string
}

export interface CreateGoalInput {
  title: string
  description?: string
  target_date?: string | null
  progress?: number
  milestones?: Milestone[]
  category?: string
  status?: GoalStatus
}

export interface UpdateGoalInput {
  title?: string
  description?: string | null
  target_date?: string | null
  progress?: number
  milestones?: Milestone[]
  category?: string | null
  status?: GoalStatus
}

export type GoalSortField = 'target_date' | 'progress' | 'title' | 'created_at'
export type GoalSortDirection = 'asc' | 'desc'

export interface GoalFilters {
  search: string
  status: GoalStatus | 'all'
  category: string | 'all'
}

export const DEFAULT_GOAL_FILTERS: GoalFilters = {
  search: '',
  status: 'active',
  category: 'all',
}

export const GOAL_CATEGORIES = [
  'Soccer',
  'Fitness',
  'Career',
  'Personal',
  'Health',
  'Skills',
  'Other',
] as const

export const GOAL_STATUSES: GoalStatus[] = ['active', 'completed', 'archived']
