import { NavLink, Outlet } from 'react-router-dom'
import { SOCCER_NAV } from '../types'
import { cn } from '@lib/utils'

export function SoccerNav() {
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

export function SoccerLayout() {
  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in">
      <header className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
          Soccer Performance
        </h2>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Training, matches, metrics & development — athlete command center
        </p>
      </header>
      <SoccerNav />
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  )
}
