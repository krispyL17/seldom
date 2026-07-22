import { NavLink } from 'react-router-dom'
import { cn } from '@lib/utils'
import { SIDEBAR_NAV } from '@config/navigation'

interface SidebarNavProps {
  /** Called when a link is clicked — used to close the mobile drawer */
  onNavigate?: () => void
}

/**
 * Shared navigation list used by both desktop sidebar and mobile drawer.
 */
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <nav aria-label="Primary" className="flex flex-1 flex-col gap-0.5 px-3 py-2">
      {SIDEBAR_NAV.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.id}
            to={item.href}
            end={item.href === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)]',
              )
            }
          >
            <Icon className="shrink-0" aria-hidden />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
