import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { AuthLoadingScreen } from './AuthLoadingScreen'

/**
 * Guest-only routes — redirects authenticated users to home.
 */
export function GuestRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <AuthLoadingScreen />

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
