import { useCallback, useMemo, useState } from 'react'
import type { OnboardingAnswers, OnboardingConfig, OnboardingMessage } from '@features/onboarding/types'
import { parseStepValue } from '@features/onboarding/utils'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function createAssistantMessage(content: string): OnboardingMessage {
  return {
    id: generateId(),
    role: 'assistant',
    content,
    timestamp: new Date().toISOString(),
  }
}

function createUserMessage(content: string): OnboardingMessage {
  return {
    id: generateId(),
    role: 'user',
    content,
    timestamp: new Date().toISOString(),
  }
}

interface UseOnboardingChatOptions {
  config: OnboardingConfig
  onComplete: (answers: OnboardingAnswers) => Promise<void>
}

export function useOnboardingChat({ config, onComplete }: UseOnboardingChatOptions) {
  const hasQuestionSteps = config.steps.length > 0
  const [stepIndex, setStepIndex] = useState(0)
  const [welcomeAcknowledged, setWelcomeAcknowledged] = useState(!hasQuestionSteps)
  const [messages, setMessages] = useState<OnboardingMessage[]>(() => [
    createAssistantMessage(config.welcome),
  ])
  const [input, setInput] = useState('')
  const [answers, setAnswers] = useState<OnboardingAnswers>({})
  const [rawValues, setRawValues] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const currentStep = config.steps[stepIndex] ?? null

  const totalPhases = hasQuestionSteps ? config.steps.length + 1 : 0

  const progress = useMemo(() => {
    if (!hasQuestionSteps) return isComplete ? 100 : 0
    if (isComplete) return 100
    if (!welcomeAcknowledged) return 0
    const completedPhases = 1 + stepIndex
    return Math.round((completedPhases / totalPhases) * 100)
  }, [hasQuestionSteps, isComplete, welcomeAcknowledged, stepIndex, totalPhases])

  const progressCaption = useMemo(() => {
    if (!hasQuestionSteps) return isComplete ? 'Done' : null
    if (isComplete) return 'Complete'
    if (!welcomeAcknowledged) return `Step 1 of ${totalPhases}`
    const current = 1 + stepIndex
    return `Step ${current} of ${totalPhases}`
  }, [hasQuestionSteps, isComplete, welcomeAcknowledged, stepIndex, totalPhases])

  const choiceOptions = useMemo(() => {
    if (currentStep?.type !== 'choice') return []
    return currentStep.options ?? []
  }, [currentStep])

  const continueFromWelcome = useCallback(() => {
    if (welcomeAcknowledged || !hasQuestionSteps) return
    setWelcomeAcknowledged(true)
    const firstQuestion = config.steps[0]?.question
    if (firstQuestion) {
      setMessages((prev) => [...prev, createAssistantMessage(firstQuestion)])
    }
  }, [config.steps, hasQuestionSteps, welcomeAcknowledged])

  const submitAnswer = useCallback(
    async (raw: string) => {
      if (!currentStep || isSubmitting || isComplete || !welcomeAcknowledged) return

      const parsed = parseStepValue(raw, {
        optional: currentStep.optional,
        type: currentStep.type,
        map: currentStep.map,
        defaultValue: currentStep.defaultValue,
        field: currentStep.field,
      })
      if (parsed === null && !currentStep.optional) return

      const displayValue = raw.trim() || (currentStep.optional ? 'Skipped' : '')
      if (!displayValue && !currentStep.optional) return

      setMessages((prev) => [...prev, createUserMessage(displayValue || 'Skipped')])
      setInput('')

      const nextAnswers = { ...answers }
      if (parsed !== null) {
        nextAnswers[currentStep.field] = parsed
        setRawValues((prev) => ({ ...prev, [currentStep.field]: String(parsed) }))
      }
      setAnswers(nextAnswers)

      const nextIndex = stepIndex + 1
      if (nextIndex >= config.steps.length) {
        setIsSubmitting(true)
        try {
          await onComplete(nextAnswers)
          setIsComplete(true)
          setMessages((prev) => [...prev, createAssistantMessage(config.completeMessage)])
        } finally {
          setIsSubmitting(false)
        }
        return
      }

      setStepIndex(nextIndex)
      const nextQuestion = config.steps[nextIndex]?.question
      if (nextQuestion) {
        setMessages((prev) => [...prev, createAssistantMessage(nextQuestion)])
      }
    },
    [answers, config, currentStep, isComplete, isSubmitting, onComplete, stepIndex, welcomeAcknowledged],
  )

  const acknowledgeWelcome = useCallback(async () => {
    if (hasQuestionSteps || isSubmitting || isComplete) return
    setIsSubmitting(true)
    try {
      await onComplete({})
      setIsComplete(true)
      setMessages((prev) => [...prev, createAssistantMessage(config.completeMessage)])
    } finally {
      setIsSubmitting(false)
    }
  }, [config, hasQuestionSteps, isComplete, isSubmitting, onComplete])

  return {
    messages,
    input,
    setInput,
    currentStep,
    choiceOptions,
    progress,
    progressCaption,
    isSubmitting,
    isComplete,
    rawValues,
    submitAnswer,
    hasQuestionSteps,
    welcomeAcknowledged,
    continueFromWelcome,
    acknowledgeWelcome,
  }
}
