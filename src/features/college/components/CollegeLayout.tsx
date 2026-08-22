import { NavLink, Outlet, Link } from 'react-router-dom'
import { ErrorPanel } from '@components/ui/ErrorPanel'
import { Button } from '@components/ui/Button'
import { Panel } from '@components/ui/Panel'
import { PageSkeleton } from '@components/ui/PanelSkeleton'
import { useUserPreferences } from '@features/preferences'
import { getCollegeNav } from '../types'
import { cn } from '@lib/utils'
import { useCollege } from '../hooks/useCollege'
import { ApplicationPhaseToggle } from './shared/ApplicationPhaseToggle'
import { CollegeOnboardingGate } from '../onboarding/CollegeOnboardingGate'

export function CollegeNav() {
  const { applicationPhase, onboardingComplete } = useCollege()
  const nav = getCollegeNav(applicationPhase)
  const advisorTab = nav.find((item) => item.id === 'advisor')
  const mainNavItems = nav.filter((item) => item.id !== 'advisor')

  if (!onboardingComplete) return null

  const linkClass = (isActive: boolean) =>
    cn(
      'shrink-0 rounded-t-[var(--radius-sm)] px-2.5 py-2 text-xs font-medium transition-colors',
      isActive
        ? 'border border-b-0 border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]'
        : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-secondary)]',
    )

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] pb-px"
      aria-label="Junior Prep sections"
    >
      {mainNavItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.href}
          end={item.href === '/college'}
          className={({ isActive }) => linkClass(isActive)}
        >
          {item.label}
        </NavLink>
      ))}
      {advisorTab && (
        <>
          <div className="min-w-2 flex-1 shrink" aria-hidden />
          <NavLink
            key={advisorTab.id}
            to={advisorTab.href}
            className={({ isActive }) => cn(linkClass(isActive), 'ml-auto shrink-0')}
          >
            {advisorTab.label}
          </NavLink>
        </>
      )}
    </nav>
  )
}

function CollegeLayoutInner() {
  const { loading, error, onboardingComplete, reload } = useCollege()
  const { collegeEnabled, updatePreferences } = useUserPreferences()

  if (!collegeEnabled) {
    return (
      <div className="mx-auto max-w-lg animate-fade-in">
        <Panel title="Junior Prep" subtitle="Optional — off by default">
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Junior Prep is hidden from the sidebar until you turn it on. Enable it here if you are a junior
            or senior exploring schools, or keep it off if college prep is not on your radar yet.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void updatePreferences({ college_enabled: true }).then(() => reload())}>
              Enable Junior Prep
            </Button>
            <Link
              to="/settings"
              className="inline-flex h-8 items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)]"
            >
              Settings
            </Link>
          </div>
        </Panel>
      </div>
    )
  }

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
        <ErrorPanel message={error} onRetry={() => void reload()} title="Couldn't load Junior Prep" />
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
    <div className="relative mx-auto flex h-0 min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden animate-fade-in">
      <ApplicationPhaseToggle />

      <div className="shrink-0">
        <CollegeNav />
      </div>
      <div className="mt-2 flex min-h-0 flex-1 basis-0 flex-col overflow-hidden">
        <div className="college-tab-scroll min-h-0 flex-1 basis-0 overflow-x-hidden overflow-y-auto overscroll-contain">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export function CollegeLayout() {
  return <CollegeLayoutInner />
}
