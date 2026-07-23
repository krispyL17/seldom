export type BrowserNotificationPermission = NotificationPermission | 'unsupported'

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getBrowserNotificationPermission(): BrowserNotificationPermission {
  if (!isBrowserNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestBrowserNotificationPermission(): Promise<BrowserNotificationPermission> {
  if (!isBrowserNotificationSupported()) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  const result = await Notification.requestPermission()
  return result
}

export function showBrowserNotification(title: string, options?: NotificationOptions): void {
  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') return
  try {
    new Notification(title, {
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      ...options,
    })
  } catch {
    /* Safari / restricted contexts */
  }
}
