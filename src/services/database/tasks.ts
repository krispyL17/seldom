import { getSupabaseClient } from '@lib/supabase'
import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '@features/tasks/types'
import { goalService } from '@services/database/goals'

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

/**
 * Task database service — all Supabase queries for the tasks table.
 */
export const taskService = {
  async fetchAll(): Promise<Task[]> {
    const client = requireClient()
    const { data, error } = await client
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Task[]
  },

  async create(userId: string, input: CreateTaskInput): Promise<Task> {
    const client = requireClient()
    const { data, error } = await client
      .from('tasks')
      .insert({
        user_id: userId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        priority: input.priority ?? 'medium',
        category: input.category?.trim() || null,
        deadline: input.deadline ?? null,
        estimated_duration: input.estimated_duration ?? null,
        notes: input.notes?.trim() || null,
        goal_id: input.goal_id ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return data as Task
  },

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const client = requireClient()
    const payload: UpdateTaskInput = { ...input }

    if (payload.title !== undefined) {
      payload.title = payload.title.trim()
    }
    if (payload.description !== undefined) {
      payload.description = payload.description?.trim() || null
    }
    if (payload.category !== undefined) {
      payload.category = payload.category?.trim() || null
    }
    if (payload.notes !== undefined) {
      payload.notes = payload.notes?.trim() || null
    }

    const { data, error } = await client
      .from('tasks')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Task
  },

  async delete(id: string): Promise<void> {
    const client = requireClient()
    const { error } = await client.from('tasks').delete().eq('id', id)
    if (error) throw error
  },

  async toggleComplete(id: string, completed: boolean): Promise<Task> {
    const client = requireClient()
    const { data: existing, error: fetchError } = await client
      .from('tasks')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) throw fetchError
    const updated = await taskService.update(id, { completed })

    if (completed && existing?.goal_id && !existing.completed) {
      try {
        await goalService.bumpProgress(existing.goal_id, 10)
      } catch {
        /* non-blocking */
      }
    }

    return updated
  },
}
