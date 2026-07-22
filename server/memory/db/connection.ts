import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { MemoryServerConfig } from '../../../memory/types.js'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  importance INTEGER NOT NULL CHECK (importance >= 1 AND importance <= 10),
  created_at TEXT NOT NULL,
  source_id TEXT,
  embedding BLOB NOT NULL,
  embedding_dims INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_source_id ON memories(source_id);
`

export type MemoryDatabase = DatabaseSync

export function openDatabase(config: MemoryServerConfig): MemoryDatabase {
  const dbPath = resolve(process.cwd(), config.dbPath)
  mkdirSync(dirname(dbPath), { recursive: true })

  const db = new DatabaseSync(dbPath)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec(SCHEMA)
  return db
}
