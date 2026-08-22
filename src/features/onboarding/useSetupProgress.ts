import { useEffect, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@features/preferences'
import { useTasks } from '@features/tasks/hooks/useTasks'
import { collegeUserDataService } from '@services/database/collegeUserData'
import { soccerUserDataService } from '@services/database/soccerUserData'
import {
  buildSetupSteps,
  isSetupChecklistDismissed,
  isSetupComplete,
  setupProgressPercent,
  type SetupStep,
} from './setupChecklist'

export function useSetupProgress() {
  const { user, isAuthenticated } = useAuth()
  const {
    preferences,
    loading: prefsLoading,
    tutorialCompleted,
    collegeEnabled,
  } = useUserPreferences()
  const { tasks, loading: tasksLoading } = useTasks()

  const [performanceReady, setPerformanceReady] = useState(false)
  const [collegeReady, setCollegeReady] = useState(false)
  const [domainLoading, setDomainLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setPerformanceReady(false)
      setCollegeReady(false)
      setDomainLoading(false)
      return
    }

    let cancelled = false
    setDomainLoading(true)

    Promise.all([
      soccerUserDataService.fetch(user.id),
      collegeEnabled ? collegeUserDataService.fetch(user.id) : Promise.resolve(null),
    ])
      .then(([soccerData, collegeData]) => {
        if (cancelled) return
        setPerformanceReady(Boolean(soccerData?.onboarding_completed_at))
        setCollegeReady(Boolean(collegeData?.resumeSettings.onboardingCompletedAt))
      })
      .catch(() => {
        if (!cancelled) {
          setPerformanceReady(false)
          setCollegeReady(false)
        }
      })
      .finally(() => {
        if (!cancelled) setDomainLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [collegeEnabled, isAuthenticated, user?.id])

  const tabIntros = preferences?.tab_intros_completed ?? {}
  const steps: SetupStep[] = buildSetupSteps({
    tabIntros,
    welcomeComplete: tutorialCompleted,
    taskCount: tasks.length,
    performanceOnboardingComplete: performanceReady,
    collegeEnabled,
    collegeOnboardingComplete: collegeReady,
  })

  const loading = prefsLoading || tasksLoading || domainLoading
  const dismissed = isSetupChecklistDismissed(tabIntros)
  const complete = isSetupComplete(steps)
  const progress = setupProgressPercent(steps)
  const showChecklist = !loading && !dismissed && !complete

  return {
    steps,
    loading,
    showChecklist,
    complete,
    progress,
    dismissed,
  }
}
