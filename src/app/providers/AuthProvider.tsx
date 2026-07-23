import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { isSupabaseConfigured } from '@config/env'
import { authService } from '@services/auth'
import type { AuthContextValue, SignInCredentials, SignUpCredentials } from '@/types/auth'

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Provides authentication state to the entire app.
 * Restores sessions from browser storage for persistent login.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthContextValue['user']>(null)
  const [session, setSession] = useState<AuthContextValue['session']>(null)
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState<string | null>(null)

  const isConfigured = isSupabaseConfigured()

  const restoreSession = useCallback(async () => {
    if (!isConfigured) {
      setLoading(false)
      return
    }

    setLoading(true)
    setSessionError(null)

    try {
      const { session: initialSession, user: initialUser } = await authService.getSession()
      setSession(initialSession)
      setUser(initialUser)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not restore session'
      setSessionError(message)
    } finally {
      setLoading(false)
    }
  }, [isConfigured])

  useEffect(() => {
    void restoreSession()

    if (!isConfigured) return

    let mounted = true

    const unsubscribe = authService.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setSessionError(null)
      setLoading(false)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [isConfigured, restoreSession])

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    await authService.signIn(credentials)
  }, [])

  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    return authService.signUp(credentials)
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email)
  }, [])

  const updatePassword = useCallback(async (newPassword: string) => {
    await authService.updatePassword(newPassword)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      sessionError,
      isConfigured,
      isAuthenticated: user !== null,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
    }),
    [user, session, loading, sessionError, isConfigured, signIn, signUp, signOut, resetPassword, updatePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
