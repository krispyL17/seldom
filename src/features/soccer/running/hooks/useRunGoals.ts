import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { runGoalService } from '@services/database/runLogs'
import type { CreateRunGoalInput, RunGoal, UpdateRunGoalInput } from '../types'

export function useRunGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<RunGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadGoals = useCallback(async () => {
    if (!user) {
      setGoals([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await runGoalService.fetchAll()
      setGoals(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadGoals()
  }, [loadGoals])

  const createGoal = useCallback(
    async (input: CreateRunGoalInput) => {
      if (!user) throw new Error('Not authenticated')
      const created = await runGoalService.create(user.id, input)
      setGoals((prev) => [created, ...prev])
      return created
    },
    [user],
  )

  const updateGoal = useCallback(async (id: string, input: UpdateRunGoalInput) => {
    const updated = await runGoalService.update(id, input)
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)))
    return updated
  }, [])

  const deleteGoal = useCallback(async (id: string) => {
    await runGoalService.delete(id)
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }, [])

  return { goals, loading, error, reload: loadGoals, createGoal, updateGoal, deleteGoal }
}
