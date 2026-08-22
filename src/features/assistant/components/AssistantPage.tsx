import { useEffect } from 'react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { IconMenu } from '@components/ui/icons'
import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { useAssistantChat } from '../hooks/useAssistantChat'
import type { AssistantMode } from '@services/assistant/assistantClient'
import { ConversationSidebar } from './ConversationSidebar'
import { MessageList } from './MessageList'
import { ChatComposer } from './ChatComposer'
import { CapabilitiesPanel } from './CapabilitiesPanel'
import { ProactiveInsightsPanel } from './ProactiveInsightsPanel'
import { MODE_LABELS } from '../data/capabilities'
import { cn } from '@lib/utils'
import { InjuryModeAiSuggestion } from '@features/soccer/athlete/components/InjuryModeAiSuggestion'

export function AssistantPage() {
  const {
    conversations,
    activeConversation,
    activeId,
    isTyping,
    activeMode,
    setActiveMode,
    modules,
    suggestions,
    proactiveInsights,
    liveConnected,
    connectionHint,
    lastMode,
    sendMessage,
    newConversation,
    selectConversation,
    deleteConversation,
    retryConnection,
  } = useAssistantChat()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [injuryPrompt, setInjuryPrompt] = useState<string | null>(null)
  const [searchParams] = useSearchParams()

  function handleSend(content: string, modeOverride?: AssistantMode) {
    if (activeMode === 'soccer_drills' || modeOverride === 'soccer_drills') {
      setInjuryPrompt(content.trim())
    }
    sendMessage(content, modeOverride)
  }

  useEffect(() => {
    const mode = searchParams.get('mode')
    const valid: AssistantMode[] = [
      'chat',
      'daily_plan',
      'weekly_review',
      'goal_breakdown',
      'brainstorm',
      'essay_ideas',
      'project_ideas',
      'coding_ideas',
      'soccer_drills',
      'research_topics',
      'college_planning',
      'scholarship_ideas',
      'personal_recommendations',
      'reflection',
      'project_management',
    ]
    if (mode && valid.includes(mode as AssistantMode)) {
      setActiveMode(mode as AssistantMode)
    }
  }, [searchParams, setActiveMode])

  const modeLabel = lastMode ? MODE_LABELS[lastMode] : MODE_LABELS[activeMode]

  return (
    <div
      className={cn(
        '-mx-4 -my-4 flex overflow-hidden md:-mx-6 md:-my-6',
        'h-[calc(100dvh-4rem)] md:h-[calc(100dvh-4.5rem)]',
      )}
    >
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onNew={newConversation}
        onDelete={deleteConversation}
        className="hidden w-64 shrink-0 md:flex lg:w-72"
      />

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
              {activeConversation?.title ?? 'Seldom AI'}
            </h2>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {liveConnected
                ? `Live · ${modeLabel}`
                : connectionHint ?? 'Ollama offline — start Ollama and retry'}
            </p>
          </div>
          {!liveConnected && (
            <Button size="sm" variant="secondary" onClick={() => void retryConnection()}>
              Retry
            </Button>
          )}
          <Badge variant={liveConnected ? 'success' : 'muted'}>
            {liveConnected ? 'Connected' : 'Offline'}
          </Badge>
        </header>

        {activeConversation ? (
          <>
            <MessageList messages={activeConversation.messages} isTyping={isTyping} />
            <InjuryModeAiSuggestion
              message={injuryPrompt ?? ''}
              visible={activeMode === 'soccer_drills' && Boolean(injuryPrompt)}
              onDismiss={() => setInjuryPrompt(null)}
            />
            <ChatComposer
              onSend={handleSend}
              disabled={isTyping}
              suggestions={suggestions}
              activeMode={activeMode}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--color-text-tertiary)]">
            Start a new chat to begin
          </div>
        )}
      </div>

      <aside className="hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-surface-base)] p-4 xl:flex">
        <ProactiveInsightsPanel insights={proactiveInsights} onAct={(prompt) => handleSend(prompt)} />
        <CapabilitiesPanel
          modules={modules}
          activeMode={activeMode}
          onSelectMode={setActiveMode}
        />
      </aside>
    </div>
  )
}
