import { NavLink, Outlet } from 'react-router-dom'
import { ErrorPanel } from '@components/ui/ErrorPanel'
import { PageSkeleton } from '@components/ui/PanelSkeleton'
import { useUserPreferences } from '@features/preferences'
import { cn } from '@lib/utils'
import { AdaptiveScrollRegion } from '@components/ui/AdaptiveScrollRegion'
import { SoccerProvider, useSoccer } from '../hooks/useSoccerProfile'
import { useAthleteDevelopment } from '../hooks/useAthleteDevelopment'
import { PerformanceOnboardingChatGate } from '../onboarding/PerformanceOnboardingChatGate'
import { getPerformanceNav } from '../utils/performanceNav'
import { StreakExplainerModal } from '../athlete/components/StreakExplainerModal'
import { InjuryModeBanner, InjuryModeOverlay } from '../athlete/components/InjuryModeBanner'
export function PerformanceNav() {
  const { onboardingComplete } = useSoccer()
  const { hobbyPassion, hobbyTabLabel } = useUserPreferences()
  const { development } = useAthleteDevelopment()

  if (!onboardingComplete) return null

  const navItems = getPerformanceNav(
    hobbyPassion,
    development.injuryMode.active,
    development.gymEnabled,
  )

  const linkClass = (item: (typeof navItems)[number], isActive: boolean) =>
    cn(
      'shrink-0 rounded-t-[var(--radius-sm)] px-3 py-2 text-xs font-medium transition-colors',
      isActive
        ? 'border border-b-0 border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]'
        : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-secondary)]',
      item.id === 'recovery' && development.injuryMode.active && !isActive
        ? 'text-[var(--color-danger)]'
        : undefined,
    )

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] pb-px"
      aria-label={`${hobbyTabLabel} sections`}
    >
      {navItems.map((item) => (
        <NavLink key={item.id} to={item.href} className={({ isActive }) => linkClass(item, isActive)}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function StreakExplainerGate() {
  const { development, markStreakExplained } = useAthleteDevelopment()
  const { streak } = development
  const shouldShow = streak.current > 1 && !streak.explained

  return (
    <StreakExplainerModal
      open={shouldShow}
      current={streak.current}
      longest={streak.longest}
      milestonesAchieved={streak.milestonesAchieved}
      onDismiss={() => void markStreakExplained()}
    />
  )
}

function SoccerLayoutInner() {
  const { hobbyTabLabel, hobbyPassion } = useUserPreferences()
  const { loading, error, onboardingComplete, reload } = useSoccer()

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] animate-fade-in">
        <PageSkeleton panels={3} />
      </div>
    )
  }

  if (!onboardingComplete) {
    return (
      <div className="mx-auto max-w-[720px] animate-fade-in">
        <PerformanceOnboardingChatGate onComplete={() => void reload()} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1400px]">
        <ErrorPanel message={error} onRetry={() => void reload()} title={`Couldn't load ${hobbyTabLabel}`} />
      </div>
    )
  }

  return (
    <div className="relative mx-auto flex min-h-0 flex-1 w-full max-w-[1400px] animate-fade-in flex-col overflow-hidden">
      <InjuryModeOverlay />
      <StreakExplainerGate />
      <header className="mb-2 shrink-0">
        <h2 className="text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
          {hobbyTabLabel}
        </h2>
        {hobbyPassion && (
          <p className="text-xs text-[var(--color-text-tertiary)]">{hobbyPassion}</p>
        )}
      </header>
      <div className="mb-2 shrink-0">
        <InjuryModeBanner compact />
      </div>
      <div className="shrink-0">
        <PerformanceNav />
      </div>
      <div className="mt-2 min-h-0 flex-1">
        <AdaptiveScrollRegion className="perf-page-shell">
          <Outlet />
        </AdaptiveScrollRegion>
      </div>
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
