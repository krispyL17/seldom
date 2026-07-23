import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { isSupabaseConfigured } from '@config/env'
import { useAuth } from '@hooks/useAuth'
import { userPreferencesService } from '@services/database/userPreferences'
import { localPreferencesService } from '@services/preferences/localPreferences'
import type { AppTheme, UserPreferences, UserPreferencesPatch } from '@/types/userPreferences'

interface UserPreferencesContextValue {
  preferences: UserPreferences | null
  loading: boolean
  error: string | null
  hobbyTabLabel: string
  hobbyPassion: string
  theme: AppTheme
  animationsEnabled: boolean
  tutorialCompleted: boolean
  updatePreferences: (patch: UserPreferencesPatch) => Promise<void>
  completeTutorial: (patch?: UserPreferencesPatch) => Promise<void>
  reload: () => Promise<void>
  openTutorial: () => void
  tutorialOpen: boolean
  closeTutorial: () => void
  browserNotificationsEnabled: boolean
  emailNotificationsEnabled: boolean
  reminderLeadMinutes: number
}

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null)

function applyThemeToDocument(theme: AppTheme, animationsEnabled: boolean) {
  const root = document.documentElement
  let resolved: 'dark' | 'light' = theme === 'light' ? 'light' : 'dark'

  if (theme === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  root.dataset.theme = resolved
  root.classList.toggle('animations-disabled', !animationsEnabled)
  root.style.colorScheme = resolved
}

interface UserPreferencesProviderProps {
  children: ReactNode
}

export function UserPreferencesProvider({ children }: UserPreferencesProviderProps) {
  const { user, isAuthenticated } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tutorialOpen, setTutorialOpen] = useState(false)

  const userId = user?.id ?? 'local'

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setPreferences(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (isSupabaseConfigured() && user?.id) {
        const data = await userPreferencesService.ensure(user.id)
        setPreferences(data)
      } else if (user?.id) {
        setPreferences(localPreferencesService.fetch(user.id))
      } else {
        setPreferences(localPreferencesService.fetch('local'))
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load preferences'
      setError(message)
      setPreferences(localPreferencesService.fetch(userId))
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id, userId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (loading || !preferences || !isAuthenticated) return
    if (!preferences.app_tutorial_completed_at) {
      setTutorialOpen(true)
    }
  }, [loading, preferences, isAuthenticated])

  useEffect(() => {
    if (!preferences) return
    applyThemeToDocument(preferences.theme, preferences.animations_enabled)
  }, [preferences])

  useEffect(() => {
    if (!preferences || preferences.theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyThemeToDocument('system', preferences.animations_enabled)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [preferences])

  const updatePreferences = useCallback(
    async (patch: UserPreferencesPatch) => {
      if (!user?.id && !isAuthenticated) return

      const id = user?.id ?? 'local'
      const next =
        isSupabaseConfigured() && user?.id
          ? await userPreferencesService.patch(user.id, patch)
          : localPreferencesService.patch(id, patch)

      setPreferences(next)
    },
    [isAuthenticated, user?.id],
  )

  const completeTutorial = useCallback(
    async (patch: UserPreferencesPatch = {}) => {
      if (!isAuthenticated) return

      const id = user?.id ?? 'local'
      const next =
        isSupabaseConfigured() && user?.id
          ? await userPreferencesService.completeTutorial(user.id, patch)
          : localPreferencesService.completeTutorial(id, patch)

      setPreferences(next)
      setTutorialOpen(false)
    },
    [isAuthenticated, user?.id],
  )

  const value = useMemo<UserPreferencesContextValue>(
    () => ({
      preferences,
      loading,
      error,
      hobbyTabLabel: preferences?.hobby_tab_label ?? 'Performance',
      hobbyPassion: preferences?.hobby_passion ?? '',
      theme: preferences?.theme ?? 'dark',
      animationsEnabled: preferences?.animations_enabled ?? true,
      tutorialCompleted: Boolean(preferences?.app_tutorial_completed_at),
      browserNotificationsEnabled: preferences?.browser_notifications_enabled ?? false,
      emailNotificationsEnabled: preferences?.email_notifications_enabled ?? false,
      reminderLeadMinutes: preferences?.reminder_lead_minutes ?? 60,
      updatePreferences,
      completeTutorial,
      reload: load,
      openTutorial: () => setTutorialOpen(true),
      tutorialOpen,
      closeTutorial: () => setTutorialOpen(false),
    }),
    [
      preferences,
      loading,
      error,
      updatePreferences,
      completeTutorial,
      load,
      tutorialOpen,
    ],
  )

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  )
}

export function useUserPreferences(): UserPreferencesContextValue {
  const ctx = useContext(UserPreferencesContext)
  if (!ctx) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider')
  }
  return ctx
}
