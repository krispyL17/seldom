/** Placeholder user profile — will come from auth/Supabase later */
export const USER_PROFILE = {
  firstName: 'Krist',
  sport: 'Soccer',
  position: 'Central Midfielder',
} as const

/** Time-aware greeting */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
