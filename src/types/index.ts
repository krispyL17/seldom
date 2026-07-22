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
  | 'soccer'
  | 'journal'
  | 'analytics'
  | 'assistant'
  | 'settings'

/** Recovery status used in daily briefing */
export type RecoveryStatus = 'Good' | 'Moderate' | 'Poor'

/** Calendar event categories */
export type CalendarEventType = 'training' | 'recovery' | 'tactical' | 'match'
