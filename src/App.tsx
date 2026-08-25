import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { PlanProvider } from '@/contexts/PlanContext'
import { ToastProvider } from '@/components/ui/toast'
import { AppShell } from '@/components/layout/AppShell'
import { OnboardingRoute, ProtectedRoute } from '@/components/layout/ProtectedRoute'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import OnboardingPage from '@/pages/OnboardingPage'
import DashboardPage from '@/pages/DashboardPage'
import MealPlanPage from '@/pages/MealPlanPage'
import ShoppingPage from '@/pages/ShoppingPage'
import ProgressPage from '@/pages/ProgressPage'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <PlanProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              <Route element={<OnboardingRoute />}>
                <Route path="/onboarding" element={<OnboardingPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/meals" element={<MealPlanPage />} />
                  <Route path="/shopping" element={<ShoppingPage />} />
                  <Route path="/progress" element={<ProgressPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PlanProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
