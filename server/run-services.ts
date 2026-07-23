/**
 * Starts memory + search + analytics sidecars together for local development.
 */
import { spawn, type ChildProcess } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const tsxCli = require.resolve('tsx/cli')

function run(label: string, relScript: string): ChildProcess {
  const script = join(root, relScript)
  console.log(`[${label}] starting...`)
  return spawn(process.execPath, [tsxCli, script], {
    cwd: root,
    stdio: 'inherit',
  })
}

const children = [
  run('memory', 'server/memory/index.ts'),
  run('search', 'server/search/index.ts'),
  run('analytics', 'server/analytics/index.ts'),
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
