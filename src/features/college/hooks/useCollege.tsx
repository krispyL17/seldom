import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@hooks/useAuth'
import { collegeService } from '@services/database/colleges'
import { collegeActivityService } from '@services/database/collegeActivities'
import { collegeAwardService } from '@services/database/collegeAwards'
import { collegeProjectService } from '@services/database/collegeProjects'
import { collegeUserDataService } from '@services/database/collegeUserData'
import type {
  Activity,
  ApplicationPhase,
  Award,
  College,
  CollegeUserData,
  CommonAppData,
  CreateActivityInput,
  CreateAwardInput,
  CreateCollegeInput,
  CreateProjectInput,
  Project,
  ResumeSettings,
  StudentProfile,
  TestScores,
  UpdateActivityInput,
  UpdateAwardInput,
  UpdateCollegeInput,
  UpdateProjectInput,
} from '../types'
import {
  buildStandardAdmissionDeadlinesForCollege,
  inferGraduationYear,
} from '../data/admissionDeadlines'
import { buildTimeline, computeDashboardStats } from '../utils'
import { migrateChecklistToSenior } from '../phaseUtils'
import { buildJuniorFinancialAid, buildSeniorFinancialAid } from '../data/templates'

interface CollegeContextValue {
  colleges: College[]
  activities: Activity[]
  awards: Award[]
  projects: Project[]
  userData: CollegeUserData | null
  stats: ReturnType<typeof computeDashboardStats>
  timeline: ReturnType<typeof buildTimeline>
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  createCollege: (input: CreateCollegeInput) => Promise<College>
  updateCollege: (id: string, input: UpdateCollegeInput) => Promise<College>
  deleteCollege: (id: string) => Promise<void>
  toggleChecklistItem: (collegeId: string, key: string) => Promise<void>
  createActivity: (input: CreateActivityInput) => Promise<Activity>
  updateActivity: (id: string, input: UpdateActivityInput) => Promise<Activity>
  deleteActivity: (id: string) => Promise<void>
  createAward: (input: CreateAwardInput) => Promise<Award>
  updateAward: (id: string, input: UpdateAwardInput) => Promise<Award>
  deleteAward: (id: string) => Promise<void>
  createProject: (input: CreateProjectInput) => Promise<Project>
  updateProject: (id: string, input: UpdateProjectInput) => Promise<Project>
  deleteProject: (id: string) => Promise<void>
  updateTestScores: (scores: TestScores) => Promise<void>
  updateCommonApp: (data: CommonAppData) => Promise<void>
  updateResumeSettings: (settings: ResumeSettings) => Promise<void>
  updateFinancialAid: (items: CollegeUserData['financialAid']) => Promise<void>
  updateRecommendations: (items: CollegeUserData['recommendations']) => Promise<void>
  updateAiRecommendations: (items: CollegeUserData['aiRecommendations']) => Promise<void>
  updateScholarships: (items: CollegeUserData['scholarships']) => Promise<void>
  applicationPhase: ApplicationPhase
  isSeniorMode: boolean
  enterSeniorMode: () => Promise<void>
  enterJuniorMode: () => Promise<void>
  onboardingComplete: boolean
  studentProfile: StudentProfile | null
  completeOnboarding: (payload: {
    resumeSettings: ResumeSettings
    testScores: TestScores
  }) => Promise<void>
}

const CollegeContext = createContext<CollegeContextValue | null>(null)

export function CollegeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [colleges, setColleges] = useState<College[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [awards, setAwards] = useState<Award[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [userData, setUserData] = useState<CollegeUserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!user) {
      setColleges([])
      setActivities([])
      setAwards([])
      setProjects([])
      setUserData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [c, a, aw, p, ud] = await Promise.all([
        collegeService.fetchAll(),
        collegeActivityService.fetchAll(),
        collegeAwardService.fetchAll(),
        collegeProjectService.fetchAll(),
        collegeUserDataService.ensure(user.id),
      ])

      const phase = ud?.resumeSettings.applicationPhase ?? 'junior'
      const gradYear = inferGraduationYear(phase)
      const collegesWithTimelines = await Promise.all(
        c.map(async (college) => {
          if (college.deadlines.length > 0) return college
          return collegeService.update(college.id, {
            deadlines: buildStandardAdmissionDeadlinesForCollege(gradYear),
          })
        }),
      )

      setColleges(collegesWithTimelines)
      setActivities(a)
      setAwards(aw)
      setProjects(p)
      setUserData(ud)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load college data')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    function handleCollegeDataChanged() {
      void reload()
    }
    window.addEventListener('seldom:college-data-changed', handleCollegeDataChanged)
    return () => window.removeEventListener('seldom:college-data-changed', handleCollegeDataChanged)
  }, [reload])

  const stats = useMemo(
    () =>
      computeDashboardStats(
        colleges,
        userData?.recommendations ?? [],
        userData?.scholarships ?? [],
      ),
    [colleges, userData],
  )

  const timeline = useMemo(
    () =>
      userData
        ? buildTimeline(activities, awards, projects, colleges, userData)
        : [],
    [activities, awards, projects, colleges, userData],
  )

  const createCollege = useCallback(
    async (input: CreateCollegeInput) => {
      if (!user) throw new Error('Not authenticated')
      const phase = userData?.resumeSettings.applicationPhase ?? 'junior'
      const gradYear = inferGraduationYear(phase)
      const deadlines = input.deadlines ?? buildStandardAdmissionDeadlinesForCollege(gradYear)
      const created = await collegeService.create(user.id, { ...input, deadlines })
      setColleges((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      return created
    },
    [user, userData],
  )

  const updateCollege = useCallback(async (id: string, input: UpdateCollegeInput) => {
    const updated = await collegeService.update(id, input)
    setColleges((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }, [])

  const deleteCollege = useCallback(async (id: string) => {
    await collegeService.delete(id)
    setColleges((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const toggleChecklistItem = useCallback(async (collegeId: string, key: string) => {
    const college = colleges.find((c) => c.id === collegeId)
    if (!college) return
    const checklist = college.checklist.map((item) =>
      item.key === key ? { ...item, completed: !item.completed } : item,
    )
    await updateCollege(collegeId, { checklist })
  }, [colleges, updateCollege])

  const createActivity = useCallback(
    async (input: CreateActivityInput) => {
      if (!user) throw new Error('Not authenticated')
      const created = await collegeActivityService.create(user.id, input)
      setActivities((prev) => [created, ...prev])
      return created
    },
    [user],
  )

  const updateActivity = useCallback(async (id: string, input: UpdateActivityInput) => {
    const updated = await collegeActivityService.update(id, input)
    setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)))
    return updated
  }, [])

  const deleteActivity = useCallback(async (id: string) => {
    await collegeActivityService.delete(id)
    setActivities((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const createAward = useCallback(
    async (input: CreateAwardInput) => {
      if (!user) throw new Error('Not authenticated')
      const created = await collegeAwardService.create(user.id, input)
      setAwards((prev) => [created, ...prev])
      return created
    },
    [user],
  )

  const updateAward = useCallback(async (id: string, input: UpdateAwardInput) => {
    const updated = await collegeAwardService.update(id, input)
    setAwards((prev) => prev.map((a) => (a.id === id ? updated : a)))
    return updated
  }, [])

  const deleteAward = useCallback(async (id: string) => {
    await collegeAwardService.delete(id)
    setAwards((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const createProject = useCallback(
    async (input: CreateProjectInput) => {
      if (!user) throw new Error('Not authenticated')
      const created = await collegeProjectService.create(user.id, input)
      setProjects((prev) => [created, ...prev])
      return created
    },
    [user],
  )

  const updateProject = useCallback(async (id: string, input: UpdateProjectInput) => {
    const updated = await collegeProjectService.update(id, input)
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)))
    return updated
  }, [])

  const deleteProject = useCallback(async (id: string) => {
    await collegeProjectService.delete(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const updateTestScores = useCallback(
    async (scores: TestScores) => {
      if (!user) throw new Error('Not authenticated')
      const updated = await collegeUserDataService.updateTestScores(user.id, scores)
      setUserData(updated)
    },
    [user],
  )

  const updateCommonApp = useCallback(
    async (data: CommonAppData) => {
      if (!user) throw new Error('Not authenticated')
      const updated = await collegeUserDataService.updateCommonApp(user.id, data)
      setUserData(updated)
    },
    [user],
  )

  const updateResumeSettings = useCallback(
    async (settings: ResumeSettings) => {
      if (!user) throw new Error('Not authenticated')
      const updated = await collegeUserDataService.updateResumeSettings(user.id, settings)
      setUserData(updated)
    },
    [user],
  )

  const updateFinancialAid = useCallback(
    async (items: CollegeUserData['financialAid']) => {
      if (!user) throw new Error('Not authenticated')
      const updated = await collegeUserDataService.updateFinancialAid(user.id, items)
      setUserData(updated)
    },
    [user],
  )

  const updateRecommendations = useCallback(
    async (items: CollegeUserData['recommendations']) => {
      if (!user) throw new Error('Not authenticated')
      const updated = await collegeUserDataService.updateRecommendations(user.id, items)
      setUserData(updated)
    },
    [user],
  )

  const updateAiRecommendations = useCallback(
    async (items: CollegeUserData['aiRecommendations']) => {
      if (!user) throw new Error('Not authenticated')
      const updated = await collegeUserDataService.updateAiRecommendations(user.id, items)
      setUserData(updated)
    },
    [user],
  )

  const updateScholarships = useCallback(
    async (items: CollegeUserData['scholarships']) => {
      if (!user) throw new Error('Not authenticated')
      const updated = await collegeUserDataService.updateScholarships(user.id, items)
      setUserData(updated)
    },
    [user],
  )

  const applicationPhase: ApplicationPhase =
    userData?.resumeSettings.applicationPhase ?? 'junior'
  const isSeniorMode = applicationPhase === 'senior'

  const enterSeniorMode = useCallback(async () => {
    if (!user || !userData) throw new Error('Not authenticated')
    const confirmed = confirm(
      "Switch to senior application mode?\n\nYou'll unlock full application checklists, submission tracking, supplemental essays, and FAFSA deadlines. Your junior prep progress is kept.",
    )
    if (!confirmed) return

    for (const college of colleges) {
      await collegeService.update(college.id, {
        checklist: migrateChecklistToSenior(college.checklist),
      })
    }
    const refreshed = await collegeService.fetchAll()
    setColleges(refreshed)

    await updateResumeSettings({
      ...userData.resumeSettings,
      applicationPhase: 'senior',
      seniorModeStartedAt: new Date().toISOString(),
    })
    await updateFinancialAid(buildSeniorFinancialAid(userData.resumeSettings.studentProfile?.graduationYear))
  }, [user, userData, colleges, updateResumeSettings, updateFinancialAid])

  const enterJuniorMode = useCallback(async () => {
    if (!user || !userData) return
    await updateResumeSettings({
      ...userData.resumeSettings,
      applicationPhase: 'junior',
    })
  }, [user, userData, updateResumeSettings])

  const onboardingComplete = Boolean(userData?.resumeSettings.onboardingCompletedAt)
  const studentProfile = userData?.resumeSettings.studentProfile ?? null

  const completeOnboarding = useCallback(
    async (payload: { resumeSettings: ResumeSettings; testScores: TestScores }) => {
      if (!user) throw new Error('Not authenticated')
      let updated = await collegeUserDataService.completeOnboarding(user.id, payload)
      if (updated.financialAid.length === 0) {
        const gradYear = payload.resumeSettings.studentProfile?.graduationYear
        const phase = payload.resumeSettings.applicationPhase ?? 'junior'
        const items =
          phase === 'senior'
            ? buildSeniorFinancialAid(gradYear)
            : buildJuniorFinancialAid(gradYear)
        updated = await collegeUserDataService.updateFinancialAid(user.id, items)
      }
      setUserData(updated)
    },
    [user],
  )

  const value: CollegeContextValue = {
    colleges,
    activities,
    awards,
    projects,
    userData,
    stats,
    timeline,
    loading,
    error,
    reload,
    createCollege,
    updateCollege,
    deleteCollege,
    toggleChecklistItem,
    createActivity,
    updateActivity,
    deleteActivity,
    createAward,
    updateAward,
    deleteAward,
    createProject,
    updateProject,
    deleteProject,
    updateTestScores,
    updateCommonApp,
    updateResumeSettings,
    updateFinancialAid,
    updateRecommendations,
    updateAiRecommendations,
    updateScholarships,
    applicationPhase,
    isSeniorMode,
    enterSeniorMode,
    enterJuniorMode,
    onboardingComplete,
    studentProfile,
    completeOnboarding,
  }

  return <CollegeContext.Provider value={value}>{children}</CollegeContext.Provider>
}

export function useCollege() {
  const ctx = useContext(CollegeContext)
  if (!ctx) throw new Error('useCollege must be used within CollegeProvider')
  return ctx
}
