import type { TabIntrosCompleted } from '@/types/userPreferences'
import { getTabIntroSeenVersion } from './onboardingVersion'

export const SETUP_CHECKLIST_TAB_KEY = 'setup-checklist'

export interface SetupStep {
  id: string
  label: string
  hint: string
  done: boolean
  optional?: boolean
  href?: string
  action?: 'welcome' | 'tab-intro'
  tabIntroId?: string
}

export interface SetupProgressInput {
  tabIntros: TabIntrosCompleted
  welcomeComplete: boolean
  taskCount: number
  performanceOnboardingComplete: boolean
  collegeEnabled: boolean
  collegeOnboardingComplete: boolean
}

export function isSetupChecklistDismissed(tabIntros: TabIntrosCompleted): boolean {
  return getTabIntroSeenVersion(tabIntros, SETUP_CHECKLIST_TAB_KEY) >= 1
}

export function buildSetupSteps(input: SetupProgressInput): SetupStep[] {
  const steps: SetupStep[] = [
    {
      id: 'welcome',
      label: 'Personalize Seldom',
      hint: 'Name, sport, and school year',
      done: input.welcomeComplete,
      action: 'welcome',
    },
    {
      id: 'first-task',
      label: 'Add a task',
      hint: 'Capture something due this week',
      done: input.taskCount > 0,
      href: '/tasks?new=1',
      action: 'tab-intro',
      tabIntroId: 'tasks',
    },
    {
      id: 'performance',
      label: 'Set up Performance',
      hint: 'Quick profile so logging is ready',
      done: input.performanceOnboardingComplete,
      href: '/soccer/overview',
      action: 'tab-intro',
      tabIntroId: 'performance',
    },
  ]

  if (input.collegeEnabled) {
    steps.push({
      id: 'college',
      label: 'Junior Prep profile',
      hint: 'School area and test plans',
      done: input.collegeOnboardingComplete,
      optional: true,
      href: '/college',
      action: 'tab-intro',
      tabIntroId: 'college',
    })
  }

  return steps
}

export function isSetupComplete(steps: SetupStep[]): boolean {
  return steps.filter((step) => !step.optional).every((step) => step.done)
}

export function setupProgressPercent(steps: SetupStep[]): number {
  if (steps.length === 0) return 100
  const done = steps.filter((step) => step.done).length
  return Math.round((done / steps.length) * 100)
}
