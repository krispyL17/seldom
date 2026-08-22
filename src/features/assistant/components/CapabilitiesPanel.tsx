import type { AssistantMode, AssistantModule } from '@services/assistant/assistantClient'
import { Panel } from '@components/ui/Panel'
import { cn } from '@lib/utils'

interface CapabilitiesPanelProps {
  modules: AssistantModule[]
  activeMode: AssistantMode
  onSelectMode: (mode: AssistantMode) => void
  className?: string
}

export function CapabilitiesPanel({
  modules,
  activeMode,
  onSelectMode,
  className,
}: CapabilitiesPanelProps) {
  return (
    <Panel
      title="Capabilities"
      subtitle="Modular OS orchestration"
      className={cn('h-full', className)}
    >
      <ul className="space-y-1.5">
        {modules.map((mod) => {
          const selected = activeMode === mod.mode
          return (
            <li key={mod.id}>
              <button
                type="button"
                onClick={() => onSelectMode(mod.mode)}
                className={cn(
                  'w-full rounded-[var(--radius-sm)] border px-3 py-2 text-left transition-colors',
                  selected
                    ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-overlay)] hover:border-[var(--color-accent)]/30',
                )}
              >
                <p className="text-xs font-medium text-[var(--color-text-primary)]">{mod.label}</p>
                <p className="mt-0.5 text-xs leading-snug text-[var(--color-text-tertiary)]">
                  {mod.description}
                </p>
              </button>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={() => onSelectMode('chat')}
            className={cn(
              'w-full rounded-[var(--radius-sm)] border px-3 py-2 text-left transition-colors',
              activeMode === 'chat'
                ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10'
                : 'border-[var(--color-border)] bg-[var(--color-surface-overlay)] hover:border-[var(--color-accent)]/30',
            )}
          >
            <p className="text-xs font-medium text-[var(--color-text-primary)]">General chat</p>
            <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
              Auto-routes to the best capability
            </p>
          </button>
        </li>
      </ul>
    </Panel>
  )
}
