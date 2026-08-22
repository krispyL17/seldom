const SENIOR_HINT_DISMISSED_KEY = 'seldom:college-senior-hint-dismissed'

export function isSeniorHintDismissed(): boolean {
  try {
    return localStorage.getItem(SENIOR_HINT_DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

export function dismissSeniorHint(): void {
  try {
    localStorage.setItem(SENIOR_HINT_DISMISSED_KEY, '1')
  } catch {
    // ignore storage failures
  }
}
