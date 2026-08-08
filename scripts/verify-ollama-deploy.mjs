#!/usr/bin/env node
/**
 * Pre-flight checks for Seldom + Ollama + Vercel.
 * Usage: node scripts/verify-ollama-deploy.mjs [--url http://localhost:3000]
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const urlFlag = args.find((a) => a.startsWith('--url='))
const appUrl = urlFlag?.split('=')[1] ?? 'http://localhost:3000'

function loadEnvFile(name) {
  const path = resolve(process.cwd(), name)
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
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
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

function env(key) {
  return process.env[key]?.trim() || undefined
}

function envWithFallback(key, fallbackKey) {
  return env(key) ?? env(fallbackKey)
}

const required = [
  ['VITE_SUPABASE_URL', null],
  ['VITE_SUPABASE_ANON_KEY', null],
  ['SUPABASE_URL', 'VITE_SUPABASE_URL'],
  ['SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'],
  ['OLLAMA_MODEL', null],
]

const recommended = ['OLLAMA_BASE_URL']

console.log('Seldom Ollama + Vercel deploy check\n')

let failed = false

for (const [key, fallbackKey] of required) {
  const value = fallbackKey ? envWithFallback(key, fallbackKey) : env(key)
  if (!value) {
    console.log(`✗ ${key} — missing${fallbackKey ? ` (or ${fallbackKey})` : ''}`)
    failed = true
  } else {
    const masked = key.includes('KEY') ? `${value.slice(0, 6)}…` : value
    console.log(`✓ ${key} = ${masked}`)
  }
}

for (const key of recommended) {
  const value = process.env[key]?.trim()
  console.log(value ? `✓ ${key} = ${value}` : `· ${key} — using default http://localhost:11434`)
}

const ollamaBase = (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434').replace(/\/$/, '')

try {
  const started = Date.now()
  const res = await fetch(`${ollamaBase}/api/tags`, { signal: AbortSignal.timeout(8000) })
  const ms = Date.now() - started
  if (res.ok) {
    console.log(`✓ Ollama reachable at ${ollamaBase} (${ms} ms)`)
    const data = await res.json()
    const names = (data.models ?? []).map((m) => m.name)
    const model = env('OLLAMA_MODEL')
    if (model && names.some((n) => n === model || n.startsWith(`${model}:`))) {
      console.log(`✓ Model "${model}" is available in Ollama`)
    } else if (model) {
      console.log(`⚠ Model "${model}" not in Ollama list — run: ollama pull ${model}`)
      failed = true
    }
  } else {
    console.log(`✗ Ollama HTTP ${res.status} at ${ollamaBase}`)
    failed = true
  }
} catch (err) {
  console.log(`✗ Ollama unreachable at ${ollamaBase} — ${err instanceof Error ? err.message : err}`)
  console.log('  Start Ollama, finish pulling your model, then retry.')
  failed = true
}

try {
  const healthRes = await fetch(`${appUrl}/api/health`, { signal: AbortSignal.timeout(10000) })
  const health = await healthRes.json()
  if (healthRes.ok && health.assistant) {
    console.log(`✓ App API healthy at ${appUrl}/api/health`)
  } else {
    console.log(`⚠ App API at ${appUrl}/api/health — assistant not ready`)
    if (health.hint) console.log(`  ${health.hint}`)
    console.log('  Run: npm run dev:vercel')
  }
} catch {
  console.log(`· App API not running at ${appUrl} (start with npm run dev:vercel)`)
}

console.log('')
if (failed) {
  console.log('Fix the issues above, then:')
  console.log('  1. npm run dev:vercel          # local full stack')
  console.log('  2. npm run deploy:prod         # production deploy')
  process.exit(1)
}

console.log('Ready for Ollama + Vercel.')
console.log('  Local:  npm run dev:vercel  →  http://localhost:3000')
console.log('  Deploy: npm run deploy:prod')
