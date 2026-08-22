const PREFIX = 'seldom:tab-intro-pending:'

/** Request a tab intro the next time the user lands on that tab. */
export function queueTabIntro(tabId: string): void {
  try {
    sessionStorage.setItem(`${PREFIX}${tabId}`, '1')
  } catch {
    /* storage unavailable */
  }
}

/** Returns true once per queued tab intro, then clears the request. */
export function consumePendingTabIntro(tabId: string): boolean {
  try {
    const key = `${PREFIX}${tabId}`
    if (!sessionStorage.getItem(key)) return false
    sessionStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
