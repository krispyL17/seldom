/**
 * Multi-step onboarding flow for new users.
 * Collects essential profile data needed for Performance Analytics.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { UserProfileService, type OnboardingData } from '@services/userProfile'
import { Button } from '@components/ui/Button'
import { Card, CardHeader } from '@components/ui/Card'
import { PersonalInfoStep } from './steps/PersonalInfoStep'
import { SportSetupStep } from './steps/SportSetupStep'
import { GoalsStep } from './steps/GoalsStep'
import { TargetsStep } from './steps/TargetsStep'
import { FinishStep } from './steps/FinishStep'

type OnboardingStep = 'personal' | 'sport' | 'goals' | 'targets' | 'finish'

export function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('personal')
  const [formData, setFormData] = useState<OnboardingData>({
    first_name: '',
    last_name: '',
    sport: '',
    position: '',
    experience_level: 'beginner',
    goals: [],
    target_training_days_per_week: 3,
    target_sleep_hours: 8,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const steps: OnboardingStep[] = ['personal', 'sport', 'goals', 'targets', 'finish']
  const currentStepIndex = steps.indexOf(currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  function updateFormData(updates: Partial<OnboardingData>) {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates)
    setErrors(prev => {
      const newErrors = { ...prev }
      updatedFields.forEach(field => delete newErrors[field])
      return newErrors
    })
  }

  function goToNextStep() {
    if (isLastStep) return
    const nextStep = steps[currentStepIndex + 1]
    setCurrentStep(nextStep)
  }

  function goToPreviousStep() {
    if (isFirstStep) return
    const prevStep = steps[currentStepIndex - 1]
    setCurrentStep(prevStep)
  }

  function validateCurrentStep(): boolean {
    const validation = UserProfileService.validateOnboardingData(formData)
    
    // Only show errors relevant to current step
    const stepFields = getStepFields(currentStep)
    const stepErrors = Object.keys(validation.errors)
      .filter(key => stepFields.includes(key))
      .reduce((acc, key) => ({ ...acc, [key]: validation.errors[key] }), {})
    
    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  function getStepFields(step: OnboardingStep): string[] {
    switch (step) {
      case 'personal':
        return ['first_name', 'last_name']
      case 'sport':
        return ['sport', 'position', 'experience_level']
      case 'goals':
        return ['goals']
      case 'targets':
        return ['target_training_days_per_week', 'target_sleep_hours', 'timezone']
      default:
        return []
    }
  }

  async function handleNext() {
    if (currentStep === 'finish') {
      await handleFinish()
      return
    }

    if (validateCurrentStep()) {
      goToNextStep()
    }
  }

  async function handleFinish() {
    if (!user?.id) return

    const validation = UserProfileService.validateOnboardingData(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setSaving(true)
    try {
      await UserProfileService.saveUserProfile(user.id, formData)
      navigate('/', { replace: true })
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Failed to save profile' })
    } finally {
      setSaving(false)
    }
  }

  function renderStep() {
    switch (currentStep) {
      case 'personal':
        return (
          <PersonalInfoStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        )
      case 'sport':
        return (
          <SportSetupStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        )
      case 'goals':
        return (
          <GoalsStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        )
      case 'targets':
        return (
          <TargetsStep
            data={formData}
            errors={errors}
            onChange={updateFormData}
          />
        )
      case 'finish':
        return (
          <FinishStep
            data={formData}
            errors={errors}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`h-2 w-12 rounded-full transition-colors ${
                  index <= currentStepIndex
                    ? 'bg-[var(--color-accent)]'
                    : 'bg-[var(--color-border)]'
                }`}
              />
            ))}
          </div>
          <p className="text-center mt-2 text-sm text-[var(--color-text-secondary)]">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
        </div>

        <Card>
          <CardHeader
            title="Welcome to Seldom"
            description="Let's set up your profile for personalized performance analytics"
          />
          
          <div className="space-y-6">
            {renderStep()}

            {errors.general && (
              <p className="text-sm text-[var(--color-danger)]" role="alert">
                {errors.general}
              </p>
            )}

            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={goToPreviousStep}
                disabled={isFirstStep}
              >
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={saving}
              >
                {saving ? 'Saving...' : isLastStep ? 'Complete Setup' : 'Next'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}