import { ErrorPanel } from '@components/ui/ErrorPanel'
import { PageSkeleton } from '@components/ui/PanelSkeleton'
import { NavLink, Outlet } from 'react-router-dom'
import { getCollegeNav } from '../types'
import { cn } from '@lib/utils'
import { CollegeProvider, useCollege } from '../hooks/useCollege'
import { SeniorModePrompt } from './shared/SeniorModePrompt'
import { phaseDescription, phaseLabel } from '../phaseUtils'
import { Badge } from '@components/ui/Badge'
import { CollegeOnboardingGate } from '../onboarding/CollegeOnboardingGate'

export function CollegeNav() {
  const { applicationPhase, onboardingComplete } = useCollege()
  const nav = getCollegeNav(applicationPhase)

  if (!onboardingComplete) return null

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] pb-px"
      aria-label="College sections"
    >
      {nav.map((item) => (
        <NavLink
          key={item.id}
          to={item.href}
          end={item.href === '/college'}
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

function CollegeLayoutInner() {
  const { applicationPhase, loading, error, onboardingComplete, reload } = useCollege()

  if (loading) {
    return (
      <div className="mx-auto max-w-[1600px] animate-fade-in">
        <PageSkeleton panels={4} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1600px]">
        <ErrorPanel message={error} onRetry={() => void reload()} title="College workspace" />
      </div>
    )
  }

  if (!onboardingComplete) {
    return (
      <div className="mx-auto max-w-[900px] animate-fade-in">
        <CollegeOnboardingGate onComplete={() => void reload()} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] animate-fade-in">
      <header className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
            {phaseLabel(applicationPhase)}
          </h2>
          <Badge variant={applicationPhase === 'senior' ? 'success' : 'accent'}>
            {applicationPhase === 'senior' ? 'Senior' : 'Junior'}
          </Badge>
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          {phaseDescription(applicationPhase)}
        </p>
      </header>

      <SeniorModePrompt className="mb-4" />

      <CollegeNav />
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  )
}

export function CollegeLayout() {
  return (
    <CollegeProvider>
      <CollegeLayoutInner />
    </CollegeProvider>
  )
}
