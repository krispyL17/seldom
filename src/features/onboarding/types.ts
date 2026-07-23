export type OnboardingStepType = 'text' | 'choice'

export interface OnboardingStep {
  id: string
  question: string
  type: OnboardingStepType
  field: string
  options?: string[]
  map?: Record<string, string>
  placeholder?: string
  optional?: boolean
  defaultValue?: string
}

export interface OnboardingConfig {
  id: string
  version: number
  title: string
  subtitle: string
  welcome: string
  completeMessage: string
  steps: OnboardingStep[]
}

export interface OnboardingMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: string
}

export type OnboardingAnswers = Record<string, unknown>
