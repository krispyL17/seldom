/**
 * Global shared TypeScript types for Seldom.
 * Feature-specific types live inside each feature module.
 */

/** Base entity fields shared by all database records */
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

/** Generic async operation state for UI loading indicators */
export type AsyncState = 'idle' | 'loading' | 'success' | 'error'

/** Seldom feature module identifiers */
export type FeatureId =
  | 'home'
  | 'tasks'
  | 'goals'
  | 'college'
  | 'soccer'
  | 'journal'
  | 'analytics'
  | 'assistant'
  | 'settings'

/** Recovery status used in daily briefing */
export type RecoveryStatus = 'Good' | 'Moderate' | 'Poor'

/** Calendar event categories */
export type CalendarEventType = 'training' | 'recovery' | 'tactical' | 'match'

/** User profile data collected during onboarding */
export interface UserProfile extends BaseEntity {
  user_id: string
  first_name: string
  last_name?: string
  sport: string
  position?: string
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  goals: string[]
  target_training_days_per_week: number
  target_sleep_hours: number
  timezone: string
  completed_onboarding: boolean
}

/** Onboarding step validation results */
export interface OnboardingValidation {
  isValid: boolean
  errors: Record<string, string>
}
