import { getSupabaseClient } from '@lib/supabase'
import type { TableUpdate } from '@/types/database'
import type {
  CollegeUserData,
  CommonAppData,
  ResumeSettings,
  TestScores,
} from '@features/college/types'
import {
  DEFAULT_COMMON_APP,
  DEFAULT_RESUME_SETTINGS,
} from '@features/college/types'
import { mapUserDataRow, toJson } from '@features/college/mappers'
import {
  aiRecommendationsData,
  juniorFinancialAidData,
  recommendationsData,
  scholarshipsData,
  testScoresData,
} from '@features/college/data/seedData'

function requireClient() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

function defaultUserData(userId: string): CollegeUserData {
  return {
    user_id: userId,
    testScores: testScoresData,
    financialAid: juniorFinancialAidData,
    recommendations: recommendationsData,
    scholarships: scholarshipsData,
    aiRecommendations: aiRecommendationsData,
    commonApp: DEFAULT_COMMON_APP,
    resumeSettings: DEFAULT_RESUME_SETTINGS,
    updated_at: new Date().toISOString(),
  }
}

export const collegeUserDataService = {
  async fetch(userId: string): Promise<CollegeUserData> {
    const client = requireClient()
    const { data, error } = await client
      .from('college_user_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    if (!data) return defaultUserData(userId)
    return mapUserDataRow(data)
  },

  async ensure(userId: string): Promise<CollegeUserData> {
    const client = requireClient()
    const existing = await collegeUserDataService.fetch(userId)
    const { data: row } = await client
      .from('college_user_data')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (row) return existing

    const seed = defaultUserData(userId)
    const { data, error } = await client
      .from('college_user_data')
      .insert({
        user_id: userId,
        test_scores: toJson(seed.testScores),
        financial_aid: toJson(seed.financialAid),
        recommendations: toJson(seed.recommendations),
        scholarships: toJson(seed.scholarships),
        ai_recommendations: toJson(seed.aiRecommendations),
        common_app: toJson(seed.commonApp),
        resume_settings: toJson(seed.resumeSettings),
      })
      .select()
      .single()

    if (error) throw error
    return mapUserDataRow(data)
  },

  async updateTestScores(userId: string, testScores: TestScores): Promise<CollegeUserData> {
    return collegeUserDataService.patch(userId, { test_scores: toJson(testScores) })
  },

  async updateFinancialAid(userId: string, financialAid: CollegeUserData['financialAid']) {
    return collegeUserDataService.patch(userId, { financial_aid: toJson(financialAid) })
  },

  async updateRecommendations(userId: string, recommendations: CollegeUserData['recommendations']) {
    return collegeUserDataService.patch(userId, { recommendations: toJson(recommendations) })
  },

  async updateScholarships(userId: string, scholarships: CollegeUserData['scholarships']) {
    return collegeUserDataService.patch(userId, { scholarships: toJson(scholarships) })
  },

  async updateCommonApp(userId: string, commonApp: CommonAppData) {
    return collegeUserDataService.patch(userId, { common_app: toJson(commonApp) })
  },

  async updateResumeSettings(userId: string, resumeSettings: ResumeSettings) {
    return collegeUserDataService.patch(userId, { resume_settings: toJson(resumeSettings) })
  },

  async patch(userId: string, payload: TableUpdate<'college_user_data'>): Promise<CollegeUserData> {
    const client = requireClient()
    await collegeUserDataService.ensure(userId)

    const { data, error } = await client
      .from('college_user_data')
      .update(payload)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return mapUserDataRow(data)
  },
}
