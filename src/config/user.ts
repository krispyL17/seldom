import { UserProfileService } from '@services/userProfile'
import type { UserProfile } from '@/types'

/** Get current user profile or fallback values */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return UserProfileService.getUserProfile(userId)
}

/** Fallback user profile for when data is not available */
export const FALLBACK_USER_PROFILE = {
  firstName: 'User',
  sport: 'Athletics',
  position: '',
} as const

/** Time-aware greeting */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
