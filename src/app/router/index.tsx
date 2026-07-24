/**
 * Application route definitions.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@components/auth/ProtectedRoute'
import { OnboardingGuard } from '@components/auth/OnboardingGuard'
import { GuestRoute } from '@components/auth/GuestRoute'
import { MainLayout } from '@components/layout/MainLayout'
import {
  LoginPage,
  SignUpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from '@features/auth'
import { OnboardingPage } from '@features/onboarding'
import { HomePage } from '@features/dashboard'
import { TasksPage } from '@features/tasks'
import { GoalsPage } from '@features/goals'
import {
  CollegeLayout,
  CollegeDashboardPage,
  CollegeProfilePage,
  ActivitiesResumePage,
  CommonAppPage,
  TimelinePage,
} from '@features/college'
import { JournalPage } from '@features/journal'
import {
  SoccerLayout,
  SoccerOverviewPage,
  TrainingSessionsPage,
  MatchesPage,
  TechnicalSkillsPage,
  PhysicalMetricsPage,
  WeaknessesPage,
  StrengthsPage,
  AiCoachPage,
  ProgressChartsPage,
  RunningPage,
} from '@features/soccer'
import { AnalyticsPage } from '@features/analytics'
import { AssistantPage } from '@features/assistant'
import { SettingsPage } from '@features/settings'

export function AppRouter() {
  return (
    <Routes>
      {/* Password reset — outside guest guard (recovery session is authenticated) */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Auth pages — redirect to home if already signed in */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Onboarding — requires authentication but not onboarding completion */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>

      {/* App pages — require authentication and completed onboarding */}
      <Route element={<ProtectedRoute />}>
        <Route element={<OnboardingGuard><MainLayout /></OnboardingGuard>}>
            <Route index element={<HomePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="college" element={<CollegeLayout />}>
            <Route index element={<CollegeDashboardPage />} />
            <Route path="activities" element={<ActivitiesResumePage />} />
            <Route path="common-app" element={<CommonAppPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="schools/:collegeId" element={<CollegeProfilePage />} />
          </Route>
          <Route path="journal" element={<JournalPage />} />
          <Route path="soccer" element={<SoccerLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<SoccerOverviewPage />} />
            <Route path="training" element={<TrainingSessionsPage />} />
            <Route path="running" element={<RunningPage />} />
            <Route path="matches" element={<MatchesPage />} />
            <Route path="technical" element={<TechnicalSkillsPage />} />
            <Route path="physical" element={<PhysicalMetricsPage />} />
            <Route path="weaknesses" element={<WeaknessesPage />} />
            <Route path="strengths" element={<StrengthsPage />} />
            <Route path="coach" element={<AiCoachPage />} />
            <Route path="progress" element={<ProgressChartsPage />} />
          </Route>
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="assistant" element={<AssistantPage />} />
            <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
