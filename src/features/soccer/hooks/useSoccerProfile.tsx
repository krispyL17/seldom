import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@hooks/useAuth'
import { loadError } from '@lib/userFacingError'
import { getSupabaseClient } from '@lib/supabase'
import { goalService } from '@services/database/goals'
import { soccerInsightService } from '@services/database/soccerInsights'
import {
  soccerUserDataService,
  type SoccerPlayerProfile,
  EMPTY_SOCCER_PROFILE,
} from '@services/database/soccerUserData'

interface SoccerContextValue {
  profile: SoccerPlayerProfile | null
  onboardingComplete: boolean
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  updateProfile: (profile: SoccerPlayerProfile) => Promise<void>
  completeOnboarding: (profile: SoccerPlayerProfile, extras: {
    weaknessTitle: string
    weaknessDescription: string
    strengthTitle: string
    strengthDescription: string
    goalTitle: string
    cardioGoalTitle?: string
    goalCategory?: string
  }) => Promise<void>
}

const SoccerContext = createContext<SoccerContextValue | null>(null)

export function SoccerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<SoccerPlayerProfile | null>(null)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setOnboardingComplete(false)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await soccerUserDataService.ensure(user.id)

      if (!data.onboarding_completed_at) {
        const client = getSupabaseClient()
        if (client) {
          const { count } = await client
            .from('training_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          if ((count ?? 0) > 0 && data.profile?.name) {
            const updated = await soccerUserDataService.completeOnboarding(
              user.id,
              data.profile,
            )
            setProfile(updated.profile)
            setOnboardingComplete(true)
            setError(null)
            setLoading(false)
            return
          }
        }
      }

      setProfile(data.profile)
      setOnboardingComplete(Boolean(data.onboarding_completed_at))
      setError(null)
    } catch (err) {
      setError(loadError('your performance profile', err))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void reload()
  }, [reload])

  const updateProfile = useCallback(
    async (next: SoccerPlayerProfile) => {
      if (!user) throw new Error('Not authenticated')
      const updated = await soccerUserDataService.updateProfile(user.id, next)
      setProfile(updated.profile)
    },
    [user],
  )

  const completeOnboarding = useCallback(
    async (
      next: SoccerPlayerProfile,
      extras: {
        weaknessTitle: string
        weaknessDescription: string
        strengthTitle: string
        strengthDescription: string
        goalTitle: string
        cardioGoalTitle?: string
        goalCategory?: string
      },
    ) => {
      if (!user) throw new Error('Not authenticated')

      await soccerUserDataService.completeOnboarding(user.id, next)

      if (extras.weaknessTitle) {
        await soccerInsightService.create(user.id, {
          insight_type: 'weakness',
          title: extras.weaknessTitle,
          description: extras.weaknessDescription,
          priority: 'high',
          category: 'Technical',
        })
      }

      if (extras.strengthTitle) {
        await soccerInsightService.create(user.id, {
          insight_type: 'strength',
          title: extras.strengthTitle,
          description: extras.strengthDescription,
          priority: 'high',
          category: 'Tactical',
        })
      }

      const performanceCategory = extras.goalCategory?.trim() || 'Skills'

      if (extras.goalTitle) {
        await goalService.create(user.id, {
          title: extras.goalTitle,
          category: performanceCategory,
          progress: 0,
          status: 'active',
        })
      }

      if (extras.cardioGoalTitle) {
        await goalService.create(user.id, {
          title: extras.cardioGoalTitle,
          category: 'Fitness',
          progress: 0,
          status: 'active',
        })
      }

      setProfile(next)
      setOnboardingComplete(true)
    },
    [user],
  )

  return (
    <SoccerContext.Provider
      value={{
        profile,
        onboardingComplete,
        loading,
        error,
        reload,
        updateProfile,
        completeOnboarding,
      }}
    >
      {children}
    </SoccerContext.Provider>
  )
}

export function useSoccer() {
  const ctx = useContext(SoccerContext)
  if (!ctx) throw new Error('useSoccer must be used within SoccerProvider')
  return ctx
}

export { EMPTY_SOCCER_PROFILE }
