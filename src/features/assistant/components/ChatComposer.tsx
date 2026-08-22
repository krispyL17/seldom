import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Button } from '@components/ui/Button'
import type { AssistantMode } from '@services/assistant/assistantClient'
import { MODE_LABELS } from '../data/capabilities'

interface ChatComposerProps {
  onSend: (message: string) => void
  disabled?: boolean
  suggestions: string[]
  activeMode: AssistantMode
}

export function ChatComposer({ onSend, disabled, suggestions, activeMode }: ChatComposerProps) {
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
        {activeMode !== 'chat' && (
          <p className="mb-2 text-center text-xs text-[var(--color-accent-muted)]">
            Mode: {MODE_LABELS[activeMode]}
          </p>
        )}
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Seldom OS anything…"
            aria-label="Message to Seldom OS"
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
        <p className="mt-2 text-center text-xs text-[var(--color-text-tertiary)]">
          Enter to send · Shift+Enter for new line · Memory + pattern detection when connected
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => setInput(s)}
              aria-label={`Use suggestion: ${s}`}
              className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent-muted)] disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
