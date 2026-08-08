let syncFn: (() => Promise<void>) | null = null
let recoveryFn: (() => Promise<void>) | null = null

export function registerStreakSync(fn: () => Promise<void>): () => void {
  syncFn = fn
  return () => {
    if (syncFn === fn) syncFn = null
  }
}

export function registerRecoverySync(fn: () => Promise<void>): () => void {
  recoveryFn = fn
  return () => {
    if (recoveryFn === fn) recoveryFn = null
  }
}

export function triggerStreakSync(): void {
  void syncFn?.()
}

export function triggerRecoverySync(): void {
  void recoveryFn?.()
}

export function triggerAthleteSync(): void {
  triggerStreakSync()
  triggerRecoverySync()
}
