import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@lib/utils'
import { useNavTabColorMap } from '@hooks/useNavTabColor'
import { useSidebarNav } from '@hooks/useSidebarNav'

interface SidebarNavProps {
  /** Called when a link is clicked — used to close the mobile drawer */
  onNavigate?: () => void
}

function isNavItemActive(itemId: string, href: string, pathname: string, isActive: boolean): boolean {
  if (isActive) return true
  if (itemId === 'soccer') return pathname === '/soccer' || pathname.startsWith('/soccer/')
  if (itemId === 'college') return pathname === '/college' || pathname.startsWith('/college/')
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Shared navigation list used by both desktop sidebar and mobile drawer.
 * Each tab shows a palette-colored bookmark underscore.
 */
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { pathname } = useLocation()
  const navItems = useSidebarNav()
  const tabColors = useNavTabColorMap()

  return (
    <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 px-3 py-3">
      {navItems.map((item) => {
        const Icon = item.icon
        const bookmarkColor = tabColors[item.id]

        return (
          <NavLink
            key={item.id}
            to={item.href}
            end={item.href === '/'}
            onClick={onNavigate}
            className={({ isActive }) => {
              const active = isNavItemActive(item.id, item.href, pathname, isActive)
              return cn(
                'sidebar-nav-link relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 pb-3.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
                active
                  ? 'sidebar-nav-link--active'
                  : 'text-[var(--color-text-secondary)]',
              )
            }}
          >
            {({ isActive }) => {
              const active = isNavItemActive(item.id, item.href, pathname, isActive)
              return (
                <>
                  <Icon
                    className="h-[18px] w-[18px] shrink-0"
                    style={active && bookmarkColor ? { color: bookmarkColor } : undefined}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {bookmarkColor && (
                    <span
                      className={cn('nav-tab-bookmark', active && 'nav-tab-bookmark--active')}
                      style={{
                        backgroundColor: bookmarkColor,
                        ...(active && bookmarkColor
                          ? { boxShadow: `0 3px 12px ${bookmarkColor}59` }
                          : {}),
                      }}
                      aria-hidden
                    />
                  )}
                </>
              )
            }}
          </NavLink>
        )
      })}
    </nav>
  )
}
