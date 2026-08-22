import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  IconSettings,
  IconSparkles,
  IconUser,
} from '@components/ui/icons'
import { useAuth } from '@hooks/useAuth'
import { useFocusTrap } from '@hooks/useFocusTrap'
import { cn } from '@lib/utils'

const MENU_ITEMS = [
  { id: 'assistant', label: 'Seldom AI', href: '/assistant', icon: IconSparkles },
  { id: 'settings', label: 'Settings', href: '/settings', icon: IconSettings },
] as const

export function ProfileMenu() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const menuId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useFocusTrap(open, panelRef)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return
      setOpen(false)
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const firstName =
    user?.user_metadata?.display_name?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'Account'

  const settingsActive = pathname === '/settings' || pathname.startsWith('/settings/')

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'ml-0.5 flex h-11 w-11 items-center justify-center rounded-full md:h-10 md:w-10',
          'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]',
          'ring-1 ring-[var(--color-border)] transition-[color,box-shadow,background-color] duration-200',
          'hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
          (settingsActive || open) &&
            'text-[var(--color-text-primary)] ring-[var(--color-brand-muted)]',
        )}
      >
        <IconUser width={18} height={18} aria-hidden />
        <span className="sr-only">Profile and settings menu</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          id={menuId}
          role="menu"
          aria-label="Profile menu"
          className={cn(
            'absolute right-0 top-[calc(100%+6px)] z-[60] w-52 overflow-hidden',
            'rounded-[var(--radius-md)] border border-[var(--color-border)]',
            'bg-[var(--color-surface-raised)] py-1 shadow-[var(--shadow-elevated)]',
          )}
        >
          <div className="border-b border-[var(--color-border)] px-3 py-2">
            <p className="truncate text-xs font-semibold text-[var(--color-text-primary)]">{firstName}</p>
            <p className="truncate text-xs text-[var(--color-text-tertiary)]">{user?.email}</p>
          </div>

          {MENU_ITEMS.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.id}
                to={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-[var(--color-accent-subtle)] text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-primary)]',
                )}
              >
                <Icon width={16} height={16} aria-hidden />
                {item.label}
              </Link>
            )
          })}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              void signOut().then(() => navigate('/login'))
            }}
            className="flex w-full items-center px-3 py-2.5 text-left text-sm text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)]/10"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
