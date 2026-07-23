export type NotificationKind = 'reminder' | 'info' | 'deadline'

export interface AppNotification {
  id: string
  title: string
  body: string
  kind: NotificationKind
  at: string
  href?: string
  read: boolean
}

export interface ReminderPayload {
  taskId: string
  title: string
  deadline: string
}
