import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getTabIntroConfig } from '@config/tabIntroPrompts'
import { shouldShowTabIntro } from '@features/onboarding/onboardingVersion'
import { consumePendingTabIntro } from '@features/onboarding/tabIntroQueue'
import { useUserPreferences } from '@features/preferences'
import { useAuth } from '@hooks/useAuth'
import { soccerUserDataService } from '@services/database/soccerUserData'
import { getTabIntroId } from '../utils/routeTabId'
import { TabIntroPanel } from './TabIntroModal'

export function TabIntroGate() {
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const {
    preferences,
    loading,
    tutorialOpen,
    markTabIntroComplete,
  } = useUserPreferences()

  const tabId = getTabIntroId(location.pathname)
  const config = tabId ? getTabIntroConfig(tabId) : null
  const tabIntros = preferences?.tab_intros_completed ?? {}

  const [open, setOpen] = useState(false)
  const [performanceReady, setPerformanceReady] = useState(true)
  const pendingTabRef = useRef<string | null>(null)

  const isPerformanceRoute = location.pathname === '/soccer' || location.pathname.startsWith('/soccer/')
  const isTabIntroDone =
    tabId && config ? !shouldShowTabIntro(tabIntros, tabId, config.version) : true

  useEffect(() => {
    if (!isPerformanceRoute || !isAuthenticated || !user?.id) {
      setPerformanceReady(true)
      return
    }

    let cancelled = false
    soccerUserDataService
      .fetch(user.id)
      .then((data) => {
        if (!cancelled) setPerformanceReady(Boolean(data?.onboarding_completed_at))
      })
      .catch(() => {
        if (!cancelled) setPerformanceReady(false)
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, isPerformanceRoute, user?.id, location.pathname])

  useEffect(() => {
    if (loading || !tabId || !config || isTabIntroDone) {
      setOpen(false)
      return
    }
    if (tutorialOpen) return
    if (isPerformanceRoute && !performanceReady) return

    if (!consumePendingTabIntro(tabId)) {
      setOpen(false)
      return
    }

    pendingTabRef.current = tabId
    setOpen(true)
  }, [
    location.pathname,
    loading,
    tabId,
    config,
    tutorialOpen,
    isTabIntroDone,
    isPerformanceRoute,
    performanceReady,
  ])

  const dismiss = useCallback(async () => {
    const id = pendingTabRef.current ?? tabId
    if (!id || !config) return
    setOpen(false)
    await markTabIntroComplete(id, config.version)
  }, [config, markTabIntroComplete, tabId])

  const handleComplete = useCallback(
    async (_answers: Record<string, unknown>) => {
      const id = pendingTabRef.current ?? tabId
      if (!id || !config) return
      setOpen(false)
      await markTabIntroComplete(id, config.version)
    },
    [config, markTabIntroComplete, tabId],
  )

  if (!config || !tabId) return null

  return (
    <TabIntroPanel
      open={open}
      config={config}
      onComplete={handleComplete}
      onDismiss={() => void dismiss()}
    />
  )
}
