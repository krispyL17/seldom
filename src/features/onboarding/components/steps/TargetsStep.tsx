/**
 * Targets step of the onboarding flow.
 * Collects user's training and sleep targets for performance tracking.
 */

import type { OnboardingData } from '@services/userProfile'

interface TargetsStepProps {
  data: OnboardingData
  errors: Record<string, string>
  onChange: (updates: Partial<OnboardingData>) => void
}

export function TargetsStep({ data, errors, onChange }: TargetsStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          Set your targets
        </h3>
        <p className="text-[var(--color-text-secondary)] text-sm">
          These targets help us track your progress and provide personalized insights.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Training days per week *
          </label>
          <select
            value={data.target_training_days_per_week}
            onChange={(e) => onChange({ target_training_days_per_week: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background-elevated)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value={1}>1 day per week</option>
            <option value={2}>2 days per week</option>
            <option value={3}>3 days per week</option>
            <option value={4}>4 days per week</option>
            <option value={5}>5 days per week</option>
            <option value={6}>6 days per week</option>
            <option value={7}>7 days per week</option>
          </select>
          {errors.target_training_days_per_week && (
            <p className="text-sm text-[var(--color-danger)] mt-1" role="alert">
              {errors.target_training_days_per_week}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Target sleep hours per night *
          </label>
          <select
            value={data.target_sleep_hours}
            onChange={(e) => onChange({ target_sleep_hours: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background-elevated)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value={4}>4 hours</option>
            <option value={5}>5 hours</option>
            <option value={6}>6 hours</option>
            <option value={7}>7 hours</option>
            <option value={8}>8 hours</option>
            <option value={9}>9 hours</option>
            <option value={10}>10 hours</option>
            <option value={11}>11 hours</option>
            <option value={12}>12 hours</option>
          </select>
          {errors.target_sleep_hours && (
            <p className="text-sm text-[var(--color-danger)] mt-1" role="alert">
              {errors.target_sleep_hours}
            </p>
          )}
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            Most athletes benefit from 7-9 hours of sleep per night
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            Timezone *
          </label>
          <select
            value={data.timezone}
            onChange={(e) => onChange({ timezone: e.target.value })}
            className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background-elevated)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/Anchorage">Alaska Time (AT)</option>
            <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Central European Time</option>
            <option value="Asia/Tokyo">Japan Time</option>
            <option value="Australia/Sydney">Australia Eastern Time</option>
            <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
              Auto-detected ({Intl.DateTimeFormat().resolvedOptions().timeZone})
            </option>
          </select>
          {errors.timezone && (
            <p className="text-sm text-[var(--color-danger)] mt-1" role="alert">
              {errors.timezone}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}