import { useEffect, useRef } from 'react'
import { scrollBehavior } from '@lib/motion'
import { IconSparkles } from '@components/ui/icons'
import { cn } from '@lib/utils'
import type { ChatMessage } from '../types'
import { MarkdownContent } from './MarkdownContent'
import { TypingIndicator } from './TypingIndicator'

interface ChatMessageBubbleProps {
  message: ChatMessage
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user'
  const showTyping = message.role === 'assistant' && message.isStreaming && !message.content

  return (
    <article
      className={cn('flex gap-3 px-4 py-3', isUser ? 'justify-end' : 'justify-start')}
      aria-label={isUser ? 'Your message' : 'Assistant message'}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent-muted)]">
          <IconSparkles width={16} height={16} />
        </div>
      )}

      <div
        className={cn(
          'max-w-[min(100%,720px)] rounded-[var(--radius-lg)] px-4 py-3',
          isUser
            ? 'bg-[var(--color-accent)] text-white'
            : 'border border-[var(--color-border)] bg-[var(--color-surface-raised)]',
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        ) : showTyping ? (
          <TypingIndicator />
        ) : (
          <MarkdownContent
            content={message.content}
            className={message.isStreaming ? 'opacity-90' : undefined}
          />
        )}
        <p
          className={cn(
            'mt-2 text-[10px] tabular-nums',
            isUser ? 'text-white/60' : 'text-[var(--color-text-tertiary)]',
          )}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </article>
  )
}

interface MessageListProps {
  messages: ChatMessage[]
  isTyping: boolean
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: scrollBehavior() })
  }, [messages, isTyping])

  return (
    <div className="flex-1 overflow-y-auto" aria-live="polite" aria-label="Chat messages">
      <div className="mx-auto max-w-3xl py-4">
        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-3 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/20">
              <IconSparkles width={16} height={16} className="text-[var(--color-accent-muted)]" />
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
