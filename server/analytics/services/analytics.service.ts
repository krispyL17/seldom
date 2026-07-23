import { randomUUID } from 'node:crypto'
import type { AnalyticsDatabase } from '../db/connection.js'
import { buildAnalyticsDashboard } from '../../../analytics/aggregations.js'
import type { AnalyticsDashboard, AnalyticsSyncPayload, GymLog } from '../../../analytics/types.js'

export class AnalyticsService {
  constructor(private db: AnalyticsDatabase) {}

  listGymLogs(userId: string): GymLog[] {
    const rows = this.db
      .prepare(
        `SELECT id, user_id, session_date, duration_min, workout_type, notes, created_at
         FROM gym_logs WHERE user_id = ? ORDER BY session_date DESC, created_at DESC`,
      )
      .all(userId) as unknown as GymLog[]
    return rows
  }

  addGymLog(
    userId: string,
    input: { session_date: string; duration_min: number; workout_type?: string; notes?: string },
  ): GymLog {
    const row: GymLog = {
      id: randomUUID(),
      user_id: userId,
      session_date: input.session_date,
      duration_min: input.duration_min,
      workout_type: input.workout_type ?? null,
      notes: input.notes ?? null,
      created_at: new Date().toISOString(),
    }

    this.db
      .prepare(
        `INSERT INTO gym_logs (id, user_id, session_date, duration_min, workout_type, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        row.id,
        row.user_id,
        row.session_date,
        row.duration_min,
        row.workout_type,
        row.notes,
        row.created_at,
      )

    return row
  }

  syncAndCompute(payload: AnalyticsSyncPayload): AnalyticsDashboard {
    const gymLogs = this.listGymLogs(payload.userId)
    const merged: AnalyticsSyncPayload = { ...payload, gymLogs }
    const dashboard = buildAnalyticsDashboard(merged, 'sqlite')

    this.db
      .prepare(
        `INSERT INTO analytics_snapshots (user_id, payload_json, dashboard_json, computed_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           payload_json = excluded.payload_json,
           dashboard_json = excluded.dashboard_json,
           computed_at = excluded.computed_at`,
      )
      .run(
        payload.userId,
        JSON.stringify(merged),
        JSON.stringify(dashboard),
        dashboard.computedAt,
      )

    return dashboard
  }

  getDashboard(userId: string): AnalyticsDashboard | null {
    const row = this.db
      .prepare(`SELECT dashboard_json FROM analytics_snapshots WHERE user_id = ?`)
      .get(userId) as { dashboard_json: string } | undefined

    if (!row) return null
    return JSON.parse(row.dashboard_json) as AnalyticsDashboard
  }

  stats(): { gymLogs: number; snapshots: number } {
    const gym = this.db.prepare(`SELECT COUNT(*) as c FROM gym_logs`).get() as { c: number }
    const snap = this.db.prepare(`SELECT COUNT(*) as c FROM analytics_snapshots`).get() as { c: number }
    return { gymLogs: gym.c, snapshots: snap.c }
  }
}
