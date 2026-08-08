import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { soccerMatchService } from '@services/database/soccerMatches'
import type { CreateSoccerMatchInput, SoccerMatch, UpdateSoccerMatchInput } from '../types'
import { triggerAthleteSync } from '../../athlete/streakSyncBridge'

export function useSoccerMatches() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<SoccerMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!user) {
      setMatches([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await soccerMatchService.fetchAll()
      setMatches(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void reload()
  }, [reload])

  const createMatch = useCallback(
    async (input: CreateSoccerMatchInput) => {
      if (!user) throw new Error('Not authenticated')
      const created = await soccerMatchService.create(user.id, input)
      setMatches((prev) => [created, ...prev])
      triggerAthleteSync()
      return created
    },
    [user],
  )

  const updateMatch = useCallback(async (id: string, input: UpdateSoccerMatchInput) => {
    const updated = await soccerMatchService.update(id, input)
    setMatches((prev) => prev.map((m) => (m.id === id ? updated : m)))
    triggerAthleteSync()
    return updated
  }, [])

  const deleteMatch = useCallback(async (id: string) => {
    await soccerMatchService.delete(id)
    setMatches((prev) => prev.filter((m) => m.id !== id))
    triggerAthleteSync()
  }, [])

  return { matches, loading, error, reload, createMatch, updateMatch, deleteMatch }
}
