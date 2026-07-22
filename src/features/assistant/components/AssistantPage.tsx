import { useState } from 'react'
import { IconMenu } from '@components/ui/icons'
import { useAssistantChat } from '../hooks/useAssistantChat'
import { ConversationSidebar } from './ConversationSidebar'
import { MessageList } from './MessageList'
import { ChatComposer } from './ChatComposer'
import { cn } from '@lib/utils'

export function AssistantPage() {
  const {
    conversations,
    activeConversation,
    activeId,
    isTyping,
    sendMessage,
    newConversation,
    selectConversation,
    deleteConversation,
  } = useAssistantChat()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div
      className={cn(
        '-mx-4 -my-4 flex overflow-hidden md:-mx-6 md:-my-6',
        'h-[calc(100dvh-4rem)] md:h-[calc(100dvh-4.5rem)]',
      )}
    >
      {/* Desktop sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onNew={newConversation}
        onDelete={deleteConversation}
        className="hidden w-64 shrink-0 md:flex lg:w-72"
      />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <ConversationSidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={(id) => {
              selectConversation(id)
              setSidebarOpen(false)
            }}
            onNew={() => {
              newConversation()
              setSidebarOpen(false)
            }}
            onDelete={deleteConversation}
            className="fixed inset-y-0 left-0 z-50 w-72 md:hidden"
          />
        </>
      )}

      {/* Main chat column */}
      <div className="flex min-w-0 flex-1 flex-col bg-[var(--color-surface-base)]">
        <header className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-[var(--radius-sm)] p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)] md:hidden"
            aria-label="Open conversation history"
          >
            <IconMenu width={20} height={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
              {activeConversation?.title ?? 'AI Assistant'}
            </h2>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">
              Preview · simulated responses
            </p>
          </div>
        </header>

        {activeConversation ? (
          <>
            <MessageList messages={activeConversation.messages} isTyping={isTyping} />
            <ChatComposer onSend={sendMessage} disabled={isTyping} />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--color-text-tertiary)]">
            Start a new chat to begin
          </div>
        )}
      </div>
    </div>
  )
}
