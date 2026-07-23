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
  const [stepIndex, setStepIndex] = useState(0)
  const [messages, setMessages] = useState<OnboardingMessage[]>(() => [
    createAssistantMessage(config.welcome),
    createAssistantMessage(config.steps[0]?.question ?? ''),
  ])
  const [input, setInput] = useState('')
  const [answers, setAnswers] = useState<OnboardingAnswers>({})
  const [rawValues, setRawValues] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const currentStep = config.steps[stepIndex] ?? null
  const progress = config.steps.length > 0 ? Math.round((stepIndex / config.steps.length) * 100) : 0

  const choiceOptions = useMemo(() => {
    if (currentStep?.type !== 'choice') return []
    return currentStep.options ?? []
  }, [currentStep])

  const submitAnswer = useCallback(
    async (raw: string) => {
      if (!currentStep || isSubmitting || isComplete) return

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
    [answers, config, currentStep, isComplete, isSubmitting, onComplete, stepIndex],
  )

  return {
    messages,
    input,
    setInput,
    currentStep,
    choiceOptions,
    progress,
    isSubmitting,
    isComplete,
    rawValues,
    submitAnswer,
  }
}
