import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { loadError } from '@lib/userFacingError'
import { taskService } from '@services/database/tasks'
import type { CreateTaskInput, Task, UpdateTaskInput } from '@features/tasks/types'

export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await taskService.fetchAll()
      setTasks(data)
      setError(null)
    } catch (err) {
      setError(loadError('your tasks', err))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      if (!user) throw new Error('Not authenticated')
      const created = await taskService.create(user.id, input)
      setTasks((prev) => [created, ...prev])
      return created
    },
    [user],
  )

  const updateTask = useCallback(async (id: string, input: UpdateTaskInput) => {
    const updated = await taskService.update(id, input)
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
    return updated
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    await taskService.delete(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toggleComplete = useCallback(
    async (id: string, completed: boolean) => {
      return updateTask(id, { completed })
    },
    [updateTask],
  )

  return {
    tasks,
    loading,
    error,
    reload: loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
  }
}
