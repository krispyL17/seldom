import { useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getPageTitle } from '@config/navigation'
import { getGreeting } from '@config/user'
import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@features/preferences'
import { NotificationCenter, useNotifications } from '@features/notifications'
import { cn } from '@lib/utils'
import { GlobalSearch } from '@components/layout/GlobalSearch'
import { ProfileMenu } from '@components/layout/ProfileMenu'
import { IconButton } from '@components/ui/IconButton'
import { IconBell, IconMenu, IconSearch, IconSparkles } from '@components/ui/icons'

const NAV_TOGGLE_CLASS =
  'h-9 w-9 shrink-0 ring-1 ring-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:bg-[var(--color-surface-overlay)]'

interface TopBarProps {
  onMenuOpen: () => void
  navOpen?: boolean
  onNavToggle?: () => void
}

export function TopBar({ onMenuOpen, navOpen = false, onNavToggle }: TopBarProps) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { hobbyTabLabel, hobbyPassion } = useUserPreferences()
  const { unreadCount, togglePanel } = useNotifications()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const searchPanelId = 'mobile-search-panel'
  const bellButtonRef = useRef<HTMLButtonElement>(null)

  const firstName =
    user?.user_metadata?.display_name?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'there'

  const pageTitle = getPageTitle(pathname, hobbyTabLabel, hobbyPassion)
  const greeting = getGreeting()
  const isHome = pathname === '/'
  const assistantActive = pathname === '/assistant' || pathname.startsWith('/assistant/')
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  const bellLabel = useMemo(
    () => (unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'),
    [unreadCount],
  )

  return (
    <>
      <header className="app-shell-topbar relative z-50 flex h-14 shrink-0 items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 md:grid md:h-[3.25rem] md:grid-cols-[minmax(0,1fr)_minmax(0,28rem)_minmax(0,1fr)] md:items-center md:gap-3 md:bg-[color-mix(in_srgb,var(--color-surface-raised)_94%,transparent)] md:px-4">
        <div className="flex min-w-0 items-center gap-2 md:col-start-1 md:justify-self-start">
          <IconButton
            label="Open menu"
            onClick={onMenuOpen}
            className={cn(NAV_TOGGLE_CLASS, 'md:hidden')}
          >
            <IconMenu />
          </IconButton>

          {onNavToggle && (
            <IconButton
              label={navOpen ? 'Close navigation' : 'Open navigation'}
              onClick={onNavToggle}
              className={cn(NAV_TOGGLE_CLASS, 'hidden md:inline-flex')}
              aria-expanded={navOpen}
            >
              <IconMenu />
            </IconButton>
          )}

          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-[var(--color-text-tertiary)]">
              <span className="md:hidden">
                {greeting}, {firstName}
              </span>
              <span className="hidden md:inline">
                {isHome ? today : `${greeting}, ${firstName}`}
              </span>
            </p>
            <h1 className="font-display truncate text-base font-semibold tracking-tight text-[var(--color-text-primary)] md:text-lg">
              <span className="md:hidden">{isHome ? 'Today' : pageTitle}</span>
              <span className="hidden md:inline">
                {isHome ? `${greeting}, ${firstName}` : pageTitle}
              </span>
            </h1>
          </div>
        </div>

        <div className="hidden w-full min-w-0 md:col-start-2 md:block md:justify-self-center">
          <GlobalSearch className="w-full" />
        </div>

        <div className="ml-auto flex items-center gap-1.5 md:col-start-3 md:ml-0 md:justify-self-end">
          <Link
            to="/assistant"
            aria-label="Seldom AI"
            aria-current={assistantActive ? 'page' : undefined}
            className={cn(
              'relative inline-flex h-11 w-11 min-h-10 min-w-10 items-center justify-center rounded-full',
              'text-[var(--color-text-secondary)] transition-colors duration-150',
              'hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
              assistantActive &&
                'bg-[var(--color-accent-subtle)] text-[var(--color-accent-muted)] ring-1 ring-[var(--color-accent)]/30',
            )}
          >
            <IconSparkles width={20} height={20} aria-hidden />
          </Link>

          <IconButton
            label="Search"
            className="h-11 w-11 md:hidden"
            aria-expanded={mobileSearchOpen}
            aria-controls={searchPanelId}
            onClick={() => setMobileSearchOpen((open) => !open)}
          >
            <IconSearch />
          </IconButton>

          <IconButton
            ref={bellButtonRef}
            label={bellLabel}
            badgeCount={unreadCount}
            onClick={togglePanel}
            className="h-11 w-11"
          >
            <IconBell />
          </IconButton>

          <ProfileMenu />
        </div>
      </header>

      {mobileSearchOpen && (
        <div
          id={searchPanelId}
          className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 md:hidden"
        >
          <GlobalSearch autoFocus onNavigate={() => setMobileSearchOpen(false)} />
        </div>
      )}

      <NotificationCenter triggerRef={bellButtonRef} />
    </>
  )
}
