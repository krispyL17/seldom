/**
 * Personal information step of the onboarding flow.
 * Collects user's name.
 */

import { Input } from '@components/ui/Input'
import type { OnboardingData } from '@services/userProfile'

interface PersonalInfoStepProps {
  data: OnboardingData
  errors: Record<string, string>
  onChange: (updates: Partial<OnboardingData>) => void
}

export function PersonalInfoStep({ data, errors, onChange }: PersonalInfoStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          Tell us about yourself
        </h3>
        <p className="text-[var(--color-text-secondary)] text-sm">
          We'll use this information to personalize your experience.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="First name"
          type="text"
          required
          value={data.first_name}
          onChange={(e) => onChange({ first_name: e.target.value })}
          placeholder="Enter your first name"
          error={errors.first_name}
        />

        <Input
          label="Last name (optional)"
          type="text"
          value={data.last_name || ''}
          onChange={(e) => onChange({ last_name: e.target.value || undefined })}
          placeholder="Enter your last name"
          error={errors.last_name}
        />
      </div>
    </div>
  )
}