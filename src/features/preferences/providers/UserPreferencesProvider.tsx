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
import { appTutorialConfig } from '@config/onboardingPrompts'
import {
  APP_TUTORIAL_TAB_KEY,
  shouldShowAppTutorial,
  tabIntroVersionPatch,
} from '@features/onboarding/onboardingVersion'
import { useAuth } from '@hooks/useAuth'
import { userPreferencesService } from '@services/database/userPreferences'
import { loadError } from '@lib/userFacingError'
import { clearLocalAppData } from '@lib/clearLocalAppData'
import { ALL_NAV_TAB_IDS } from '@config/navigation'
import { applyThemeFromPreferences } from '@lib/theme'
import { localPreferencesService } from '@services/preferences/localPreferences'
import type {
  CustomThemes,
  DistanceUnit,
  NavTabColors,
  OverviewInsightMode,
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
  customThemes: CustomThemes
  navTabColors: NavTabColors
  animationsEnabled: boolean
  tutorialCompleted: boolean
  distanceUnit: DistanceUnit
  collegeEnabled: boolean
  overviewInsightMode: OverviewInsightMode
  updatePreferences: (patch: UserPreferencesPatch) => Promise<void>
  completeTutorial: (patch?: UserPreferencesPatch) => Promise<void>
  dismissTutorial: () => Promise<void>
  markTabIntroComplete: (tabId: string, version?: number) => Promise<void>
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

  // Apply initial theme on mount to prevent flash of default theme
  useEffect(() => {
    if (loading || preferences) return
    
    try {
      // Try to load and apply stored preferences immediately
      const storedPrefs = localPreferencesService.fetch(userId)
      if (storedPrefs) {
        const navIds = ALL_NAV_TAB_IDS
        applyThemeFromPreferences(
          storedPrefs.theme_palette,
          storedPrefs.theme,
          storedPrefs.animations_enabled,
          storedPrefs.nav_tab_colors,
          navIds,
          storedPrefs.custom_themes,
        )
      }
    } catch {
      // If we can't load preferences, just continue with defaults
    }
  }, [loading, preferences, userId])

  const applyLocalTutorialResetIfNeeded = useCallback((id: string) => {
    try {
      const applied = localStorage.getItem(TUTORIAL_RESET_STORAGE_KEY)
      if (applied === String(TUTORIAL_RESET_VERSION)) return null
      localStorage.setItem(TUTORIAL_RESET_STORAGE_KEY, String(TUTORIAL_RESET_VERSION))
      if (!isSupabaseConfigured()) {
        clearLocalAppData()
        return localPreferencesService.resetTutorialState(id)
      }
      // Supabase users: onboarding re-prompts are version-driven in the DB, not local wipes.
      return null
    } catch {
      return null
    }
  }, [])

  const load = useCallback(async () => {
    // Always load preferences, even for unauthenticated users (use local storage)
    setLoading(true)
    setError(null)

    try {
      const localReset =
        user?.id != null ? applyLocalTutorialResetIfNeeded(user.id) : applyLocalTutorialResetIfNeeded('local')

      if (isSupabaseConfigured() && user?.id && isAuthenticated) {
        const data = await userPreferencesService.ensure(user.id)
        setPreferences(data)
      } else {
        // Use local storage for unauthenticated users or when Supabase is not configured
        const id = user?.id ?? 'local'
        setPreferences(localReset ?? localPreferencesService.fetch(id))
      }
    } catch (err) {
      const message = loadError('your preferences', err)
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
    if (
      shouldShowAppTutorial(
        preferences.tab_intros_completed,
        preferences.app_tutorial_completed_at,
      )
    ) {
      setTutorialOpen(true)
    }
  }, [loading, preferences, isAuthenticated])

  useEffect(() => {
    if (!preferences) return
    const navIds = ALL_NAV_TAB_IDS
    
    // Apply theme immediately to avoid flash of default theme
    requestAnimationFrame(() => {
      applyThemeFromPreferences(
        preferences.theme_palette,
        preferences.theme,
        preferences.animations_enabled,
        preferences.nav_tab_colors,
        navIds,
        preferences.custom_themes,
      )
    })
  }, [preferences])

  useEffect(() => {
    if (!preferences || preferences.theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const navIds = ALL_NAV_TAB_IDS
    const handler = () =>
      applyThemeFromPreferences(
        preferences.theme_palette,
        'system',
        preferences.animations_enabled,
        preferences.nav_tab_colors,
        navIds,
        preferences.custom_themes,
      )
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [preferences])

  const updatePreferences = useCallback(
    async (patch: UserPreferencesPatch) => {
      const id = user?.id ?? 'local'
      const next =
        isSupabaseConfigured() && user?.id && isAuthenticated
          ? await userPreferencesService.patch(user.id, patch)
          : localPreferencesService.patch(id, patch)

      setPreferences(next)
    },
    [isAuthenticated, user?.id],
  )

  const completeTutorial = useCallback(
    async (patch: UserPreferencesPatch = {}) => {
      const id = user?.id ?? 'local'
      const version = appTutorialConfig.version
      const tab_intros_completed = tabIntroVersionPatch(
        patch.tab_intros_completed ?? preferences?.tab_intros_completed ?? {},
        APP_TUTORIAL_TAB_KEY,
        version,
      )
      const next =
        isSupabaseConfigured() && user?.id && isAuthenticated
          ? await userPreferencesService.completeTutorial(user.id, {
              ...patch,
              tab_intros_completed,
            })
          : localPreferencesService.completeTutorial(id, {
              ...patch,
              tab_intros_completed,
            })

      setPreferences(next)
      setTutorialOpen(false)
    },
    [isAuthenticated, user?.id, preferences?.tab_intros_completed],
  )

  const dismissTutorial = useCallback(async () => {
    await completeTutorial()
  }, [completeTutorial])

  const markTabIntroComplete = useCallback(
    async (tabId: string, version = 1) => {
      const id = user?.id ?? 'local'
      const next =
        isSupabaseConfigured() && user?.id && isAuthenticated
          ? await userPreferencesService.markTabIntroComplete(user.id, tabId, version)
          : localPreferencesService.markTabIntroComplete(id, tabId, version)

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
      customThemes: preferences?.custom_themes ?? {},
      navTabColors: preferences?.nav_tab_colors ?? {},
      animationsEnabled: preferences?.animations_enabled ?? true,
      tutorialCompleted: preferences
        ? !shouldShowAppTutorial(
            preferences.tab_intros_completed,
            preferences.app_tutorial_completed_at,
          )
        : false,
      browserNotificationsEnabled: preferences?.browser_notifications_enabled ?? false,
      emailNotificationsEnabled: preferences?.email_notifications_enabled ?? false,
      reminderLeadMinutes: preferences?.reminder_lead_minutes ?? 60,
      distanceUnit: preferences?.distance_unit ?? 'mi',
      collegeEnabled: preferences?.college_enabled ?? false,
      overviewInsightMode: preferences?.overview_insight_mode ?? 'analytics',
      updatePreferences,
      completeTutorial,
      dismissTutorial,
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
      dismissTutorial,
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
