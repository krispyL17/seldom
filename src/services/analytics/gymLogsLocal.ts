import type { GymLog } from '@analytics/types'

const STORAGE_KEY = 'seldom-gym-logs'

function readAll(): GymLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as GymLog[]
  } catch {
    return []
  }
}

function writeAll(logs: GymLog[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function fetchLocalGymLogs(userId: string): GymLog[] {
  return readAll()
    .filter((log) => log.user_id === userId)
    .sort((a, b) => b.session_date.localeCompare(a.session_date))
}

export function addLocalGymLog(
  userId: string,
  input: { session_date: string; duration_min: number; workout_type?: string; notes?: string },
): GymLog {
  const now = new Date().toISOString()
  const log: GymLog = {
    id: generateId(),
    user_id: userId,
    session_date: input.session_date,
    duration_min: input.duration_min,
    workout_type: input.workout_type?.trim() || null,
    notes: input.notes?.trim() || null,
    created_at: now,
  }
  writeAll([log, ...readAll()])
  return log
}
