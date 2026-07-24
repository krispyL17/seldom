/**
 * User profile service for managing onboarding and profile data.
 * Handles validation, storage, and retrieval of user profile information.
 */

import type { UserProfile, OnboardingValidation } from '@/types'

// Mock storage - in production this would be Supabase
const STORAGE_KEY = 'seldom_user_profile'

export interface OnboardingData {
  first_name: string
  last_name?: string
  sport: string
  position?: string
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  goals: string[]
  target_training_days_per_week: number
  target_sleep_hours: number
  timezone: string
}

export class UserProfileService {
  /**
   * Get the current user's profile
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null
      
      const profile = JSON.parse(stored) as UserProfile
      return profile.user_id === userId ? profile : null
    } catch {
      return null
    }
  }

  /**
   * Check if user has completed onboarding
   */
  static async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId)
    return profile?.completed_onboarding ?? false
  }

  /**
   * Validate onboarding data
   */
  static validateOnboardingData(data: OnboardingData): OnboardingValidation {
    const errors: Record<string, string> = {}

    // Validate first name
    if (!data.first_name?.trim()) {
      errors.first_name = 'First name is required'
    } else if (data.first_name.length < 2) {
      errors.first_name = 'First name must be at least 2 characters'
    } else if (data.first_name.length > 50) {
      errors.first_name = 'First name must be less than 50 characters'
    }

    // Validate last name if provided
    if (data.last_name && data.last_name.length > 50) {
      errors.last_name = 'Last name must be less than 50 characters'
    }

    // Validate sport
    if (!data.sport?.trim()) {
      errors.sport = 'Sport is required'
    } else if (data.sport.length < 3) {
      errors.sport = 'Sport name must be at least 3 characters'
    } else if (data.sport.length > 30) {
      errors.sport = 'Sport name must be less than 30 characters'
    }

    // Validate position if provided
    if (data.position && data.position.length > 50) {
      errors.position = 'Position must be less than 50 characters'
    }

    // Validate goals
    if (!Array.isArray(data.goals) || data.goals.length === 0) {
      errors.goals = 'At least one goal is required'
    } else {
      const invalidGoals = data.goals.filter(
        goal => !goal?.trim() || goal.length < 5 || goal.length > 200
      )
      if (invalidGoals.length > 0) {
        errors.goals = 'Each goal must be between 5-200 characters'
      }
      if (data.goals.length > 10) {
        errors.goals = 'Maximum 10 goals allowed'
      }
    }

    // Validate training days per week
    if (typeof data.target_training_days_per_week !== 'number' || 
        data.target_training_days_per_week < 1 || 
        data.target_training_days_per_week > 7) {
      errors.target_training_days_per_week = 'Training days must be between 1-7 per week'
    }

    // Validate sleep hours
    if (typeof data.target_sleep_hours !== 'number' || 
        data.target_sleep_hours < 4 || 
        data.target_sleep_hours > 12) {
      errors.target_sleep_hours = 'Sleep hours must be between 4-12 hours per night'
    }

    // Validate timezone
    if (!data.timezone?.trim()) {
      errors.timezone = 'Timezone is required'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Save user profile after onboarding
   */
  static async saveUserProfile(userId: string, data: OnboardingData): Promise<UserProfile> {
    const validation = this.validateOnboardingData(data)
    
    if (!validation.isValid) {
      throw new Error(`Invalid onboarding data: ${Object.values(validation.errors).join(', ')}`)
    }

    const now = new Date().toISOString()
    const profile: UserProfile = {
      id: `profile_${userId}`,
      user_id: userId,
      created_at: now,
      updated_at: now,
      completed_onboarding: true,
      ...data
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    return profile
  }

  /**
   * Clear user profile (for testing/logout)
   */
  static async clearUserProfile(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY)
  }
}