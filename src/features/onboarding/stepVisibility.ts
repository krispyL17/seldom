import type { OnboardingAnswers, OnboardingStep } from './types'

function matchesValue(actual: unknown, expected: string | string[]): boolean {
  const values = Array.isArray(expected) ? expected : [expected]
  return values.includes(String(actual ?? ''))
}

export function stepIsVisible(step: OnboardingStep, answers: OnboardingAnswers): boolean {
  if (!step.showWhen) return true
  const actual = answers[step.showWhen.field]
  if (step.showWhen.equals !== undefined) {
    return matchesValue(actual, step.showWhen.equals)
  }
  if (step.showWhen.notEquals !== undefined) {
    return !matchesValue(actual, step.showWhen.notEquals)
  }
  return true
}

export function findNextVisibleStepIndex(
  fromIndex: number,
  steps: OnboardingStep[],
  answers: OnboardingAnswers,
): number {
  for (let i = fromIndex; i < steps.length; i += 1) {
    if (stepIsVisible(steps[i]!, answers)) return i
  }
  return steps.length
}

export function countVisibleSteps(steps: OnboardingStep[], answers: OnboardingAnswers): number {
  return steps.filter((step) => stepIsVisible(step, answers)).length
}
