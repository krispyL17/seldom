import { collegeOnboarding } from '@config/onboardingPrompts'
import { OnboardingChatPanel } from '@features/onboarding/OnboardingChatPanel'
import type { OnboardingAnswers } from '@features/onboarding/types'
import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@features/preferences'
import { suggestSchools } from '../data/schoolSuggestions'
import { useCollege } from '../hooks/useCollege'
import type { StudentProfile, TestScores } from '../types'
import { DEFAULT_RESUME_SETTINGS, DEFAULT_TEST_SCORES } from '../types'

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function displayNameFromUser(user: ReturnType<typeof useAuth>['user']): string {
  const fromMeta = user?.user_metadata?.display_name
  if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta.trim()
  const email = user?.email?.split('@')[0]
  return email?.trim() || 'Student'
}

export function CollegeOnboardingGate({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth()
  const { hobbyPassion } = useUserPreferences()
  const { userData, completeOnboarding, createCollege } = useCollege()

  async function handleComplete(answers: OnboardingAnswers) {
    const phase = userData?.resumeSettings.applicationPhase ?? 'junior'
    const schoolAreaRaw = str(answers['studentProfile.school'])
    const schoolArea =
      schoolAreaRaw.toLowerCase() === 'skip' || schoolAreaRaw.toLowerCase() === 'skipped'
        ? ''
        : schoolAreaRaw

    const studentProfile: StudentProfile = {
      name: displayNameFromUser(user),
      school: schoolArea,
      graduationYear: '',
      gpa: null,
      intendedMajor: str(answers['studentProfile.intendedMajor']) || null,
    }

    const satStatus = (answers['testScores.sat.status'] as TestScores['sat']['status']) ?? 'not_taken'
    const satScoreRaw = answers['testScores.sat.score']
    const satScore =
      satStatus === 'completed' && typeof satScoreRaw === 'number'
        ? satScoreRaw
        : satStatus === 'completed' &&
            typeof satScoreRaw === 'string' &&
            satScoreRaw.trim() &&
            satScoreRaw.toLowerCase() !== 'skip'
          ? Number(satScoreRaw)
          : null

    const testScores: TestScores = {
      ...DEFAULT_TEST_SCORES,
      sat: {
        score: Number.isFinite(satScore as number) ? (satScore as number) : null,
        status: satStatus,
        date:
          satStatus === 'completed' && Number.isFinite(satScore as number)
            ? new Date().toISOString().slice(0, 10)
            : null,
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

    const wantsSuggestions = answers['schoolList.mode'] === 'suggest'
    if (!wantsSuggestions) return

    const suggestions = suggestSchools({
      intendedMajor: studentProfile.intendedMajor ?? '',
      schoolArea: studentProfile.school,
      hobbyPassion,
      limit: 5,
    })

    for (const school of suggestions) {
      await createCollege({
        name: school.name,
        location: school.regions[0] ?? '',
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
