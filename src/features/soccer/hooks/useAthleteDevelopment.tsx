import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@features/preferences'
import { getSupabaseClient } from '@lib/supabase'
import { soccerUserDataService } from '@services/database/soccerUserData'
import { parseAthleteDevelopment } from '../athlete/defaults'
import { collectActivityDates, computeStreak, mergeStreakMeta } from '../athlete/streak'
import { analyzeRecovery, type RecoverySnapshot } from '../athlete/recovery'
import { generateSportTabs } from '../athlete/sportTabs'
import { sportUsesSideTracking } from '../athlete/sideTracking'
import { parseKnowledgeFile } from '../knowledge/importParser'
import { registerRecoverySync, registerStreakSync } from '../athlete/streakSyncBridge'
import {
  readCustomTabsPromptDismissed,
  writeCustomTabsPromptDismissed,
} from '../athlete/promptDismiss'
import type { AthleteDevelopmentState, AthleteSideProfile, CustomPerformanceTab } from '../athlete/types'

interface AthleteContextValue {
  development: AthleteDevelopmentState
  loading: boolean
  /** Stable custom tabs while reloading — avoids nav flicker on Performance revisit. */
  displayCustomTabs: CustomPerformanceTab[]
  recovery: RecoverySnapshot | null
  syncStreak: () => Promise<void>
  markStreakExplained: () => Promise<void>
  updateSideProfile: (profile: Partial<AthleteSideProfile>) => Promise<void>
  setInjuryMode: (active: boolean, reason?: string, aiSuggested?: boolean) => Promise<void>
  setGymEnabled: (enabled: boolean) => Promise<void>
  updateCustomTabs: (tabs: CustomPerformanceTab[]) => Promise<void>
  dismissCustomTabsPrompt: () => Promise<void>
  importKnowledgeFile: (content: string, filename: string) => Promise<{ count: number; warnings: string[] }>
  ensureSportTabs: () => Promise<void>
}

const AthleteContext = createContext<AthleteContextValue | null>(null)

type DevelopmentUpdater = (prev: AthleteDevelopmentState) => AthleteDevelopmentState

export function AthleteDevelopmentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { hobbyPassion } = useUserPreferences()
  const [development, setDevelopment] = useState<AthleteDevelopmentState>(() =>
    parseAthleteDevelopment(null),
  )
  const developmentRef = useRef(development)
  const displayTabsRef = useRef<CustomPerformanceTab[]>([])
  const initialLoadDoneRef = useRef(false)
  const persistQueueRef = useRef(Promise.resolve())
  const [recovery, setRecovery] = useState<RecoverySnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    developmentRef.current = development
  }, [development])

  const loadDevelopment = useCallback(async () => {
    if (!user) {
      const empty = parseAthleteDevelopment(null)
      developmentRef.current = empty
      displayTabsRef.current = []
      initialLoadDoneRef.current = false
      setDevelopment(empty)
      setRecovery(null)
      setLoading(false)
      return
    }
    if (!initialLoadDoneRef.current) {
      setLoading(true)
    }
    try {
      const data = await soccerUserDataService.ensure(user.id)
      let next = parseAthleteDevelopment(data.athlete_development)
      if (readCustomTabsPromptDismissed(user.id)) {
        next = { ...next, customTabsPromptDismissed: true }
      }
      developmentRef.current = next
      if (next.customTabs.length > 0) {
        displayTabsRef.current = next.customTabs
      }
      setDevelopment(next)
    } finally {
      initialLoadDoneRef.current = true
      setLoading(false)
    }
  }, [user])

  useLayoutEffect(() => {
    if (!user?.id) return
    if (!readCustomTabsPromptDismissed(user.id)) return
    if (developmentRef.current.customTabsPromptDismissed) return
    const next = { ...developmentRef.current, customTabsPromptDismissed: true }
    developmentRef.current = next
    setDevelopment(next)
  }, [user?.id])

  const persist = useCallback(
    async (updater: AthleteDevelopmentState | DevelopmentUpdater) => {
      if (!user) return

      const run = async () => {
        const next =
          typeof updater === 'function'
            ? (updater as DevelopmentUpdater)(developmentRef.current)
            : updater
        developmentRef.current = next
        await soccerUserDataService.updateAthleteDevelopment(user.id, next)
        setDevelopment(next)
      }

      persistQueueRef.current = persistQueueRef.current.then(run, run)
      await persistQueueRef.current
    },
    [user],
  )

  const syncStreak = useCallback(async () => {
    if (!user) return
    const client = getSupabaseClient()
    if (!client) return

    const [sessionsRes, runsRes, matchesRes] = await Promise.all([
      client.from('training_sessions').select('session_date').eq('user_id', user.id),
      client.from('run_logs').select('run_date').eq('user_id', user.id),
      client.from('soccer_matches').select('match_date').eq('user_id', user.id),
    ])

    const dates = collectActivityDates({
      sessionDates: (sessionsRes.data ?? []).map((r) => r.session_date as string),
      runDates: (runsRes.data ?? []).map((r) => r.run_date as string),
      matchDates: (matchesRes.data ?? []).map((r) => r.match_date as string),
    })

    await persist((mem) => {
      const computed = computeStreak({
        activityDates: dates,
        frozen: mem.injuryMode.active,
        frozenAtStreak: mem.streak.frozenAtStreak,
        previousLongest: mem.streak.longest,
        previousMilestones: mem.streak.milestonesAchieved,
      })
      const streak = mergeStreakMeta({ ...computed, frozen: mem.injuryMode.active }, mem.streak)
      return { ...mem, streak }
    })
  }, [user, persist])

  const syncRecovery = useCallback(async () => {
    if (!user) return
    const client = getSupabaseClient()
    if (!client) return

    const [sessionsRes, runsRes] = await Promise.all([
      client
        .from('training_sessions')
        .select('session_date, duration_min, intensity, energy_level, position_played')
        .eq('user_id', user.id)
        .gte('session_date', new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10)),
      client
        .from('run_logs')
        .select('run_date, distance_m')
        .eq('user_id', user.id)
        .gte('run_date', new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10)),
    ])

    const sessions = (sessionsRes.data ?? []).map((r) => ({
      session_date: r.session_date as string,
      duration_min: r.duration_min as number,
      intensity: r.intensity as number,
      energy_level: r.energy_level as number,
      focus: r.position_played as string,
    }))

    const runs = (runsRes.data ?? []).map((r) => ({
      run_date: r.run_date as string,
      minutes: Math.round(((r.distance_m as number) / 1000) * 6),
    }))

    setRecovery(analyzeRecovery(sessions, runs))
  }, [user])

  useEffect(() => {
    void loadDevelopment()
  }, [loadDevelopment])

  useEffect(() => {
    if (!user || loading) return
    const timer = window.setTimeout(() => {
      void syncStreak()
      void syncRecovery()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [user, loading, syncStreak, syncRecovery])

  useEffect(() => {
    const unregisterStreak = registerStreakSync(syncStreak)
    const unregisterRecovery = registerRecoverySync(syncRecovery)
    return () => {
      unregisterStreak()
      unregisterRecovery()
    }
  }, [syncStreak, syncRecovery])

  const markStreakExplained = useCallback(async () => {
    await persist((prev) => ({
      ...prev,
      streak: { ...prev.streak, explained: true },
    }))
  }, [persist])

  const updateSideProfile = useCallback(
    async (patch: Partial<AthleteSideProfile>) => {
      await persist((prev) => ({
        ...prev,
        sideProfile: { ...prev.sideProfile, ...patch },
      }))
    },
    [persist],
  )

  const setInjuryMode = useCallback(
    async (active: boolean, reason?: string, aiSuggested = false) => {
      await persist((prev) => ({
        ...prev,
        injuryMode: {
          active,
          activatedAt: active ? new Date().toISOString() : null,
          reason: active ? reason?.trim() || null : null,
          aiSuggested: active ? aiSuggested : false,
        },
        streak: {
          ...prev.streak,
          frozen: active,
          frozenAtStreak: active ? prev.streak.current : null,
        },
      }))
    },
    [persist],
  )

  const setGymEnabled = useCallback(
    async (enabled: boolean) => {
      await persist((prev) => ({ ...prev, gymEnabled: enabled }))
    },
    [persist],
  )

  const updateCustomTabs = useCallback(
    async (tabs: CustomPerformanceTab[]) => {
      const nextTabs = tabs.slice(0, 4)
      const disabled = nextTabs.length === 0
      displayTabsRef.current = nextTabs
      await persist((prev) => ({
        ...prev,
        customTabs: nextTabs,
        customTabsDisabled: disabled,
        ...(disabled ? { customTabsPromptDismissed: true } : {}),
      }))
    },
    [persist],
  )

  const dismissCustomTabsPrompt = useCallback(async () => {
    if (!user) return
    writeCustomTabsPromptDismissed(user.id)
    const optimistic = { ...developmentRef.current, customTabsPromptDismissed: true }
    developmentRef.current = optimistic
    setDevelopment(optimistic)
    await persist((prev) => ({ ...prev, customTabsPromptDismissed: true }))
  }, [user, persist])

  const ensureSportTabs = useCallback(async () => {
    const current = developmentRef.current
    if (current.customTabs.length > 0 || current.customTabsDisabled || !hobbyPassion.trim()) return
    const tabs = generateSportTabs(hobbyPassion)
    displayTabsRef.current = tabs
    const dismissed = user ? readCustomTabsPromptDismissed(user.id) : false
    await persist((prev) => ({
      ...prev,
      customTabs: tabs,
      customTabsDisabled: false,
      ...(dismissed ? { customTabsPromptDismissed: true } : {}),
    }))
  }, [hobbyPassion, persist, user])

  const displayCustomTabs =
    loading && displayTabsRef.current.length > 0
      ? displayTabsRef.current
      : development.customTabs

  const importKnowledgeFile = useCallback(
    async (content: string, filename: string) => {
      const parsed = parseKnowledgeFile(content, filename)
      const now = new Date().toISOString()
      const newChunks = parsed.chunks.map((c, i) => ({
        ...c,
        id: `ki-${Date.now()}-${i}`,
        importedAt: now,
      }))
      await persist((prev) => ({
        ...prev,
        knowledgeImports: [...prev.knowledgeImports, ...newChunks].slice(-200),
      }))
      return { count: newChunks.length, warnings: parsed.warnings }
    },
    [persist],
  )

  useEffect(() => {
    if (
      !loading &&
      hobbyPassion &&
      development.customTabs.length === 0 &&
      !development.customTabsDisabled
    ) {
      void ensureSportTabs()
    }
  }, [loading, hobbyPassion, development.customTabs.length, development.customTabsDisabled, ensureSportTabs])

  useEffect(() => {
    if (hobbyPassion && !development.sideProfile.usesSideTracking && sportUsesSideTracking(hobbyPassion)) {
      void updateSideProfile({ usesSideTracking: true })
    }
  }, [hobbyPassion, development.sideProfile.usesSideTracking, updateSideProfile])

  const value = useMemo<AthleteContextValue>(
    () => ({
      development,
      loading,
      displayCustomTabs,
      recovery,
      syncStreak,
      markStreakExplained,
      updateSideProfile,
      setInjuryMode,
      setGymEnabled,
      updateCustomTabs,
      dismissCustomTabsPrompt,
      importKnowledgeFile,
      ensureSportTabs,
    }),
    [
      development,
      loading,
      displayCustomTabs,
      recovery,
      syncStreak,
      markStreakExplained,
      updateSideProfile,
      setInjuryMode,
      setGymEnabled,
      updateCustomTabs,
      dismissCustomTabsPrompt,
      importKnowledgeFile,
      ensureSportTabs,
    ],
  )

  return <AthleteContext.Provider value={value}>{children}</AthleteContext.Provider>
}

export function useAthleteDevelopment(): AthleteContextValue {
  const ctx = useContext(AthleteContext)
  if (!ctx) throw new Error('useAthleteDevelopment must be used within AthleteDevelopmentProvider')
  return ctx
}

export function useOptionalAthleteDevelopment(): AthleteContextValue | null {
  return useContext(AthleteContext)
}
