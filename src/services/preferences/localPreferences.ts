import {
  DEFAULT_USER_PREFERENCES,
  type UserPreferences,
  type UserPreferencesPatch,
} from '@/types/userPreferences'

const STORAGE_KEY = 'seldom-user-preferences'

function readRaw(): Omit<UserPreferences, 'user_id'> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Omit<UserPreferences, 'user_id'>
  } catch {
    return null
  }
}

export const localPreferencesService = {
  fetch(userId: string): UserPreferences {
    const stored = readRaw()
    const now = new Date().toISOString()
    return {
      user_id: userId,
      ...DEFAULT_USER_PREFERENCES,
      ...stored,
      updated_at: stored?.updated_at ?? now,
    }
  },

  patch(userId: string, payload: UserPreferencesPatch): UserPreferences {
    const current = localPreferencesService.fetch(userId)
    const next: UserPreferences = {
      ...current,
      ...payload,
      user_id: userId,
      updated_at: new Date().toISOString(),
    }
    const { user_id: _, ...rest } = next
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
    return next
  },

  completeTutorial(userId: string, patch: UserPreferencesPatch): UserPreferences {
    return localPreferencesService.patch(userId, {
      ...patch,
      app_tutorial_completed_at: new Date().toISOString(),
    })
  },

  markTabIntroComplete(userId: string, tabId: string): UserPreferences {
    const current = localPreferencesService.fetch(userId)
    const tab_intros_completed = {
      ...current.tab_intros_completed,
      [tabId]: new Date().toISOString(),
    }
    return localPreferencesService.patch(userId, { tab_intros_completed })
  },

  resetTutorialState(userId: string): UserPreferences {
    return localPreferencesService.patch(userId, {
      app_tutorial_completed_at: null,
      tab_intros_completed: {},
      hobby_tab_label: 'Performance',
      hobby_passion: '',
      college_enabled: false,
    })
  },
}
