/**
 * Application route definitions.
 */
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@components/auth/ProtectedRoute'
import { GuestRoute } from '@components/auth/GuestRoute'
import { MainLayout } from '@components/layout/MainLayout'
import {
  LoginPage,
  SignUpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from '@features/auth'
import { HomePage } from '@features/dashboard'
import { TasksPage } from '@features/tasks'
import { GoalsPage } from '@features/goals'
import { JournalPage } from '@features/journal'
import { SoccerPage } from '@features/soccer'
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

      {/* App pages — require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="soccer" element={<SoccerPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
