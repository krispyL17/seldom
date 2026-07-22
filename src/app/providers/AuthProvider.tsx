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

  const isConfigured = isSupabaseConfigured()

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }

    let mounted = true

    authService
      .getSession()
      .then(({ session: initialSession, user: initialUser }) => {
        if (!mounted) return
        setSession(initialSession)
        setUser(initialUser)
        setLoading(false)
      })
      .catch(() => {
        if (!mounted) return
        setLoading(false)
      })

    const unsubscribe = authService.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [isConfigured])

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
      isConfigured,
      isAuthenticated: user !== null,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
    }),
    [user, session, loading, isConfigured, signIn, signUp, signOut, resetPassword, updatePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
