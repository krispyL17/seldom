import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@features/preferences'
import { useTasks } from '@features/tasks/hooks/useTasks'
import { showBrowserNotification } from '@lib/notifications/browserNotifications'
import type { AppNotification } from '../types'
import { NotificationToastStack } from '../components/NotificationToastStack'

const SENT_KEY = 'seldom-notified-deadlines'

interface NotificationContextValue {
  notifications: AppNotification[]
  unreadCount: number
  panelOpen: boolean
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void
  markRead: (id: string) => void
  markAllRead: () => void
  dismiss: (id: string) => void
  pushInfo: (title: string, body: string, href?: string) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

function loadSentIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SENT_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveSentIds(ids: Set<string>) {
  localStorage.setItem(SENT_KEY, JSON.stringify([...ids]))
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, session } = useAuth()
  const { browserNotificationsEnabled, emailNotificationsEnabled, reminderLeadMinutes } =
    useUserPreferences()
  const { tasks } = useTasks()

  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [toasts, setToasts] = useState<AppNotification[]>([])
  const sentRef = useRef(loadSentIds())

  const pushNotification = useCallback((n: Omit<AppNotification, 'id' | 'read'>) => {
    const full: AppNotification = {
      ...n,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      read: false,
    }
    setNotifications((prev) => [full, ...prev].slice(0, 50))
    setToasts((prev) => [full, ...prev].slice(0, 4))
    return full
  }, [])

  const pushInfo = useCallback(
    (title: string, body: string, href?: string) => {
      pushNotification({ title, body, kind: 'info', at: new Date().toISOString(), href })
    },
    [pushNotification],
  )

  const checkReminders = useCallback(async () => {
    if (!user) return

    const now = Date.now()
    const leadMs = reminderLeadMinutes * 60 * 1000

    for (const task of tasks) {
      if (!task.deadline || task.completed) continue
      const deadlineMs = new Date(task.deadline).getTime()
      if (Number.isNaN(deadlineMs)) continue

      const key = `${task.id}:${task.deadline}`
      if (sentRef.current.has(key)) continue

      const diff = deadlineMs - now
      if (diff > leadMs || diff < -5 * 60 * 1000) continue

      sentRef.current.add(key)
      saveSentIds(sentRef.current)

      const timeLabel = new Date(task.deadline).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })

      pushNotification({
        title: 'Task reminder',
        body: `${task.title} — due ${timeLabel}`,
        kind: 'reminder',
        at: new Date().toISOString(),
        href: '/tasks',
      })

      if (browserNotificationsEnabled) {
        showBrowserNotification('Seldom reminder', {
          body: `${task.title} — due ${timeLabel}`,
          tag: key,
        })
      }

      if (emailNotificationsEnabled && session?.access_token) {
        try {
          await fetch('/api/notifications/email-reminder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              taskId: task.id,
              title: task.title,
              deadline: task.deadline,
            }),
          })
        } catch {
          /* email optional */
        }
      }
    }
  }, [
    browserNotificationsEnabled,
    emailNotificationsEnabled,
    pushNotification,
    reminderLeadMinutes,
    session?.access_token,
    tasks,
    user,
  ])

  useEffect(() => {
    if (!user) return
    void checkReminders()
    const interval = window.setInterval(() => void checkReminders(), 60_000)
    return () => window.clearInterval(interval)
  }, [checkReminders, user])

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setToasts((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      panelOpen,
      openPanel: () => setPanelOpen(true),
      closePanel: () => setPanelOpen(false),
      togglePanel: () => setPanelOpen((o) => !o),
      markRead,
      markAllRead,
      dismiss,
      pushInfo,
    }),
    [notifications, unreadCount, panelOpen, markRead, markAllRead, dismiss, pushInfo],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationToastStack toasts={toasts} onDismiss={dismissToast} />
    </NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return ctx
}
