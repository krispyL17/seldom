import { useEffect, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { isSupabaseConfigured } from '@config/env'
import { useUserPreferences } from '@features/preferences'
import { collegeUserDataService } from '@services/database/collegeUserData'

/** Sidebar label for the college module based on stored prep phase. */
export function useCollegeNavLabel(): string {
  const { collegeEnabled } = useUserPreferences()
  const { user } = useAuth()
  const [phase, setPhase] = useState<'junior' | 'senior' | null>(null)

  useEffect(() => {
    if (!collegeEnabled || !user?.id || !isSupabaseConfigured()) {
      setPhase(null)
      return
    }
    void collegeUserDataService
      .fetch(user.id)
      .then((data) => setPhase(data.resumeSettings.applicationPhase ?? 'junior'))
      .catch(() => setPhase('junior'))
  }, [collegeEnabled, user?.id])

  if (!collegeEnabled) return 'Junior Prep'
  return phase === 'senior' ? 'Applications' : 'Junior Prep'
}
