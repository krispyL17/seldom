/**
 * Final step of the onboarding flow.
 * Shows a summary of collected data before completing setup.
 */

import type { OnboardingData } from '@services/userProfile'

interface FinishStepProps {
  data: OnboardingData
  errors: Record<string, string>
}

export function FinishStep({ data, errors }: FinishStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          Ready to get started!
        </h3>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Review your information below. You can always update these settings later.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-background-elevated)] border border-[var(--color-border)]">
          <h4 className="font-medium text-[var(--color-text-primary)] mb-3">Profile Summary</h4>
          
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-tertiary)]">Name</dt>
              <dd className="text-[var(--color-text-primary)]">
                {data.first_name} {data.last_name || ''}
              </dd>
            </div>
            
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-tertiary)]">Sport</dt>
              <dd className="text-[var(--color-text-primary)]">{data.sport}</dd>
            </div>
            
            {data.position && (
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-tertiary)]">Position</dt>
                <dd className="text-[var(--color-text-primary)]">{data.position}</dd>
              </div>
            )}
            
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-tertiary)]">Experience</dt>
              <dd className="text-[var(--color-text-primary)] capitalize">{data.experience_level}</dd>
            </div>
            
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-tertiary)]">Training Target</dt>
              <dd className="text-[var(--color-text-primary)]">{data.target_training_days_per_week} days/week</dd>
            </div>
            
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-tertiary)]">Sleep Target</dt>
              <dd className="text-[var(--color-text-primary)]">{data.target_sleep_hours} hours/night</dd>
            </div>
          </dl>
        </div>

        {data.goals.length > 0 && (
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-background-elevated)] border border-[var(--color-border)]">
            <h4 className="font-medium text-[var(--color-text-primary)] mb-3">Your Goals</h4>
            <ul className="space-y-1 text-sm">
              {data.goals.map((goal, index) => (
                <li key={index} className="text-[var(--color-text-secondary)]">
                  • {goal}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
          <p className="text-sm text-[var(--color-text-primary)]">
            🎉 <strong>You're all set!</strong> Click "Complete Setup" to start tracking your performance and achieving your goals.
          </p>
        </div>

        {errors.general && (
          <p className="text-sm text-[var(--color-danger)]" role="alert">
            {errors.general}
          </p>
        )}
      </div>
    </div>
  )
}