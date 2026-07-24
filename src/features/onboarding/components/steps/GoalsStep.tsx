/**
 * Goals step of the onboarding flow.
 * Collects user's training goals for personalized analytics.
 */

import { useState } from 'react'
import { Input } from '@components/ui/Input'
import { Button } from '@components/ui/Button'
import type { OnboardingData } from '@services/userProfile'

interface GoalsStepProps {
  data: OnboardingData
  errors: Record<string, string>
  onChange: (updates: Partial<OnboardingData>) => void
}

const SUGGESTED_GOALS = [
  'Improve endurance and fitness',
  'Build strength and power',
  'Enhance technical skills',
  'Increase speed and agility',
  'Better recovery and sleep',
  'Injury prevention',
  'Competition preparation',
  'Maintain consistency'
]

export function GoalsStep({ data, errors, onChange }: GoalsStepProps) {
  const [newGoal, setNewGoal] = useState('')

  function addGoal() {
    const goal = newGoal.trim()
    if (!goal || data.goals.includes(goal)) return
    
    onChange({ goals: [...data.goals, goal] })
    setNewGoal('')
  }

  function removeGoal(goalToRemove: string) {
    onChange({ goals: data.goals.filter(goal => goal !== goalToRemove) })
  }

  function toggleSuggestedGoal(goal: string) {
    if (data.goals.includes(goal)) {
      removeGoal(goal)
    } else {
      onChange({ goals: [...data.goals, goal] })
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addGoal()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          What are your goals?
        </h3>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Select or add goals to help us provide relevant insights and tracking.
        </p>
      </div>

      <div className="space-y-4">
        {/* Suggested Goals */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Popular Goals
          </label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_GOALS.map(goal => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleSuggestedGoal(goal)}
                className={`px-3 py-2 text-sm rounded-[var(--radius-md)] border transition-colors ${
                  data.goals.includes(goal)
                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                    : 'bg-[var(--color-background-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Add Custom Goal */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Add Your Own Goal
          </label>
          <div className="flex gap-2">
            <Input
              label=""
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a custom goal"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={addGoal}
              disabled={!newGoal.trim() || data.goals.length >= 10}
              size="sm"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Selected Goals */}
        {data.goals.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Your Goals ({data.goals.length}/10)
            </label>
            <div className="space-y-2">
              {data.goals.map((goal, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--color-background-elevated)] border border-[var(--color-border)]"
                >
                  <span className="text-sm text-[var(--color-text-primary)]">{goal}</span>
                  <button
                    type="button"
                    onClick={() => removeGoal(goal)}
                    className="text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {errors.goals && (
          <p className="text-sm text-[var(--color-danger)]" role="alert">
            {errors.goals}
          </p>
        )}

        {data.goals.length === 0 && (
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Please select or add at least one goal to continue.
          </p>
        )}
      </div>
    </div>
  )
}