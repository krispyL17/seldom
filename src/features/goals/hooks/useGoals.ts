import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { loadError } from '@lib/userFacingError'
import { goalService } from '@services/database/goals'
import type { CreateGoalInput, Goal, UpdateGoalInput } from '@features/goals/types'

export function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
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
      const data = await goalService.fetchAll()
      setGoals(data)
      setError(null)
    } catch (err) {
      setError(loadError('your goals', err))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadGoals()
  }, [loadGoals])

  const createGoal = useCallback(
    async (input: CreateGoalInput) => {
      if (!user) throw new Error('Not authenticated')
      const created = await goalService.create(user.id, input)
      setGoals((prev) => [created, ...prev])
      return created
    },
    [user],
  )

  const updateGoal = useCallback(async (id: string, input: UpdateGoalInput) => {
    const updated = await goalService.update(id, input)
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)))
    return updated
  }, [])

  const deleteGoal = useCallback(async (id: string) => {
    await goalService.delete(id)
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }, [])

  const archiveGoal = useCallback(async (id: string) => {
    const updated = await goalService.archive(id)
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)))
    return updated
  }, [])

  const restoreGoal = useCallback(async (id: string) => {
    const updated = await goalService.restore(id)
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)))
    return updated
  }, [])

  return {
    goals,
    loading,
    error,
    reload: loadGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    restoreGoal,
  }
}
