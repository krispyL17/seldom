import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@components/ui/Button'
import { Card, CardHeader } from '@components/ui/Card'
import { fetchOllamaStatus, type OllamaStatusResponse } from '@services/ollama'

function formatTimestamp(iso: string | null): string {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleString()
}

export function AiSettingsPage() {
  const [status, setStatus] = useState<OllamaStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOllamaStatus()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load Ollama status')
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="mx-auto max-w-[720px] space-y-4 animate-fade-in">
      <header>
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">AI Settings</h1>
        <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
          Seldom uses Ollama locally for all AI features. This page is informational — configure Ollama via
          environment variables.
        </p>
      </header>

      <Card>
        <CardHeader title="Ollama status" description="Local AI engine" />
        {loading ? (
          <p className="text-xs text-[var(--color-text-tertiary)]">Checking Ollama…</p>
        ) : error ? (
          <div className="space-y-2">
            <p className="text-xs text-[var(--color-danger)]">{error}</p>
            <Button size="sm" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        ) : status ? (
          <dl className="grid gap-2 text-xs sm:grid-cols-2">
            <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-3 py-2">
              <dt className="text-[var(--color-text-tertiary)]">Status</dt>
              <dd className="mt-0.5 font-medium text-[var(--color-text-primary)]">
                {status.online ? 'Online' : 'Offline'}
              </dd>
            </div>
            <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-3 py-2">
              <dt className="text-[var(--color-text-tertiary)]">Model</dt>
              <dd className="mt-0.5 font-medium text-[var(--color-text-primary)]">
                {status.model ?? 'Not configured'}
              </dd>
            </div>
            <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-3 py-2 sm:col-span-2">
              <dt className="text-[var(--color-text-tertiary)]">Ollama URL</dt>
              <dd className="mt-0.5 font-mono text-[11px] text-[var(--color-text-primary)]">
                {status.baseUrl}
              </dd>
            </div>
            <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-3 py-2">
              <dt className="text-[var(--color-text-tertiary)]">Response time</dt>
              <dd className="mt-0.5 font-medium tabular-nums text-[var(--color-text-primary)]">
                {status.responseTimeMs != null ? `${status.responseTimeMs} ms` : '—'}
              </dd>
            </div>
            <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-3 py-2">
              <dt className="text-[var(--color-text-tertiary)]">Last successful connection</dt>
              <dd className="mt-0.5 text-[var(--color-text-primary)]">
                {formatTimestamp(status.lastSuccessfulAt)}
              </dd>
            </div>
          </dl>
        ) : null}

        {!loading && (
          <Button size="sm" variant="secondary" className="mt-3" onClick={() => void load()}>
            Retry connection
          </Button>
        )}
      </Card>

      <Card>
        <CardHeader title="Environment variables" description=".env.local for dev:vercel · Vercel dashboard for production" />
        <pre className="overflow-x-auto rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] p-3 text-[11px] text-[var(--color-text-secondary)]">
{`OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:8b
# Production: set OLLAMA_BASE_URL to a URL Vercel can reach (tunnel/VPS)
# Optional: OLLAMA_EMBED_MODEL, OLLAMA_API_KEY`}
        </pre>
        {status && !status.configured && status.missing.length > 0 && (
          <p className="mt-2 text-[11px] text-[var(--color-warning)]">
            Missing: {status.missing.join('; ')}
          </p>
        )}
        {!status?.online && (
          <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">
            Start Ollama, pull your model, then restart <code className="text-[10px]">npm run dev:vercel</code>.
          </p>
        )}
      </Card>

      <p className="text-[11px] text-[var(--color-text-tertiary)]">
        <Link to="/settings" className="text-[var(--color-accent-muted)] hover:underline">
          ← Back to Settings
        </Link>
      </p>
    </div>
  )
}
