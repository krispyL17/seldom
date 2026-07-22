import { IconPlus, IconTrash } from '@components/ui/icons'
import { cn } from '@lib/utils'
import type { Conversation } from '../types'

interface ConversationSidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  className?: string
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  className,
}: ConversationSidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-raised)]',
        className,
      )}
    >
      <div className="border-b border-[var(--color-border)] p-3">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-elevated)]"
        >
          <IconPlus width={16} height={16} />
          New chat
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Conversation history">
        {conversations.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-[var(--color-text-tertiary)]">
            No conversations yet
          </p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((conv) => {
              const isActive = conv.id === activeId
              return (
                <li key={conv.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelect(conv.id)}
                    className={cn(
                      'w-full rounded-[var(--radius-sm)] px-3 py-2.5 pr-9 text-left text-sm transition-colors',
                      isActive
                        ? 'bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)]/60',
                    )}
                  >
                    <span className="line-clamp-2">{conv.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Delete this conversation?')) onDelete(conv.id)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--color-text-tertiary)] opacity-0 transition-opacity hover:text-[var(--color-danger)] group-hover:opacity-100"
                    aria-label="Delete conversation"
                  >
                    <IconTrash width={14} height={14} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </nav>
    </aside>
  )
}
