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
import {
  TUTORIAL_RESET_STORAGE_KEY,
  TUTORIAL_RESET_VERSION,
} from '@config/tutorialReset'
import { useAuth } from '@hooks/useAuth'
import { userPreferencesService } from '@services/database/userPreferences'
import { clearLocalAppData } from '@lib/clearLocalAppData'
import { SIDEBAR_NAV } from '@config/navigation'
import { applyThemeFromPreferences } from '@lib/theme'
import { localPreferencesService } from '@services/preferences/localPreferences'
import type {
  DistanceUnit,
  NavTabColors,
  ThemeAppearance,
  ThemePalette,
  UserPreferences,
  UserPreferencesPatch,
} from '@/types/userPreferences'

interface UserPreferencesContextValue {
  preferences: UserPreferences | null
  loading: boolean
  error: string | null
  hobbyTabLabel: string
  hobbyPassion: string
  theme: ThemeAppearance
  themePalette: ThemePalette
  navTabColors: NavTabColors
  animationsEnabled: boolean
  tutorialCompleted: boolean
  distanceUnit: DistanceUnit
  collegeEnabled: boolean
  updatePreferences: (patch: UserPreferencesPatch) => Promise<void>
  completeTutorial: (patch?: UserPreferencesPatch) => Promise<void>
  markTabIntroComplete: (tabId: string) => Promise<void>
  reload: () => Promise<void>
  openTutorial: () => void
  tutorialOpen: boolean
  closeTutorial: () => void
  browserNotificationsEnabled: boolean
  emailNotificationsEnabled: boolean
  reminderLeadMinutes: number
}

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null)

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

  const applyLocalTutorialResetIfNeeded = useCallback((id: string) => {
    try {
      const applied = localStorage.getItem(TUTORIAL_RESET_STORAGE_KEY)
      if (applied === String(TUTORIAL_RESET_VERSION)) return null
      clearLocalAppData()
      localStorage.setItem(TUTORIAL_RESET_STORAGE_KEY, String(TUTORIAL_RESET_VERSION))
      if (!isSupabaseConfigured()) {
        return localPreferencesService.resetTutorialState(id)
      }
      return null
    } catch {
      return null
    }
  }, [])

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setPreferences(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const localReset =
        user?.id != null ? applyLocalTutorialResetIfNeeded(user.id) : applyLocalTutorialResetIfNeeded('local')

      if (isSupabaseConfigured() && user?.id) {
        const data = await userPreferencesService.ensure(user.id)
        setPreferences(data)
      } else if (user?.id) {
        setPreferences(localReset ?? localPreferencesService.fetch(user.id))
      } else {
        setPreferences(localReset ?? localPreferencesService.fetch('local'))
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load preferences'
      setError(message)
      const reset = applyLocalTutorialResetIfNeeded(userId)
      setPreferences(reset ?? localPreferencesService.fetch(userId))
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id, userId, applyLocalTutorialResetIfNeeded])

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
    const navIds = SIDEBAR_NAV.map((item) => item.id)
    applyThemeFromPreferences(
      preferences.theme_palette,
      preferences.theme,
      preferences.animations_enabled,
      preferences.nav_tab_colors,
      navIds,
    )
  }, [preferences])

  useEffect(() => {
    if (!preferences || preferences.theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const navIds = SIDEBAR_NAV.map((item) => item.id)
    const handler = () =>
      applyThemeFromPreferences(
        preferences.theme_palette,
        'system',
        preferences.animations_enabled,
        preferences.nav_tab_colors,
        navIds,
      )
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

  const markTabIntroComplete = useCallback(
    async (tabId: string) => {
      if (!isAuthenticated) return

      const id = user?.id ?? 'local'
      const next =
        isSupabaseConfigured() && user?.id
          ? await userPreferencesService.markTabIntroComplete(user.id, tabId)
          : localPreferencesService.markTabIntroComplete(id, tabId)

      setPreferences(next)
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
      themePalette: preferences?.theme_palette ?? 'classic',
      navTabColors: preferences?.nav_tab_colors ?? {},
      animationsEnabled: preferences?.animations_enabled ?? true,
      tutorialCompleted: Boolean(preferences?.app_tutorial_completed_at),
      browserNotificationsEnabled: preferences?.browser_notifications_enabled ?? false,
      emailNotificationsEnabled: preferences?.email_notifications_enabled ?? false,
      reminderLeadMinutes: preferences?.reminder_lead_minutes ?? 60,
      distanceUnit: preferences?.distance_unit ?? 'mi',
      collegeEnabled: preferences?.college_enabled ?? false,
      updatePreferences,
      completeTutorial,
      markTabIntroComplete,
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
      markTabIntroComplete,
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
