import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { AuthLoadingScreen } from './AuthLoadingScreen'

/**
 * Protects app routes — redirects unauthenticated users to login.
 * Skips auth when Supabase is not configured (local dev fallback).
 */
export function ProtectedRoute() {
  const { isAuthenticated, loading, isConfigured } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoadingScreen />

  if (isConfigured && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
