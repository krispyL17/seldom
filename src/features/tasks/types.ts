/**
 * Task feature types — aligned with the Supabase `tasks` table.
 */

export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  priority: TaskPriority
  category: string | null
  deadline: string | null
  completed: boolean
  estimated_duration: number | null
  notes: string | null
  goal_id: string | null
  created_at: string
  updated_at: string
}

/** Fields required to create a task */
export interface CreateTaskInput {
  title: string
  description?: string
  priority?: TaskPriority
  category?: string
  deadline?: string | null
  estimated_duration?: number | null
  notes?: string
  goal_id?: string | null
}

/** Fields that can be updated on an existing task */
export interface UpdateTaskInput {
  title?: string
  description?: string | null
  priority?: TaskPriority
  category?: string | null
  deadline?: string | null
  completed?: boolean
  estimated_duration?: number | null
  notes?: string | null
  goal_id?: string | null
}

export type TaskSortField = 'deadline' | 'priority' | 'title' | 'created_at'
export type TaskSortDirection = 'asc' | 'desc'

export interface TaskFilters {
  search: string
  priority: TaskPriority | 'all'
  category: string | 'all'
  status: 'all' | 'active' | 'completed'
}

export const DEFAULT_TASK_FILTERS: TaskFilters = {
  search: '',
  priority: 'all',
  category: 'all',
  status: 'active',
}

export const TASK_PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export const TASK_CATEGORIES = [
  'Training',
  'Recovery',
  'Personal',
  'Work',
  'Performance',
  'Health',
  'Other',
] as const
