/**
 * Starts memory + search sidecars together for local development.
 */
import { spawn, type ChildProcess } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function run(label: string, script: string): ChildProcess {
  console.log(`[${label}] starting...`)
  return spawn('npx', ['tsx', script], {
    cwd: join(root, '..'),
    stdio: 'inherit',
    shell: true,
  })
}

const children = [
  run('memory', 'server/memory/index.ts'),
  run('search', 'server/search/index.ts'),
]

function shutdown() {
  for (const child of children) {
    child.kill('SIGTERM')
  }
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

for (const child of children) {
  child.on('exit', (code) => {
    console.error(`[services] A service exited with code ${code ?? 0}`)
    shutdown()
  })
}
