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
import { useGoals } from '@features/goals/hooks/useGoals'
import { useTasks } from '@features/tasks/hooks/useTasks'
import { getUnifiedPlanningDeadlines } from '@features/college/utils'
import { collegeService } from '@services/database/colleges'
import { collegeUserDataService } from '@services/database/collegeUserData'
import type { PlanningDeadline } from '@features/college/types'
import { showBrowserNotification } from '@lib/notifications/browserNotifications'
import {
  collectDateApproachReminders,
  collectTaskReminders,
  type ReminderDispatch,
} from '@lib/notifications/deadlineReminders'
import type { AppNotification } from '../types'
import { NotificationToastStack } from '../components/NotificationToastStack'

const SENT_KEY = 'seldom-notified-deadlines'
const CHECK_INTERVAL_MS = 60_000
const COLLEGE_REFRESH_MS = 5 * 60_000

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
  const { browserNotificationsEnabled, emailNotificationsEnabled, reminderLeadMinutes, collegeEnabled } =
    useUserPreferences()
  const { tasks } = useTasks()
  const { goals } = useGoals()

  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [toasts, setToasts] = useState<AppNotification[]>([])
  const [planningDeadlines, setPlanningDeadlines] = useState<PlanningDeadline[]>([])
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

  const dispatchReminder = useCallback(
    async (dispatch: ReminderDispatch, emailPayload?: { taskId: string; title: string; deadline: string }) => {
      if (sentRef.current.has(dispatch.key)) return
      sentRef.current.add(dispatch.key)
      saveSentIds(sentRef.current)

      pushNotification({
        title: dispatch.title,
        body: dispatch.body,
        kind: dispatch.kind,
        at: new Date().toISOString(),
        href: dispatch.href,
      })

      if (browserNotificationsEnabled && dispatch.browserTag) {
        showBrowserNotification('Seldom reminder', {
          body: dispatch.body,
          tag: dispatch.browserTag,
        })
      }

      if (emailPayload && emailNotificationsEnabled && session?.access_token) {
        try {
          await fetch('/api/notifications/email-reminder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(emailPayload),
          })
        } catch {
          /* email optional */
        }
      }
    },
    [browserNotificationsEnabled, emailNotificationsEnabled, pushNotification, session?.access_token],
  )

  useEffect(() => {
    if (!user || !collegeEnabled) {
      setPlanningDeadlines([])
      return
    }

    let cancelled = false

    const userId = user.id

    async function loadCollegeDeadlines() {
      try {
        const [colleges, userData] = await Promise.all([
          collegeService.fetchAll(),
          collegeUserDataService.fetch(userId),
        ])
        if (cancelled) return
        setPlanningDeadlines(
          getUnifiedPlanningDeadlines(colleges, userData.financialAid, userData.scholarships, 50),
        )
      } catch {
        if (!cancelled) setPlanningDeadlines([])
      }
    }

    void loadCollegeDeadlines()
    const interval = window.setInterval(() => void loadCollegeDeadlines(), COLLEGE_REFRESH_MS)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [user, collegeEnabled])

  const checkReminders = useCallback(async () => {
    if (!user) return

    const leadMs = reminderLeadMinutes * 60 * 1000
    const sentIds = sentRef.current

    for (const task of tasks) {
      if (!task.deadline || task.completed) continue
      const deadline = task.deadline

      for (const dispatch of collectTaskReminders(
        { id: task.id, title: task.title, deadline },
        leadMs,
        sentIds,
      )) {
        const isLead = dispatch.key.startsWith('task:lead:')
        await dispatchReminder(
          dispatch,
          isLead ? { taskId: task.id, title: task.title, deadline } : undefined,
        )
      }
    }

    for (const goal of goals) {
      if (goal.status !== 'active' || !goal.target_date) continue
      for (const dispatch of collectDateApproachReminders(
        {
          id: goal.id,
          title: goal.title,
          date: goal.target_date,
          href: '/goals',
          prefix: 'goal',
        },
        sentIds,
      )) {
        await dispatchReminder(dispatch)
      }
    }

    for (const deadline of planningDeadlines) {
      for (const dispatch of collectDateApproachReminders(
        {
          id: deadline.id,
          title: deadline.label,
          date: deadline.date,
          subtitle: deadline.subtitle,
          href: '/college/deadlines',
          prefix: 'college',
        },
        sentIds,
      )) {
        await dispatchReminder(dispatch)
      }
    }
  }, [dispatchReminder, goals, planningDeadlines, reminderLeadMinutes, tasks, user])

  useEffect(() => {
    if (!user) return
    void checkReminders()
    const interval = window.setInterval(() => void checkReminders(), CHECK_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [checkReminders, user])

  useEffect(() => {
    if (!user) return
    function onVisible() {
      if (document.visibilityState === 'visible') void checkReminders()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
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
