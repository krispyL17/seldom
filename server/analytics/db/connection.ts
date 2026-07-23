import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { AnalyticsServerConfig } from '../../../analytics/types.js'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS gym_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_date TEXT NOT NULL,
  duration_min INTEGER NOT NULL,
  workout_type TEXT,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gym_logs_user ON gym_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_logs_date ON gym_logs(session_date DESC);

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  user_id TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL,
  dashboard_json TEXT NOT NULL,
  computed_at TEXT NOT NULL
);
`

export type AnalyticsDatabase = DatabaseSync

export function openAnalyticsDatabase(config: AnalyticsServerConfig): AnalyticsDatabase {
  const dbPath = resolve(process.cwd(), config.dbPath)
  mkdirSync(dirname(dbPath), { recursive: true })

  const db = new DatabaseSync(dbPath)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec(SCHEMA)
  return db
}
