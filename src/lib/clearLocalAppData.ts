/** Local caches cleared on tutorial/reset version bump (SQL wipe does not touch these). */
const LOCAL_APP_DATA_KEYS = [
  'seldom-gym-logs',
  'seldom-assistant-conversations',
  'seldom-notified-deadlines',
  'seldom-user-preferences',
] as const

export function clearLocalAppData(): void {
  for (const key of LOCAL_APP_DATA_KEYS) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  }
}
