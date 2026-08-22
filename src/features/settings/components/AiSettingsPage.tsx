import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@components/ui/Button'
import { Card, CardHeader } from '@components/ui/Card'
import { formatUserError } from '@lib/userFacingError'
import { fetchOllamaStatus, type OllamaStatusResponse } from '@services/ollama'

function formatTimestamp(iso: string | null): string {
  if (!iso) return 'Not yet connected'
  return new Date(iso).toLocaleString()
}

function statusSummary(status: OllamaStatusResponse): string {
  if (!status.configured) {
    return 'AI is not set up on this deployment yet. Ask whoever hosts Seldom for you.'
  }
  if (!status.online) {
    return 'AI is offline right now. Chat and advisor features will show an error until the backend comes back.'
  }
  return 'AI is online. Assistant, college advisor, and training help should work.'
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
      setError(formatUserError(err, 'Could not check AI status. Try again.'))
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="mx-auto max-w-[720px] space-y-4 animate-fade-in pb-8">
      <header>
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">AI status</h1>
        <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
          Seldom AI uses a backend assistant service. You do not need to configure anything here unless
          you host the app yourself.
        </p>
      </header>

      <Card>
        <CardHeader title="Current status" description="What you can expect in chat and advisor tools" />
        {loading ? (
          <p className="text-xs text-[var(--color-text-tertiary)]">Checking status…</p>
        ) : error ? (
          <div className="space-y-2">
            <p className="text-xs text-[var(--color-danger)]">{error}</p>
            <Button size="sm" onClick={() => void load()}>
              Try again
            </Button>
          </div>
        ) : status ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--color-text-primary)]">{statusSummary(status)}</p>
            <dl className="grid gap-2 text-xs sm:grid-cols-2">
              <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-3 py-2">
                <dt className="text-[var(--color-text-tertiary)]">Connection</dt>
                <dd className="mt-0.5 font-medium text-[var(--color-text-primary)]">
                  {status.online ? 'Online' : 'Offline'}
                </dd>
              </div>
              <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-3 py-2">
                <dt className="text-[var(--color-text-tertiary)]">Model</dt>
                <dd className="mt-0.5 font-medium text-[var(--color-text-primary)]">
                  {status.model ?? 'Not set'}
                </dd>
              </div>
              <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-3 py-2 sm:col-span-2">
                <dt className="text-[var(--color-text-tertiary)]">Last successful check</dt>
                <dd className="mt-0.5 text-[var(--color-text-primary)]">
                  {formatTimestamp(status.lastSuccessfulAt)}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        {!loading && (
          <Button size="sm" variant="secondary" className="mt-3" onClick={() => void load()}>
            Refresh status
          </Button>
        )}
      </Card>

      <Card>
        <CardHeader title="Host setup" description="Only if you run or deploy Seldom yourself" />
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-[var(--color-text-secondary)] marker:content-none">
            <span className="inline-flex items-center gap-2">
              Show technical details
              <span className="text-[var(--color-text-tertiary)] group-open:rotate-90 transition-transform">
                ›
              </span>
            </span>
          </summary>
          <div className="mt-3 space-y-3">
            {status && (
              <dl className="grid gap-2 text-xs sm:grid-cols-2">
                <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-3 py-2 sm:col-span-2">
                  <dt className="text-[var(--color-text-tertiary)]">Ollama URL</dt>
                  <dd className="mt-0.5 break-all font-mono text-xs text-[var(--color-text-primary)]">
                    {status.baseUrl}
                  </dd>
                </div>
                <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-3 py-2">
                  <dt className="text-[var(--color-text-tertiary)]">Response time</dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-[var(--color-text-primary)]">
                    {status.responseTimeMs != null ? `${status.responseTimeMs} ms` : '—'}
                  </dd>
                </div>
              </dl>
            )}
            <pre className="overflow-x-auto rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] p-3 text-xs text-[var(--color-text-secondary)]">
{`OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:8b
# Production: set OLLAMA_BASE_URL to a URL your host can reach`}
            </pre>
            {status && !status.configured && status.missing.length > 0 && (
              <p className="text-xs text-[var(--color-warning)]">
                Missing configuration: {status.missing.join('; ')}
              </p>
            )}
            {status && !status.online && (
              <p className="text-xs text-[var(--color-text-secondary)]">
                Start Ollama, pull your model, then restart your local or deployed server.
              </p>
            )}
          </div>
        </details>
      </Card>

      <p className="text-xs text-[var(--color-text-tertiary)]">
        <Link to="/settings" className="text-[var(--color-accent-muted)] hover:underline">
          ← Back to Settings
        </Link>
      </p>
    </div>
  )
}
