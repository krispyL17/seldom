import { useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@lib/utils'
import { getPageTitle } from '@config/navigation'
import { getGreeting } from '@config/user'
import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@features/preferences'
import { NotificationCenter, useNotifications } from '@features/notifications'
import { GlobalSearch } from '@components/layout/GlobalSearch'
import { IconButton } from '@components/ui/IconButton'
import { IconBell, IconMenu, IconSearch, IconUser } from '@components/ui/icons'

interface TopBarProps {
  onMenuOpen: () => void
}

export function TopBar({ onMenuOpen }: TopBarProps) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { hobbyTabLabel, hobbyPassion } = useUserPreferences()
  const { unreadCount, togglePanel } = useNotifications()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const firstName =
    user?.user_metadata?.display_name?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'there'

  const pageTitle = getPageTitle(pathname, hobbyTabLabel, hobbyPassion)
  const greeting = getGreeting()
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
      <header className="relative z-50 flex h-16 shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-base)]/90 px-4 backdrop-blur-xl md:gap-4 md:px-6">
        <div className="flex items-center gap-3 md:hidden">
          <IconButton label="Open menu" onClick={onMenuOpen}>
            <IconMenu />
          </IconButton>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
              {pageTitle}
            </h1>
            <p className="truncate text-[10px] text-[var(--color-text-tertiary)]">
              {greeting}, {firstName}
            </p>
          </div>
        </div>

        <div className="hidden min-w-0 shrink-0 md:block md:w-52 lg:w-60">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
            {today}
          </p>
          <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
            {greeting}, {firstName}
          </p>
        </div>

        <div className="hidden min-w-0 flex-1 md:block md:max-w-md lg:max-w-lg">
          <GlobalSearch className="w-full" />
        </div>

        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-1">
          <IconButton
            label="Search"
            className="md:hidden"
            onClick={() => setMobileSearchOpen((open) => !open)}
          >
            <IconSearch />
          </IconButton>

          <IconButton label={bellLabel} badgeCount={unreadCount} onClick={togglePanel}>
            <IconBell />
          </IconButton>

          <Link
            to="/settings"
            aria-label="Profile and settings"
            className={cn(
              'ml-0.5 flex h-9 w-9 items-center justify-center rounded-full',
              'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]',
              'ring-1 ring-[var(--color-border)] transition-colors duration-200',
              'hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
              pathname === '/settings' && 'text-[var(--color-text-primary)] ring-[var(--color-accent)]',
            )}
          >
            <IconUser width={18} height={18} />
          </Link>
        </div>
      </header>

      {mobileSearchOpen && (
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-base)] px-4 py-3 md:hidden">
          <GlobalSearch autoFocus onNavigate={() => setMobileSearchOpen(false)} />
        </div>
      )}

      <NotificationCenter />
    </>
  )
}
