/**
 * Sport setup step of the onboarding flow.
 * Collects user's sport, position, and experience level.
 */

import { Input } from '@components/ui/Input'
import type { OnboardingData } from '@services/userProfile'

interface SportSetupStepProps {
  data: OnboardingData
  errors: Record<string, string>
  onChange: (updates: Partial<OnboardingData>) => void
}

const POPULAR_SPORTS = [
  'Soccer',
  'Basketball',
  'Tennis',
  'Swimming',
  'Running',
  'Cycling',
  'Football',
  'Baseball',
  'Volleyball',
  'Track & Field'
]

export function SportSetupStep({ data, errors, onChange }: SportSetupStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          What's your sport?
        </h3>
        <p className="text-[var(--color-text-secondary)] text-sm">
          This helps us provide relevant analytics and insights.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Sport *
          </label>
          <div className="space-y-2">
            <Input
              label=""
              type="text"
              value={data.sport}
              onChange={(e) => onChange({ sport: e.target.value })}
              placeholder="Enter your sport"
              error={errors.sport}
            />
            <div className="flex flex-wrap gap-2">
              {POPULAR_SPORTS.map(sport => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => onChange({ sport })}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    data.sport === sport
                      ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                      : 'bg-[var(--color-background-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Input
          label="Position (optional)"
          type="text"
          value={data.position || ''}
          onChange={(e) => onChange({ position: e.target.value || undefined })}
          placeholder="e.g., Midfielder, Point Guard, etc."
          error={errors.position}
        />

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Experience Level *
          </label>
          <select
            value={data.experience_level}
            onChange={(e) => onChange({ experience_level: e.target.value as OnboardingData['experience_level'] })}
            className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background-elevated)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="beginner">Beginner - Just starting out</option>
            <option value="intermediate">Intermediate - Some experience</option>
            <option value="advanced">Advanced - Experienced athlete</option>
            <option value="professional">Professional - Competing at high level</option>
          </select>
        </div>
      </div>
    </div>
  )
}