import type {
  AiRecommendation,
  College,
  CreateActivityInput,
  CreateAwardInput,
  CreateProjectInput,
  FinancialAidItem,
  RecommendationLetter,
  Scholarship,
  TestScores,
} from '../types'
import { JUNIOR_CHECKLIST } from '../types'

export const testScoresData: TestScores = {
  sat: { score: 1320, status: 'completed', date: '2026-05-10' },
  act: { score: null, status: 'not_taken', date: null },
}

export const juniorFinancialAidData: FinancialAidItem[] = [
  { id: 'fa-j1', label: 'Review net price calculators', completed: true, dueDate: null },
  { id: 'fa-j2', label: 'Learn EFC / SAI basics with parents', completed: false, dueDate: '2026-08-15' },
  { id: 'fa-j3', label: 'Compare in-state vs out-of-state cost', completed: false, dueDate: '2026-09-01' },
  { id: 'fa-j4', label: 'Research merit aid policies', completed: false, dueDate: '2026-10-01' },
  { id: 'fa-j5', label: 'Start college savings conversation', completed: false, dueDate: null },
]

export const seniorFinancialAidData: FinancialAidItem[] = [
  { id: 'fa-s1', label: 'Complete FAFSA', completed: false, dueDate: '2026-10-01' },
  { id: 'fa-s2', label: 'CSS Profile (if required)', completed: false, dueDate: '2026-11-01' },
  { id: 'fa-s3', label: 'Review net price calculators', completed: true, dueDate: null },
  { id: 'fa-s4', label: 'Compare aid packages', completed: false, dueDate: null },
  { id: 'fa-s5', label: 'Research merit scholarships', completed: false, dueDate: '2026-09-15' },
]

export const recommendationsData: RecommendationLetter[] = [
  {
    id: 'rec-1',
    recommender: 'Mr. Chen — AP Calculus',
    role: 'teacher',
    collegeIds: [],
    status: 'not_requested',
    dueDate: '2026-10-15',
  },
  {
    id: 'rec-2',
    recommender: 'Coach Rivera',
    role: 'coach',
    collegeIds: [],
    status: 'not_requested',
    dueDate: '2026-10-15',
  },
]

export const scholarshipsData: Scholarship[] = [
  {
    id: 'sch-1',
    name: 'Local Community Foundation Merit Award',
    deadline: '2026-11-01',
    amount: 2500,
    status: 'not_started',
    requirements: ['Essay', 'Transcript', 'Activities list'],
  },
]

export const aiRecommendationsData: AiRecommendation[] = [
  {
    id: 'ai-1',
    type: 'plan',
    title: 'Balance your college list',
    description: 'Add 2 target and 1 safety school to complement your reach picks.',
  },
  {
    id: 'ai-2',
    type: 'essay',
    title: 'Start essay themes',
    description: 'Brainstorm 3 personal story angles before senior year.',
  },
]

type SeedCollege = Pick<
  College,
  | 'name'
  | 'location'
  | 'majors'
  | 'applicationType'
  | 'status'
  | 'acceptanceRate'
  | 'tuition'
  | 'checklist'
  | 'essays'
  | 'deadlines'
  | 'documents'
>

export function buildSeedColleges(_userId: string): SeedCollege[] {
  return [
    {
      name: 'University of North Carolina',
      location: 'Chapel Hill, NC',
      majors: ['Computer Science', 'Business'],
      applicationType: 'Early Action',
      status: 'researching',
      acceptanceRate: 19,
      tuition: 24000,
      checklist: JUNIOR_CHECKLIST.map((item) => ({ ...item })),
      essays: [],
      deadlines: [{ id: 'd1', label: 'EA deadline (research)', date: '2027-10-15', type: 'application' }],
      documents: [],
    },
    {
      name: 'Georgia Tech',
      location: 'Atlanta, GA',
      majors: ['Computer Science', 'Engineering'],
      applicationType: 'Regular Decision',
      status: 'planning',
      acceptanceRate: 17,
      tuition: 28000,
      checklist: JUNIOR_CHECKLIST.map((item) => ({ ...item })),
      essays: [],
      deadlines: [],
      documents: [],
    },
    {
      name: 'In-State Flagship',
      location: 'North Carolina',
      majors: ['Undecided'],
      applicationType: 'Regular Decision',
      status: 'researching',
      acceptanceRate: 45,
      tuition: 12000,
      checklist: JUNIOR_CHECKLIST.map((item) => ({ ...item })),
      essays: [],
      deadlines: [],
      documents: [],
    },
  ]
}

export function buildSeedActivities(_userId: string): CreateActivityInput[] {
  return [
    {
      name: 'Varsity Soccer',
      category: 'Athletics',
      organization: 'High School',
      role: 'Captain / CM',
      description: 'Starting central midfielder. Led team to regional semifinals.',
      startDate: '2024-08-01',
      endDate: null,
      weeklyHours: 12,
      weeksPerYear: 40,
      leadership: 'Captain',
      achievements: 'All-conference selection',
      skills: ['Leadership', 'Teamwork', 'Discipline'],
    },
    {
      name: 'Robotics Club',
      category: 'Academic',
      organization: 'School Club',
      role: 'Programming Lead',
      description: 'Built autonomous navigation stack for competition robot.',
      startDate: '2023-09-01',
      endDate: null,
      weeklyHours: 6,
      weeksPerYear: 30,
      leadership: 'Lead programmer',
      achievements: 'Regional finalist',
      skills: ['Python', 'Problem solving'],
    },
  ]
}

export function buildSeedAwards(_userId: string): CreateAwardInput[] {
  return [
    {
      name: 'Honor Roll',
      organization: 'High School',
      awardDate: '2026-01-15',
      level: 'School',
      description: 'Maintained 3.8+ GPA',
    },
  ]
}

export function buildSeedProjects(_userId: string): CreateProjectInput[] {
  return [
    {
      name: 'College List Research Tool',
      description: 'Built a spreadsheet system to compare colleges by fit, cost, and deadlines.',
      technologies: ['Google Sheets', 'Notion'],
      myRole: 'Creator',
      results: 'Tracked 15 schools with weighted scoring',
      challenges: 'Normalizing different deadline formats',
      lessonsLearned: 'Start comparing net price early',
      documents: [],
      startDate: '2026-03-01',
      endDate: null,
    },
  ]
}
