import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { cn } from '@lib/utils'
import { getPageTitle } from '@config/navigation'
import { getGreeting, FALLBACK_USER_PROFILE } from '@config/user'
import { useUserProfile } from '@hooks/useUserProfile'
import { Button } from '@components/ui/Button'
import { IconButton } from '@components/ui/IconButton'
import {
  IconBell,
  IconMenu,
  IconPlus,
  IconSearch,
  IconUser,
} from '@components/ui/icons'

interface TopBarProps {
  onMenuOpen: () => void
}

/**
 * Top information bar — date, greeting, search, quick actions.
 * FM-inspired: contextual header rail above the command center.
 */
export function TopBar({ onMenuOpen }: TopBarProps) {
  const { pathname } = useLocation()
  const { profile } = useUserProfile()
  const pageTitle = getPageTitle(pathname)
  const greeting = getGreeting()
  const firstName = profile?.first_name || FALLBACK_USER_PROFILE.firstName
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-base)]/90 px-4 backdrop-blur-xl md:gap-4 md:px-6">
      {/* Mobile: menu + title */}
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

      {/* Desktop: date + greeting */}
      <div className="hidden min-w-0 shrink-0 md:block md:w-52 lg:w-60">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
          {today}
        </p>
        <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
          {greeting}, {firstName}
        </p>
      </div>

      {/* Search */}
      <div className="hidden flex-1 md:block md:max-w-sm lg:max-w-md">
        <label className="relative block">
          <span className="sr-only">Search</span>
          <IconSearch
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search tasks, sessions, journal…"
            className={cn(
              'h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)]',
              'bg-[var(--color-surface-overlay)] pl-9 pr-4 text-sm text-[var(--color-text-primary)]',
              'placeholder:text-[var(--color-text-tertiary)]',
              'transition-colors duration-150',
              'hover:border-[var(--color-border-strong)]',
              'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
            )}
          />
        </label>
      </div>

      <div className="flex-1 md:hidden" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <IconButton label="Search" className="md:hidden">
          <IconSearch />
        </IconButton>

        <Button
          variant="primary"
          size="sm"
          className="hidden gap-1.5 sm:inline-flex"
        >
          <IconPlus width={16} height={16} />
          <span className="hidden lg:inline">Quick Add</span>
        </Button>

        <IconButton label="Quick Add" className="sm:hidden">
          <IconPlus />
        </IconButton>

        <IconButton label="Notifications" dot>
          <IconBell />
        </IconButton>

        <Link
          to="/settings"
          aria-label="Profile and settings"
          className={cn(
            'ml-0.5 flex h-9 w-9 items-center justify-center rounded-full',
            'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]',
            'ring-1 ring-[var(--color-border)] transition-colors duration-150',
            'hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
            pathname === '/settings' && 'text-[var(--color-text-primary)] ring-[var(--color-accent)]',
          )}
        >
          <IconUser width={18} height={18} />
        </Link>
      </div>
    </header>
  )
}
