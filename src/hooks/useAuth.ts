import { useContext } from 'react'
import { AuthContext } from '@app/providers/AuthProvider'
import type { AuthContextValue } from '@/types/auth'

/**
 * Hook to access authentication state and actions.
 *
 * Must be used inside <AuthProvider>.
 *
 * @example
 * const { user, isAuthenticated, signOut } = useAuth()
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
