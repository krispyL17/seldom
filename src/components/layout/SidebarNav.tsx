import { NavLink } from 'react-router-dom'
import { cn } from '@lib/utils'
import { useSidebarNav } from '@hooks/useSidebarNav'

interface SidebarNavProps {
  /** Called when a link is clicked — used to close the mobile drawer */
  onNavigate?: () => void
}

/**
 * Shared navigation list used by both desktop sidebar and mobile drawer.
 */
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const navItems = useSidebarNav()

  return (
    <nav aria-label="Primary" className="flex flex-1 flex-col gap-0.5 px-3 py-2">
      {navItems.map((item, index) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.id}
            to={item.href}
            end={item.href === '/'}
            onClick={onNavigate}
            style={{ animationDelay: `${index * 30}ms` }}
            className={({ isActive }) =>
              cn(
                'animate-nav-in flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium',
                'transition-colors duration-200',
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
