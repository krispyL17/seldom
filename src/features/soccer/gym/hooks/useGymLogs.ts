import { useCallback, useEffect, useState } from 'react'
import type { GymLog } from '@analytics/types'
import { useAuth } from '@hooks/useAuth'
import {
  addLocalGymLog,
  deleteLocalGymLog,
  fetchLocalGymLogs,
} from '@services/analytics/gymLogsLocal'

export interface CreateGymLogInput {
  session_date: string
  duration_min: number
  workout_type?: string
  notes?: string
}

export function useGymLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<GymLog[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    if (!user) {
      setLogs([])
      setLoading(false)
      return
    }
    setLogs(fetchLocalGymLogs(user.id))
    setLoading(false)
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  const createLog = useCallback(
    async (input: CreateGymLogInput) => {
      if (!user) throw new Error('Not authenticated')
      const created = addLocalGymLog(user.id, input)
      setLogs((prev) => [created, ...prev])
      return created
    },
    [user],
  )

  const deleteLog = useCallback(async (id: string) => {
    deleteLocalGymLog(id)
    setLogs((prev) => prev.filter((log) => log.id !== id))
  }, [])

  return { logs, loading, reload, createLog, deleteLog }
}
