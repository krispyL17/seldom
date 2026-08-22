import { useEffect, useId, useRef } from 'react'
import type { RefObject } from 'react'
import { Link } from 'react-router-dom'
import { IconButton } from '@components/ui/IconButton'
import { IconClose } from '@components/ui/icons'
import { useFocusTrap } from '@hooks/useFocusTrap'
import { cn } from '@lib/utils'
import { useNotifications } from '../providers/NotificationProvider'

interface NotificationCenterProps {
  triggerRef?: RefObject<HTMLButtonElement | null>
}

export function NotificationCenter({ triggerRef }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    panelOpen,
    closePanel,
    markRead,
    markAllRead,
    dismiss,
  } = useNotifications()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useFocusTrap(panelOpen, panelRef)

  useEffect(() => {
    if (!panelOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [panelOpen, closePanel])

  useEffect(() => {
    if (panelOpen) return
    triggerRef?.current?.focus()
  }, [panelOpen, triggerRef])

  if (!panelOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 animate-backdrop-in bg-[var(--color-scrim)]"
        onClick={closePanel}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'fixed right-4 top-[4.5rem] z-50 w-full max-w-sm animate-scale-in',
          'rounded-[var(--radius-lg)] border border-[var(--color-border)]',
          'bg-[var(--color-surface-raised)] shadow-[var(--shadow-elevated)]',
          'md:right-6',
        )}
      >
        <header className="panel-header flex items-center justify-between gap-3 px-4 py-3">
          <h2
            id={titleId}
            className="font-display min-w-0 text-sm font-semibold text-[var(--color-text-primary)]"
          >
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs font-normal text-[var(--color-text-tertiary)]">
                {unreadCount} unread
              </span>
            )}
          </h2>
          <div className="flex shrink-0 items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="min-h-10 rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--color-accent-muted)] transition-colors hover:bg-[var(--color-surface-overlay)] hover:underline"
              >
                Mark all read
              </button>
            )}
            <IconButton label="Close notifications" onClick={closePanel}>
              <IconClose />
            </IconButton>
          </div>
        </header>

        <ul className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
              No notifications yet. Reminders appear here when tasks are due.
            </li>
          ) : (
            notifications.map((n) => (
              <li
                key={n.id}
                className={cn(
                  'border-b border-[var(--color-border)] px-4 py-3 last:border-0',
                  !n.read && 'bg-[var(--color-accent-subtle)]/40',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--color-text-primary)]">{n.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                      {n.body}
                    </p>
                    {n.href && (
                      <Link
                        to={n.href}
                        onClick={() => {
                          markRead(n.id)
                          closePanel()
                        }}
                        className="mt-1 inline-block text-xs text-[var(--color-accent-muted)] hover:underline"
                      >
                        Open
                      </Link>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(n.id)}
                    aria-label={`Dismiss ${n.title}`}
                    className="min-h-10 rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-secondary)]"
                  >
                    Dismiss
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        <footer className="border-t border-[var(--color-border)] px-4 py-3 text-center">
          <Link
            to="/settings"
            onClick={closePanel}
            className="text-xs font-medium text-[var(--color-accent-muted)] hover:underline"
          >
            Notification settings
          </Link>
        </footer>
      </div>
    </>
  )
}
