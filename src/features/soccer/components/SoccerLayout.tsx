import { ErrorPanel } from '@components/ui/ErrorPanel'
import { PageSkeleton } from '@components/ui/PanelSkeleton'
import { NavLink, Outlet } from 'react-router-dom'
import { useUserPreferences } from '@features/preferences'
import { SOCCER_NAV } from '../types'
import { cn } from '@lib/utils'
import { SoccerProvider, useSoccer } from '../hooks/useSoccerProfile'
import { SoccerOnboardingGate } from '../onboarding/SoccerOnboardingGate'

export function SoccerNav() {
  const { onboardingComplete } = useSoccer()

  if (!onboardingComplete) return null

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] pb-px"
      aria-label="Soccer sections"
    >
      {SOCCER_NAV.map((item) => (
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
  const { loading, error, onboardingComplete, reload } = useSoccer()
  const { hobbyTabLabel, hobbyPassion } = useUserPreferences()

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] animate-fade-in">
        <PageSkeleton panels={4} />
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

  if (!onboardingComplete) {
    return (
      <div className="mx-auto max-w-[900px] animate-fade-in">
        <SoccerOnboardingGate onComplete={() => void reload()} />
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
            ? `${hobbyPassion} — training, metrics & development`
            : 'Training, matches, metrics & development'}
        </p>
      </header>
      <SoccerNav />
      <div className="mt-4">
        <Outlet />
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
