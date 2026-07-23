import type { Json, TableUpdate } from '@/types/database'
import type {
  Activity,
  Award,
  ChecklistItem,
  College,
  CollegeUserData,
  CommonAppData,
  Essay,
  CollegeDeadline,
  CollegeDocument,
  Project,
  ProjectDocument,
  ResumeSettings,
  TestScores,
} from '@features/college/types'
import {
  DEFAULT_COMMON_APP,
  DEFAULT_RESUME_SETTINGS,
  DEFAULT_TEST_SCORES,
} from '@features/college/types'

type CollegeRow = Omit<
  College,
  'acceptanceRate' | 'applicationType' | 'checklist' | 'essays' | 'deadlines' | 'documents'
> & {
  acceptance_rate: number | null
  application_type: College['applicationType']
  checklist: Json
  essays: Json
  deadlines: Json
  documents: Json
}

function parseJson<T>(raw: Json, fallback: T): T {
  if (raw == null) return fallback
  return raw as unknown as T
}

function toJson<T>(value: T): Json {
  return value as unknown as Json
}

export function mapCollegeRow(row: CollegeRow & { acceptance_rate?: number | null; application_type?: College['applicationType'] }): College {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    location: row.location,
    acceptanceRate: row.acceptance_rate ?? null,
    tuition: row.tuition ?? null,
    applicationType: row.application_type ?? 'Regular Decision',
    majors: row.majors ?? [],
    status: row.status,
    checklist: parseJson<ChecklistItem[]>(row.checklist, []),
    essays: parseJson<Essay[]>(row.essays, []),
    deadlines: parseJson<CollegeDeadline[]>(row.deadlines, []),
    documents: parseJson<CollegeDocument[]>(row.documents, []),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function mapActivityRow(row: {
  id: string
  user_id: string
  name: string
  category: Activity['category']
  organization: string | null
  role: string | null
  description: string | null
  start_date: string | null
  end_date: string | null
  weekly_hours: number | null
  weeks_per_year: number | null
  leadership: string | null
  achievements: string | null
  skills: string[]
  created_at: string
  updated_at: string
}): Activity {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    category: row.category,
    organization: row.organization,
    role: row.role,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    weeklyHours: row.weekly_hours,
    weeksPerYear: row.weeks_per_year,
    leadership: row.leadership,
    achievements: row.achievements,
    skills: row.skills ?? [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function mapAwardRow(row: {
  id: string
  user_id: string
  name: string
  organization: string | null
  award_date: string | null
  level: string | null
  description: string | null
  created_at: string
  updated_at: string
}): Award {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    organization: row.organization,
    awardDate: row.award_date,
    level: row.level,
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function mapProjectRow(row: {
  id: string
  user_id: string
  name: string
  description: string | null
  technologies: string[]
  my_role: string | null
  results: string | null
  challenges: string | null
  lessons_learned: string | null
  documents: Json
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}): Project {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    description: row.description,
    technologies: row.technologies ?? [],
    myRole: row.my_role,
    results: row.results,
    challenges: row.challenges,
    lessonsLearned: row.lessons_learned,
    documents: parseJson<ProjectDocument[]>(row.documents, []),
    startDate: row.start_date,
    endDate: row.end_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function mapUserDataRow(row: {
  user_id: string
  test_scores: Json
  financial_aid: Json
  recommendations: Json
  scholarships: Json
  ai_recommendations: Json
  common_app: Json
  resume_settings: Json
  updated_at: string
}): CollegeUserData {
  return {
    user_id: row.user_id,
    testScores: parseJson<TestScores>(row.test_scores, DEFAULT_TEST_SCORES),
    financialAid: parseJson<CollegeUserData['financialAid']>(row.financial_aid, []),
    recommendations: parseJson<CollegeUserData['recommendations']>(row.recommendations, []),
    scholarships: parseJson<CollegeUserData['scholarships']>(row.scholarships, []),
    aiRecommendations: parseJson<CollegeUserData['aiRecommendations']>(row.ai_recommendations, []),
    commonApp: parseJson<CommonAppData>(row.common_app, DEFAULT_COMMON_APP),
    resumeSettings: {
      ...DEFAULT_RESUME_SETTINGS,
      ...parseJson<Partial<ResumeSettings>>(row.resume_settings, {}),
      applicationPhase:
        parseJson<Partial<ResumeSettings>>(row.resume_settings, {}).applicationPhase ?? 'junior',
      onboardingCompletedAt:
        parseJson<Partial<ResumeSettings>>(row.resume_settings, {}).onboardingCompletedAt ?? null,
      studentProfile:
        parseJson<Partial<ResumeSettings>>(row.resume_settings, {}).studentProfile ?? null,
    },
    updated_at: row.updated_at,
  }
}

export function collegeToInsert(
  userId: string,
  input: {
    name: string
    location?: string
    majors?: string[]
    applicationType?: College['applicationType']
    status?: College['status']
    acceptanceRate?: number | null
    tuition?: number | null
    checklist?: ChecklistItem[]
  },
) {
  return {
    user_id: userId,
    name: input.name.trim(),
    location: input.location?.trim() ?? '',
    majors: input.majors ?? [],
    application_type: input.applicationType ?? 'Regular Decision',
    status: input.status ?? 'researching',
    acceptance_rate: input.acceptanceRate ?? null,
    tuition: input.tuition ?? null,
    checklist: toJson(input.checklist ?? []),
  }
}

export function collegeToUpdate(input: {
  name?: string
  location?: string
  majors?: string[]
  applicationType?: College['applicationType']
  status?: College['status']
  acceptanceRate?: number | null
  tuition?: number | null
  checklist?: ChecklistItem[]
  essays?: Essay[]
  deadlines?: CollegeDeadline[]
  documents?: CollegeDocument[]
}): TableUpdate<'colleges'> {
  const payload: TableUpdate<'colleges'> = {}
  if (input.name !== undefined) payload.name = input.name.trim()
  if (input.location !== undefined) payload.location = input.location.trim()
  if (input.majors !== undefined) payload.majors = input.majors
  if (input.applicationType !== undefined) payload.application_type = input.applicationType
  if (input.status !== undefined) payload.status = input.status
  if (input.acceptanceRate !== undefined) payload.acceptance_rate = input.acceptanceRate
  if (input.tuition !== undefined) payload.tuition = input.tuition
  if (input.checklist !== undefined) payload.checklist = toJson(input.checklist)
  if (input.essays !== undefined) payload.essays = toJson(input.essays)
  if (input.deadlines !== undefined) payload.deadlines = toJson(input.deadlines)
  if (input.documents !== undefined) payload.documents = toJson(input.documents)
  return payload
}

export { toJson }
