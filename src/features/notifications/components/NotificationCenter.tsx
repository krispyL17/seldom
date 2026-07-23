import { Link } from 'react-router-dom'
import { cn } from '@lib/utils'
import { useNotifications } from '../providers/NotificationProvider'

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    panelOpen,
    closePanel,
    markRead,
    markAllRead,
    dismiss,
  } = useNotifications()

  if (!panelOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={closePanel} aria-hidden />

      <div
        role="dialog"
        aria-label="Notifications"
        className={cn(
          'fixed right-4 top-16 z-50 w-full max-w-sm animate-scale-in',
          'rounded-[var(--radius-lg)] border border-[var(--color-border)]',
          'bg-[var(--color-surface-raised)] shadow-[var(--shadow-elevated)]',
          'md:right-6',
        )}
      >
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs font-normal text-[var(--color-text-tertiary)]">
                {unreadCount} unread
              </span>
            )}
          </h2>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[10px] text-[var(--color-accent-muted)] hover:underline"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={closePanel}
              aria-label="Close notifications"
              className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            >
              ×
            </button>
          </div>
        </header>

        <ul className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <li className="px-4 py-8 text-center text-xs text-[var(--color-text-tertiary)]">
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
                    <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">{n.body}</p>
                    {n.href && (
                      <Link
                        to={n.href}
                        onClick={() => {
                          markRead(n.id)
                          closePanel()
                        }}
                        className="mt-1 inline-block text-[10px] text-[var(--color-accent-muted)] hover:underline"
                      >
                        Open
                      </Link>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(n.id)}
                    aria-label="Dismiss"
                    className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                  >
                    ×
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
