/**
 * College seed data for initialization and testing.
 */

// Seed data functions
export function buildSeedActivities() {
  return []
}

export function buildSeedAwards() {
  return []
}

export function buildSeedColleges() {
  return []
}

export function buildSeedProjects() {
  return []
}

// Test scores data
export const testScoresData = {
  sat: {
    total: 1480,
    math: 750,
    reading: 730,
    date: '2026-06-01',
  },
  act: null,
  ap: [
    { subject: 'Calculus BC', score: 5, year: 2025 },
    { subject: 'English Literature', score: 4, year: 2025 },
    { subject: 'US History', score: 4, year: 2024 },
  ],
  ib: null,
}

// Recommendations data
export const recommendationsData = [
  {
    id: 'rec-1',
    teacher: 'Ms. Johnson',
    subject: 'AP English Literature',
    status: 'submitted',
    type: 'teacher',
  },
  {
    id: 'rec-2',
    teacher: 'Mr. Chen',
    subject: 'AP Calculus BC',
    status: 'submitted',
    type: 'teacher',
  },
  {
    id: 'rec-3',
    teacher: 'Coach Martinez',
    subject: 'Soccer Coach',
    status: 'pending',
    type: 'additional',
  },
]

// Scholarships data
export const scholarshipsData = [
  {
    id: 'schol-1',
    name: 'Merit-Based Academic Scholarship',
    amount: '$5,000',
    deadline: '2026-12-15',
    status: 'not_started',
  },
  {
    id: 'schol-2',
    name: 'Soccer Athletic Scholarship',
    amount: '$3,000',
    deadline: '2026-11-30',
    status: 'in_progress',
  },
]

// AI recommendations data
export const aiRecommendationsData = [
  {
    id: 'ai-rec-1',
    type: 'college_match',
    title: 'Consider adding more target schools',
    description: 'Based on your stats, you might want to add 2-3 more target schools to balance your list.',
    priority: 'medium',
  },
  {
    id: 'ai-rec-2',
    type: 'essay_topic',
    title: 'Your soccer leadership experience',
    description: 'Your role as team captain could make for a compelling personal essay topic.',
    priority: 'high',
  },
]

// Junior year financial aid data
export const juniorFinancialAidData = {
  fafsa_preview: false,
  css_profile_schools: [],
  scholarship_search_started: false,
  state_aid_research: false,
}

// Senior year financial aid data
export const seniorFinancialAidData = {
  fafsa_submitted: false,
  css_profile_submitted: false,
  tax_forms_ready: false,
  scholarships_applied: 3,
}