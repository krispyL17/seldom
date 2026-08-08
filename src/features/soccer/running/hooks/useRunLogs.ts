import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { runLogService } from '@services/database/runLogs'
import type { CreateRunLogInput, RunLog, UpdateRunLogInput } from '../types'
import { sortRunsChronologically } from '../utils'
import { triggerAthleteSync } from '../../athlete/streakSyncBridge'

export function useRunLogs() {
  const { user } = useAuth()
  const [runs, setRuns] = useState<RunLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRuns = useCallback(async () => {
    if (!user) {
      setRuns([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await runLogService.fetchAll()
      setRuns(sortRunsChronologically(data))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load runs')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadRuns()
  }, [loadRuns])

  const createRun = useCallback(
    async (input: CreateRunLogInput) => {
      if (!user) throw new Error('Not authenticated')
      const created = await runLogService.create(user.id, input)
      setRuns((prev) => sortRunsChronologically([created, ...prev]))
      triggerAthleteSync()
      return created
    },
    [user],
  )

  const updateRun = useCallback(async (id: string, input: UpdateRunLogInput) => {
    const updated = await runLogService.update(id, input)
    setRuns((prev) => sortRunsChronologically(prev.map((r) => (r.id === id ? updated : r))))
    triggerAthleteSync()
    return updated
  }, [])

  const deleteRun = useCallback(async (id: string) => {
    await runLogService.delete(id)
    setRuns((prev) => prev.filter((r) => r.id !== id))
    triggerAthleteSync()
  }, [])

  return { runs, loading, error, reload: loadRuns, createRun, updateRun, deleteRun }
}
