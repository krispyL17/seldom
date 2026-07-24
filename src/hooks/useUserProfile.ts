/**
 * Hook for managing user profile data and onboarding state.
 */

import { useEffect, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { UserProfileService } from '@services/userProfile'
import type { UserProfile } from '@/types'

interface UseUserProfileReturn {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  hasCompletedOnboarding: boolean
  refetch: () => Promise<void>
}

export function useUserProfile(): UseUserProfileReturn {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!user?.id) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setError(null)
      const userProfile = await UserProfileService.getUserProfile(user.id)
      setProfile(userProfile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [user?.id])

  return {
    profile,
    loading,
    error,
    hasCompletedOnboarding: profile?.completed_onboarding ?? false,
    refetch: fetchProfile
  }
}