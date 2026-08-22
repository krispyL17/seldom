import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { loadError } from '@lib/userFacingError'
import { journalService } from '@services/database/journal'
import type {
  CreateJournalEntryInput,
  JournalEntry,
  UpdateJournalEntryInput,
} from '@features/journal/types'
import { sortEntriesChronologically } from '@features/journal/utils'

export function useJournal() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEntries = useCallback(async () => {
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await journalService.fetchAll()
      setEntries(sortEntriesChronologically(data))
      setError(null)
    } catch (err) {
      setError(loadError('your journal entries', err))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const createEntry = useCallback(
    async (input: CreateJournalEntryInput) => {
      if (!user) throw new Error('Not authenticated')
      const created = await journalService.create(user.id, input)
      setEntries((prev) => sortEntriesChronologically([created, ...prev]))
      return created
    },
    [user],
  )

  const updateEntry = useCallback(async (id: string, input: UpdateJournalEntryInput) => {
    const updated = await journalService.update(id, input)
    setEntries((prev) =>
      sortEntriesChronologically(prev.map((e) => (e.id === id ? updated : e))),
    )
    return updated
  }, [])

  const deleteEntry = useCallback(async (id: string) => {
    await journalService.delete(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return {
    entries,
    loading,
    error,
    reload: loadEntries,
    createEntry,
    updateEntry,
    deleteEntry,
  }
}
