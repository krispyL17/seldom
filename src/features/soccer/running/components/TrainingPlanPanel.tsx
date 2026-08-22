import { useEffect, useState } from 'react'
import { Panel } from '@components/ui/Panel'
import { retrieveMemories } from '@services/memory'
import type { RunLog } from '../types'
import type { TrainingPlanSuggestion } from '../types'
import { suggestTrainingPlans } from '../trainingPlans'

interface TrainingPlanPanelProps {
  runs: RunLog[]
  sessionCount: number
  avgIntensity: number
}

export function TrainingPlanPanel({ runs, sessionCount, avgIntensity }: TrainingPlanPanelProps) {
  const [plans, setPlans] = useState<TrainingPlanSuggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      let memorySnippets: string[] = []

      try {
        const result = await retrieveMemories('training fitness running goals performance', { limit: 5 })
        memorySnippets = result.memories.map((m) => m.text)
      } catch {
        // Memory server offline — still suggest from run data
      }

      if (!cancelled) {
        setPlans(
          suggestTrainingPlans({
            runs,
            sessions: { count: sessionCount, avgIntensity },
            memorySnippets,
          }),
        )
        setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [runs, sessionCount, avgIntensity])

  return (
    <Panel
      title="Suggested training plans"
      subtitle="Matched to your mile times, session load, and memory context"
      fullWidth
    >
      {loading ? (
        <p className="py-4 text-sm text-[var(--color-text-tertiary)]">Analyzing your profile…</p>
      ) : (
        <ul className="space-y-3">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {plan.title}
                  </p>
                  <p className="mt-0.5 text-xs uppercase tracking-wide text-[var(--color-text-tertiary)]">
                    {plan.source}
                  </p>
                </div>
                <a
                  href={plan.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs font-medium text-[var(--color-accent)] hover:underline"
                >
                  Open plan →
                </a>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {plan.description}
              </p>
              <p className="mt-2 text-xs italic text-[var(--color-text-tertiary)]">
                Why this fits you: {plan.matchReason}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
