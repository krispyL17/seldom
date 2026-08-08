import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

let loaded = false

function parseEnvFile(path: string): void {
  const content = readFileSync(path, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

/** Load `.env.local` into process.env for Vercel dev API routes (idempotent). */
export function ensureDevEnvLoaded(): void {
  if (loaded) return
  loaded = true

  for (const file of ['.env.local', '.env.development.local', '.env']) {
    const path = resolve(process.cwd(), file)
    if (existsSync(path)) {
      parseEnvFile(path)
    }
  }
}
