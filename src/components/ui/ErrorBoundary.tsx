import { Component, type ErrorInfo, type ReactNode } from 'react'
import { boundaryErrorMessage } from '@lib/userFacingError'
import { Button } from './Button'

interface ErrorBoundaryProps {
  children: ReactNode
  title?: string
  onReset?: () => void
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private handleReset = () => {
    this.setState({ error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.error) {
      const title = this.props.title ?? 'Something went wrong'
      const message = boundaryErrorMessage(
        this.state.error,
        'We could not load this section. Try again — if it keeps happening, refresh the page.',
      )
      const devDetail = import.meta.env.DEV ? this.state.error.message : null

      return (
        <div
          role="alert"
          className="rounded-[var(--radius-lg)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-6 text-center"
        >
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
          <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">{message}</p>
          {devDetail && devDetail !== message && (
            <p className="mt-2 break-all font-mono text-xs text-[var(--color-text-tertiary)]">
              {devDetail}
            </p>
          )}
          <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={this.handleReset}>
            Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
