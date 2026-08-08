import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AiFloatingSessionState, AiSessionKind } from '../types'

interface AiFloatingSessionContextValue {
  sessions: Partial<Record<AiSessionKind, AiFloatingSessionState>>
  patchSession: (kind: AiSessionKind, patch: Partial<AiFloatingSessionState>) => void
  clearSession: (kind: AiSessionKind) => void
}

const AiFloatingSessionContext = createContext<AiFloatingSessionContextValue | null>(null)

export function AiFloatingSessionProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Partial<Record<AiSessionKind, AiFloatingSessionState>>>({})

  const patchSession = useCallback((kind: AiSessionKind, patch: Partial<AiFloatingSessionState>) => {
    setSessions((prev) => {
      const current = prev[kind]
      const next: AiFloatingSessionState = {
        kind,
        origin: patch.origin ?? current?.origin ?? { pathname: '/', search: '' },
        label: patch.label ?? current?.label ?? 'Seldom AI',
        isBusy: patch.isBusy ?? current?.isBusy ?? false,
        engaged: patch.engaged ?? current?.engaged ?? false,
      }
      return { ...prev, [kind]: next }
    })
  }, [])

  const clearSession = useCallback((kind: AiSessionKind) => {
    setSessions((prev) => {
      if (!prev[kind]) return prev
      const next = { ...prev }
      delete next[kind]
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ sessions, patchSession, clearSession }),
    [sessions, patchSession, clearSession],
  )

  return (
    <AiFloatingSessionContext.Provider value={value}>{children}</AiFloatingSessionContext.Provider>
  )
}

export function useAiFloatingSessionRegistry() {
  const ctx = useContext(AiFloatingSessionContext)
  if (!ctx) throw new Error('useAiFloatingSessionRegistry must be used within AiFloatingSessionProvider')
  return ctx
}
