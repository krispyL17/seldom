import { useEffect, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ErrorPanel } from '@components/ui/ErrorPanel'
import { PageSkeleton } from '@components/ui/PanelSkeleton'
import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@features/preferences'
import { cn } from '@lib/utils'
import { SoccerProvider, useSoccer } from '../hooks/useSoccerProfile'
import type { SoccerPlayerProfile } from '@services/database/soccerUserData'
import { getPerformanceNav } from '../utils/performanceNav'

function buildDefaultProfile(
  displayName: string,
  hobbyPassion: string,
): SoccerPlayerProfile {
  return {
    name: displayName,
    position: '',
    preferredFoot: '',
    squadNumber: null,
    season: '',
    currentFocus: hobbyPassion || '',
  }
}

export function PerformanceNav() {
  const { onboardingComplete } = useSoccer()
  const { hobbyPassion, hobbyTabLabel } = useUserPreferences()

  if (!onboardingComplete) return null

  const navItems = getPerformanceNav(hobbyPassion)

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] pb-px"
      aria-label={`${hobbyTabLabel} sections`}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.href}
          className={({ isActive }) =>
            cn(
              'shrink-0 rounded-t-[var(--radius-sm)] px-3 py-2 text-[11px] font-medium transition-colors',
              isActive
                ? 'border border-b-0 border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-secondary)]',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function SoccerLayoutInner() {
  const { user } = useAuth()
  const { hobbyTabLabel, hobbyPassion } = useUserPreferences()
  const { loading, error, onboardingComplete, completeOnboarding, reload } = useSoccer()
  const autoSetupStarted = useRef(false)

  const displayName =
    typeof user?.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name.trim()
      : ''

  useEffect(() => {
    if (loading || onboardingComplete || autoSetupStarted.current) return
    autoSetupStarted.current = true

    void completeOnboarding(buildDefaultProfile(displayName, hobbyPassion), {
      weaknessTitle: '',
      weaknessDescription: '',
      strengthTitle: '',
      strengthDescription: '',
      goalTitle: hobbyPassion ? `${hobbyPassion} — stay consistent` : '',
    }).then(() => reload())
  }, [
    loading,
    onboardingComplete,
    completeOnboarding,
    reload,
    displayName,
    hobbyPassion,
  ])

  if (loading || !onboardingComplete) {
    return (
      <div className="mx-auto max-w-[1400px] animate-fade-in">
        <PageSkeleton panels={3} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <ErrorPanel message={error} onRetry={() => void reload()} title={`${hobbyTabLabel} workspace`} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in">
      <header className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
          {hobbyTabLabel}
        </h2>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          {hobbyPassion
            ? `${hobbyPassion} — log sessions and track progress`
            : 'Log sessions and track progress'}
        </p>
      </header>
      <PerformanceNav />
      <div className="mt-4">
        <Outlet />
      </div>
      <p className="mt-6 text-center text-[11px] text-[var(--color-text-tertiary)]">
        Training advice lives in{' '}
        <NavLink to="/assistant?mode=soccer_drills" className="text-[var(--color-accent-muted)] hover:underline">
          Seldom AI
        </NavLink>
        .
      </p>
    </div>
  )
}

export function SoccerLayout() {
  return (
    <SoccerProvider>
      <SoccerLayoutInner />
    </SoccerProvider>
  )
}

/** @deprecated Use PerformanceNav */
export const SoccerNav = PerformanceNav
