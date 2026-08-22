import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { ErrorPanel } from '@components/ui/ErrorPanel'
import { AuthLoadingScreen } from './AuthLoadingScreen'

/**
 * Protects app routes — redirects unauthenticated users to login.
 * Skips auth when Supabase is not configured (local dev fallback).
 */
export function ProtectedRoute() {
  const { isAuthenticated, loading, sessionError, isConfigured } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen />

  if (sessionError && isConfigured) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <ErrorPanel
          title="Couldn't restore your session"
          message={sessionError}
          onRetry={() => window.location.reload()}
          retryLabel="Refresh page"
        />
      </div>
    )
  }

  if (isConfigured && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
