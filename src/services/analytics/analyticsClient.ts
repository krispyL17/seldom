/**
 * Analytics client — local SQLite sidecar via /api/analytics proxy.
 */

import type { AnalyticsDashboard, AnalyticsSyncPayload, GymLog } from '@analytics/types'

const BASE = '/api/analytics'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `Analytics API error (${response.status})`)
  }

  return response.json() as Promise<T>
}

export async function analyticsHealthCheck(): Promise<{
  ok: boolean
  sqlite: boolean
  gymLogs: number
  snapshots: number
}> {
  return request('/health')
}

export async function isAnalyticsServerAvailable(): Promise<boolean> {
  try {
    const health = await analyticsHealthCheck()
    return health.ok
  } catch {
    return false
  }
}

export async function syncAnalytics(payload: AnalyticsSyncPayload): Promise<AnalyticsDashboard> {
  return request('/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchAnalyticsDashboard(userId: string): Promise<AnalyticsDashboard | null> {
  try {
    return await request<AnalyticsDashboard>(`/dashboard?userId=${encodeURIComponent(userId)}`)
  } catch {
    return null
  }
}

export async function fetchGymLogs(userId: string): Promise<GymLog[]> {
  const result = await request<{ logs: GymLog[] }>(`/gym?userId=${encodeURIComponent(userId)}`)
  return result.logs
}

export async function addGymLog(
  userId: string,
  input: { session_date: string; duration_min: number; workout_type?: string; notes?: string },
): Promise<GymLog> {
  return request('/gym', {
    method: 'POST',
    body: JSON.stringify({ userId, ...input }),
  })
}
