const storageKey = (userId: string) => `seldom-custom-tabs-prompt-dismissed-${userId}`

export function readCustomTabsPromptDismissed(userId: string): boolean {
  try {
    return localStorage.getItem(storageKey(userId)) === '1'
  } catch {
    return false
  }
}

export function writeCustomTabsPromptDismissed(userId: string): void {
  try {
    localStorage.setItem(storageKey(userId), '1')
  } catch {
    /* ignore */
  }
}
