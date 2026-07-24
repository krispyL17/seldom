import { collegeOnboarding } from '@config/onboardingPrompts'
import { OnboardingChatPanel } from '@features/onboarding/OnboardingChatPanel'
import type { OnboardingAnswers } from '@features/onboarding/types'
import { useCollege } from '../hooks/useCollege'
import type { ApplicationPhase, StudentProfile, TestScores } from '../types'
import { DEFAULT_RESUME_SETTINGS, DEFAULT_TEST_SCORES } from '../types'
import { inferApplicationPhase } from '../data/templates'

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function CollegeOnboardingGate({ onComplete }: { onComplete: () => void }) {
  const {
    userData,
    completeOnboarding,
    createActivity,
    createCollege,
  } = useCollege()

  async function handleComplete(answers: OnboardingAnswers) {
    const gradYear = str(answers['studentProfile.graduationYear'])
    const explicitPhase = answers.applicationPhase as ApplicationPhase | undefined
    const phase =
      explicitPhase === 'senior' || explicitPhase === 'junior'
        ? explicitPhase
        : inferApplicationPhase(gradYear || null)

    const studentProfile: StudentProfile = {
      name: str(answers['studentProfile.name']),
      school: str(answers['studentProfile.school']),
      graduationYear: gradYear,
      gpa: str(answers['studentProfile.gpa']) || null,
      intendedMajor: str(answers['studentProfile.intendedMajor']) || null,
    }

    const satStatus = (answers['testScores.sat.status'] as TestScores['sat']['status']) ?? 'not_taken'
    const satScoreRaw = answers['testScores.sat.score']
    const satScore =
      typeof satScoreRaw === 'number'
        ? satScoreRaw
        : typeof satScoreRaw === 'string' && satScoreRaw.trim()
          ? Number(satScoreRaw)
          : null

    const testScores: TestScores = {
      ...DEFAULT_TEST_SCORES,
      sat: {
        score: Number.isFinite(satScore as number) ? (satScore as number) : null,
        status: satStatus,
        date: satStatus === 'completed' ? new Date().toISOString().slice(0, 10) : null,
      },
    }

    await completeOnboarding({
      resumeSettings: {
        ...(userData?.resumeSettings ?? DEFAULT_RESUME_SETTINGS),
        applicationPhase: phase,
        onboardingCompletedAt: new Date().toISOString(),
        studentProfile,
      },
      testScores,
    })

    const activityName = str(answers['activity.name'])
    if (activityName) {
      await createActivity({
        name: activityName,
        category: 'Athletics',
        role: str(answers['activity.role']) || undefined,
        organization: studentProfile.school || undefined,
      })
    }

    const collegeName = str(answers['college.name'])
    if (collegeName) {
      await createCollege({
        name: collegeName,
        status: phase === 'senior' ? 'planning' : 'researching',
        majors: studentProfile.intendedMajor ? [studentProfile.intendedMajor] : [],
      })
    }
  }

  return (
    <OnboardingChatPanel
      config={collegeOnboarding}
      onComplete={handleComplete}
      onFinished={onComplete}
    />
  )
}
