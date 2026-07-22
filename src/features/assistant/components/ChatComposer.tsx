import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Button } from '@components/ui/Button'
import { DEFAULT_SUGGESTIONS } from '../types'

interface ChatComposerProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatComposer({ onSend, disabled }: ChatComposerProps) {
  const [input, setInput] = useState('')

  function submit() {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submit()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-base)] px-4 py-4">
      <div className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Seldom Assistant…"
            rows={1}
            disabled={disabled}
            className="max-h-40 min-h-[52px] w-full resize-none rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-3.5 pl-4 pr-24 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-50"
          />
          <Button
            type="submit"
            size="sm"
            disabled={disabled || !input.trim()}
            className="absolute bottom-2.5 right-2.5"
          >
            Send
          </Button>
        </form>
        <p className="mt-2 text-center text-[10px] text-[var(--color-text-tertiary)]">
          Preview mode — no AI model connected. Enter to send, Shift+Enter for new line.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {DEFAULT_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => setInput(s)}
              className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[11px] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent-muted)] disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
