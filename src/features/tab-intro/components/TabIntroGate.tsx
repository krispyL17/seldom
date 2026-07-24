import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getTabIntroConfig } from '@config/tabIntroPrompts'
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
  const completed = preferences?.tab_intros_completed ?? {}

  const [open, setOpen] = useState(false)
  const [performanceReady, setPerformanceReady] = useState(true)
  const pendingTabRef = useRef<string | null>(null)

  const isPerformanceRoute = location.pathname === '/soccer' || location.pathname.startsWith('/soccer/')
  const isTabIntroDone = tabId ? Boolean(completed[tabId]) : true

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

    pendingTabRef.current = tabId
    const timer = window.setTimeout(() => setOpen(true), 700)
    return () => window.clearTimeout(timer)
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
    setOpen(false)
    if (id) await markTabIntroComplete(id)
  }, [markTabIntroComplete, tabId])

  const handleComplete = useCallback(
    async (_answers: Record<string, unknown>) => {
      await dismiss()
    },
    [dismiss],
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
