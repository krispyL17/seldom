/**
 * Route guard that ensures users complete onboarding before accessing the app.
 * Redirects to onboarding flow if profile setup is incomplete.
 */

import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { UserProfileService } from '@services/userProfile'
import { AuthLoadingScreen } from './AuthLoadingScreen'

interface OnboardingGuardProps {
  children: React.ReactNode
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, loading: authLoading } = useAuth()
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null)
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!user?.id) {
        setCheckingOnboarding(false)
        return
      }

      try {
        const completed = await UserProfileService.hasCompletedOnboarding(user.id)
        setHasCompletedOnboarding(completed)
      } catch (error) {
        console.error('Failed to check onboarding status:', error)
        // On error, assume onboarding is not complete to be safe
        setHasCompletedOnboarding(false)
      } finally {
        setCheckingOnboarding(false)
      }
    }

    checkOnboardingStatus()
  }, [user?.id])

  // Show loading screen while checking auth or onboarding status
  if (authLoading || checkingOnboarding) {
    return <AuthLoadingScreen />
  }

  // If user is not authenticated, let the ProtectedRoute handle the redirect
  if (!user) {
    return <>{children}</>
  }

  // If user hasn't completed onboarding, redirect to onboarding flow
  if (hasCompletedOnboarding === false) {
    return <Navigate to="/onboarding" replace />
  }

  // User is authenticated and has completed onboarding
  return <>{children}</>
}