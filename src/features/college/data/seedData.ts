/**
 * College seed data for initialization and testing.
 */

// Seed data functions - return empty arrays for now
export function buildSeedActivities(_userId: string): any[] {
  return []
}

export function buildSeedAwards(_userId: string): any[] {
  return []
}

export function buildSeedColleges(_userId: string): any[] {
  return []
}

export function buildSeedProjects(_userId: string): any[] {
  return []
}

// Test scores data
export const testScoresData = {
  sat: {
    score: 1480,
    status: 'completed' as const,
    date: '2026-06-01',
  },
  act: {
    score: null,
    status: 'not_taken' as const,
    date: null,
  },
}

// Recommendations data
export const recommendationsData = [
  {
    id: 'rec-1',
    recommender: 'Ms. Johnson',
    role: 'teacher' as const,
    collegeIds: ['college-1', 'college-2'],
    status: 'submitted' as const,
    dueDate: '2026-12-01',
  },
  {
    id: 'rec-2',
    recommender: 'Mr. Chen', 
    role: 'teacher' as const,
    collegeIds: ['college-1', 'college-3'],
    status: 'submitted' as const,
    dueDate: '2026-12-01',
  },
  {
    id: 'rec-3',
    recommender: 'Coach Martinez',
    role: 'coach' as const,
    collegeIds: ['college-2'],
    status: 'requested' as const,
    dueDate: '2026-11-15',
  },
]

// Scholarships data
export const scholarshipsData = [
  {
    id: 'schol-1',
    name: 'Merit-Based Academic Scholarship',
    amount: 5000,
    deadline: '2026-12-15',
    status: 'not_started' as const,
    requirements: ['GPA 3.5+', 'Essay required', 'Community service'],
  },
  {
    id: 'schol-2',
    name: 'Soccer Athletic Scholarship',
    amount: 3000,
    deadline: '2026-11-30',
    status: 'in_progress' as const,
    requirements: ['Varsity team participation', 'Coach recommendation'],
  },
]

// AI recommendations data
export const aiRecommendationsData = [
  {
    id: 'ai-rec-1',
    type: 'school' as const,
    title: 'Consider adding more target schools',
    description: 'Based on your stats, you might want to add 2-3 more target schools to balance your list.',
  },
  {
    id: 'ai-rec-2',
    type: 'essay' as const,
    title: 'Your soccer leadership experience',
    description: 'Your role as team captain could make for a compelling personal essay topic.',
  },
]

// Junior year financial aid data
export const juniorFinancialAidData = [
  {
    id: 'fafsa-preview',
    label: 'FAFSA Preview',
    completed: false,
    dueDate: null,
  },
  {
    id: 'scholarship-search',
    label: 'Scholarship Search Started', 
    completed: false,
    dueDate: '2026-10-01',
  },
  {
    id: 'state-aid-research',
    label: 'State Aid Research',
    completed: false,
    dueDate: null,
  },
]

// Senior year financial aid data
export const seniorFinancialAidData = [
  {
    id: 'fafsa-submitted',
    label: 'FAFSA Submitted',
    completed: false,
    dueDate: '2027-01-01',
  },
  {
    id: 'css-profile',
    label: 'CSS Profile Submitted',
    completed: false,
    dueDate: '2026-12-15',
  },
  {
    id: 'tax-forms',
    label: 'Tax Forms Ready',
    completed: false,
    dueDate: '2027-02-01',
  },
]