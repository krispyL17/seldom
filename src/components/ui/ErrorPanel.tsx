import { Button } from './Button'
import { Panel } from './Panel'

interface ErrorPanelProps {
  message: string
  onRetry?: () => void
  title?: string
}

export function ErrorPanel({ message, onRetry, title = 'Unable to load' }: ErrorPanelProps) {
  return (
    <Panel title={title} subtitle="Something went wrong">
      <p className="text-sm text-[var(--color-danger)]" role="alert">
        {message}
      </p>
      {onRetry && (
        <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Panel>
  )
}
