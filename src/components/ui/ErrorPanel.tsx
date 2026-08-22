import { Button } from './Button'
import { Panel } from './Panel'

interface ErrorPanelProps {
  message: string
  onRetry?: () => void
  title?: string
  retryLabel?: string
}

export function ErrorPanel({
  message,
  onRetry,
  title = "Couldn't load this",
  retryLabel = 'Try again',
}: ErrorPanelProps) {
  return (
    <Panel title={title}>
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]" role="alert">
        {message}
      </p>
      {onRetry && (
        <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </Panel>
  )
}
