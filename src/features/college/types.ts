/** College application lifecycle status */
export type ApplicationStatus =
  | 'researching'
  | 'planning'
  | 'applying'
  | 'submitted'
  | 'waiting'
  | 'accepted'
  | 'rejected'
  | 'committed'

export type ApplicationType =
  | 'Early Decision'
  | 'Early Action'
  | 'Regular Decision'
  | 'Rolling'

export type EssayDraftStatus =
  | 'not_started'
  | 'outline'
  | 'draft'
  | 'revision'
  | 'final'

export type ScholarshipStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'awarded'
  | 'rejected'

export type DocumentType =
  | 'pdf'
  | 'transcript'
  | 'resume'
  | 'activity_list'
  | 'research_notes'

export type TestStatus = 'not_taken' | 'scheduled' | 'completed' | 'sent'

export type DeadlineType =
  | 'application'
  | 'essay'
  | 'financial_aid'
  | 'scholarship'
  | 'test'
  | 'recommendation'
  | 'interview'
  | 'other'

export type ChecklistKey =
  | 'application_submitted'
  | 'personal_essay'
  | 'supplemental_essays'
  | 'transcript'
  | 'test_scores'
  | 'recommendations'
  | 'interview'
  | 'financial_aid'
  | 'scholarships'

export type ActivityCategory =
  | 'Athletics'
  | 'Academic'
  | 'Leadership'
  | 'Research'
  | 'Volunteer'
  | 'Employment'
  | 'Personal Project'

export type ResumeTemplate = 'classic' | 'modern' | 'compact'

/** Rising junior prep vs senior application season */
export type ApplicationPhase = 'junior' | 'senior'

export interface ChecklistItem {
  key: ChecklistKey
  label: string
  completed: boolean
}

export interface EssayVersion {
  id: string
  label: string
  date: string
}

export interface Essay {
  id: string
  prompt: string
  wordCount: number
  maxWords: number
  status: EssayDraftStatus
  versions: EssayVersion[]
}

export interface CollegeDeadline {
  id: string
  label: string
  date: string
  type: DeadlineType
}

export interface CollegeDocument {
  id: string
  name: string
  type: DocumentType
  uploadedAt: string
  size: string
}

export interface College {
  id: string
  user_id: string
  name: string
  location: string
  acceptanceRate: number | null
  tuition: number | null
  applicationType: ApplicationType
  majors: string[]
  status: ApplicationStatus
  checklist: ChecklistItem[]
  essays: Essay[]
  deadlines: CollegeDeadline[]
  documents: CollegeDocument[]
  created_at: string
  updated_at: string
}

export interface Scholarship {
  id: string
  name: string
  deadline: string
  amount: number
  status: ScholarshipStatus
  requirements: string[]
  collegeId?: string
}

export interface TestScoreEntry {
  score: number | null
  status: TestStatus
  date: string | null
}

export interface TestScores {
  sat: TestScoreEntry
  act: TestScoreEntry
}

export interface AiRecommendation {
  id: string
  type: 'school' | 'essay' | 'deadline' | 'plan'
  title: string
  description: string
}

export interface FinancialAidItem {
  id: string
  label: string
  completed: boolean
  dueDate: string | null
}

export interface RecommendationLetter {
  id: string
  recommender: string
  role: 'teacher' | 'counselor' | 'coach' | 'other'
  collegeIds: string[]
  status: 'not_requested' | 'requested' | 'submitted'
  dueDate: string | null
}

export interface AdvisorMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Activity {
  id: string
  user_id: string
  name: string
  category: ActivityCategory
  organization: string | null
  role: string | null
  description: string | null
  startDate: string | null
  endDate: string | null
  weeklyHours: number | null
  weeksPerYear: number | null
  leadership: string | null
  achievements: string | null
  skills: string[]
  created_at: string
  updated_at: string
}

export interface Award {
  id: string
  user_id: string
  name: string
  organization: string | null
  awardDate: string | null
  level: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface ProjectDocument {
  id: string
  name: string
  url?: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  technologies: string[]
  myRole: string | null
  results: string | null
  challenges: string | null
  lessonsLearned: string | null
  documents: ProjectDocument[]
  startDate: string | null
  endDate: string | null
  created_at: string
  updated_at: string
}

export interface ActivityDescription {
  id: string
  activityId: string
  commonAppText: string
  characterCount: number
  updatedAt: string
}

export interface EssayIdea {
  id: string
  title: string
  prompt: string
  notes: string
  linkedActivityIds: string[]
}

export interface PersonalStatementDraft {
  id: string
  title: string
  content: string
  wordCount: number
  status: EssayDraftStatus
  updatedAt: string
}

export interface SupplementalEntry {
  id: string
  collegeId: string
  collegeName: string
  prompt: string
  status: EssayDraftStatus
  wordCount: number
  maxWords: number
  notes: string
}

export interface ReflectionNote {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
}

export interface CommonAppData {
  activityDescriptions: ActivityDescription[]
  essayIdeas: EssayIdea[]
  personalStatementDrafts: PersonalStatementDraft[]
  supplementalTracking: SupplementalEntry[]
  reflectionNotes: ReflectionNote[]
}

export interface ResumeSettings {
  template: ResumeTemplate
  selectedActivityIds: string[]
  selectedAwardIds: string[]
  selectedProjectIds: string[]
  applicationPhase: ApplicationPhase
  seniorModeStartedAt: string | null
}

export interface CollegeUserData {
  user_id: string
  testScores: TestScores
  financialAid: FinancialAidItem[]
  recommendations: RecommendationLetter[]
  scholarships: Scholarship[]
  aiRecommendations: AiRecommendation[]
  commonApp: CommonAppData
  resumeSettings: ResumeSettings
  updated_at: string
}

export interface CollegeDashboardStats {
  overallProgress: number
  collegeCount: number
  essaysInProgress: number
  recommendationsComplete: number
  recommendationsTotal: number
  applicationsCompleted: number
  averageAcceptanceRate: number
  upcomingDeadlineCount: number
}

export interface TimelineEntry {
  id: string
  date: string
  title: string
  subtitle: string
  category: 'activity' | 'award' | 'project' | 'deadline' | 'essay' | 'milestone'
  entityId: string
}

export interface CreateCollegeInput {
  name: string
  location?: string
  majors?: string[]
  applicationType?: ApplicationType
  status?: ApplicationStatus
  acceptanceRate?: number | null
  tuition?: number | null
}

export interface UpdateCollegeInput {
  name?: string
  location?: string
  majors?: string[]
  applicationType?: ApplicationType
  status?: ApplicationStatus
  acceptanceRate?: number | null
  tuition?: number | null
  checklist?: ChecklistItem[]
  essays?: Essay[]
  deadlines?: CollegeDeadline[]
  documents?: CollegeDocument[]
}

export interface CreateActivityInput {
  name: string
  category: ActivityCategory
  organization?: string
  role?: string
  description?: string
  startDate?: string | null
  endDate?: string | null
  weeklyHours?: number | null
  weeksPerYear?: number | null
  leadership?: string
  achievements?: string
  skills?: string[]
}

export interface UpdateActivityInput extends Partial<CreateActivityInput> {}

export interface CreateAwardInput {
  name: string
  organization?: string
  awardDate?: string | null
  level?: string
  description?: string
}

export interface UpdateAwardInput extends Partial<CreateAwardInput> {}

export interface CreateProjectInput {
  name: string
  description?: string
  technologies?: string[]
  myRole?: string
  results?: string
  challenges?: string
  lessonsLearned?: string
  documents?: ProjectDocument[]
  startDate?: string | null
  endDate?: string | null
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}

export const COLLEGE_NAV_JUNIOR = [
  { id: 'dashboard', label: 'Prep Dashboard', href: '/college' },
  { id: 'activities', label: 'Activities & Resume', href: '/college/activities' },
  { id: 'common-app', label: 'Essay Prep', href: '/college/common-app' },
  { id: 'timeline', label: 'Timeline', href: '/college/timeline' },
] as const

export const COLLEGE_NAV_SENIOR = [
  { id: 'dashboard', label: 'Applications', href: '/college' },
  { id: 'activities', label: 'Activities & Resume', href: '/college/activities' },
  { id: 'common-app', label: 'Common App', href: '/college/common-app' },
  { id: 'timeline', label: 'Timeline', href: '/college/timeline' },
] as const

/** @deprecated use getCollegeNav(phase) */
export const COLLEGE_NAV = COLLEGE_NAV_JUNIOR

export function getCollegeNav(phase: ApplicationPhase) {
  return phase === 'senior' ? COLLEGE_NAV_SENIOR : COLLEGE_NAV_JUNIOR
}

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  'Athletics',
  'Academic',
  'Leadership',
  'Research',
  'Volunteer',
  'Employment',
  'Personal Project',
]

export const JUNIOR_STATUSES: ApplicationStatus[] = ['researching', 'planning']

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'researching',
  'planning',
  'applying',
  'submitted',
  'waiting',
  'accepted',
  'rejected',
  'committed',
]

export const RESUME_TEMPLATES: { id: ResumeTemplate; label: string }[] = [
  { id: 'classic', label: 'Classic' },
  { id: 'modern', label: 'Modern' },
  { id: 'compact', label: 'Compact' },
]

export const JUNIOR_CHECKLIST: ChecklistItem[] = [
  { key: 'application_submitted', label: 'Build reach / target / safety list', completed: false },
  { key: 'personal_essay', label: 'Brainstorm essay themes', completed: false },
  { key: 'supplemental_essays', label: 'Research application requirements', completed: false },
  { key: 'transcript', label: 'Review GPA & junior course plan', completed: false },
  { key: 'test_scores', label: 'SAT/ACT prep timeline', completed: false },
  { key: 'recommendations', label: 'Build mentor relationships', completed: false },
  { key: 'interview', label: 'Attend info sessions & tours', completed: false },
  { key: 'financial_aid', label: 'Learn financial aid basics', completed: false },
  { key: 'scholarships', label: 'Research summer programs', completed: false },
]

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { key: 'application_submitted', label: 'Application submitted', completed: false },
  { key: 'personal_essay', label: 'Personal essay', completed: false },
  { key: 'supplemental_essays', label: 'Supplemental essays', completed: false },
  { key: 'transcript', label: 'Transcript', completed: false },
  { key: 'test_scores', label: 'Test scores', completed: false },
  { key: 'recommendations', label: 'Recommendations', completed: false },
  { key: 'interview', label: 'Interview', completed: false },
  { key: 'financial_aid', label: 'Financial aid', completed: false },
  { key: 'scholarships', label: 'Scholarships', completed: false },
]

export const DEFAULT_COMMON_APP: CommonAppData = {
  activityDescriptions: [],
  essayIdeas: [],
  personalStatementDrafts: [],
  supplementalTracking: [],
  reflectionNotes: [],
}

export const DEFAULT_RESUME_SETTINGS: ResumeSettings = {
  template: 'classic',
  selectedActivityIds: [],
  selectedAwardIds: [],
  selectedProjectIds: [],
  applicationPhase: 'junior',
  seniorModeStartedAt: null,
}

export const DEFAULT_TEST_SCORES: TestScores = {
  sat: { score: null, status: 'not_taken', date: null },
  act: { score: null, status: 'not_taken', date: null },
}
