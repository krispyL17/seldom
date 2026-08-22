import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { loadError } from '@lib/userFacingError'
import { trainingSessionService } from '@services/database/trainingSessions'
import { goalService } from '@services/database/goals'
import type {
  CreateTrainingSessionInput,
  TrainingSession,
  UpdateTrainingSessionInput,
} from '@features/soccer/training/types'
import { sortSessionsChronologically } from '@features/soccer/training/utils'
import { triggerAthleteSync } from '../../athlete/streakSyncBridge'

export function useTrainingSessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSessions = useCallback(async () => {
    if (!user) {
      setSessions([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await trainingSessionService.fetchAll()
      setSessions(sortSessionsChronologically(data))
      setError(null)
    } catch (err) {
      setError(loadError('training sessions', err))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const createSession = useCallback(
    async (input: CreateTrainingSessionInput) => {
      if (!user) throw new Error('Not authenticated')
      const created = await trainingSessionService.create(user.id, input)
      if (input.goal_id) {
        try {
          await goalService.bumpProgress(input.goal_id, 5)
        } catch {
          /* non-blocking */
        }
      }
      setSessions((prev) => sortSessionsChronologically([created, ...prev]))
      triggerAthleteSync()
      return created
    },
    [user],
  )

  const updateSession = useCallback(async (id: string, input: UpdateTrainingSessionInput) => {
    const updated = await trainingSessionService.update(id, input)
    setSessions((prev) =>
      sortSessionsChronologically(prev.map((s) => (s.id === id ? updated : s))),
    )
    triggerAthleteSync()
    return updated
  }, [])

  const deleteSession = useCallback(async (id: string) => {
    await trainingSessionService.delete(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
    triggerAthleteSync()
  }, [])

  return {
    sessions,
    loading,
    error,
    reload: loadSessions,
    createSession,
    updateSession,
    deleteSession,
  }
}
