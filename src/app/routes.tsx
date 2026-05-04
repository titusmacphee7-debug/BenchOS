import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { useAccountOnboardingStatus, useOnboardingStatus } from '../data/hooks'
import { AccountOnboardingPage } from '../features/auth/AccountOnboardingPage'
import { AccountPage, LocalModePage, LoginPage, ResetPasswordPage, SignupPage } from '../features/auth/AuthPages'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { GapAnalyzerPage } from '../features/gap-analyzer/GapAnalyzerPage'
import { MaterialsPage } from '../features/materials/MaterialsPage'
import { MasteryPage } from '../features/mastery/MasteryPage'
import { MyToolsPage } from '../features/my-tools/MyToolsPage'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { ProjectDetailPage } from '../features/projects/ProjectDetailPage'
import { ProjectsPage } from '../features/projects/ProjectsPage'
import { ProjectTemplateDetailPage } from '../features/project-templates/ProjectTemplateDetailPage'
import { ProjectTemplatesPage } from '../features/project-templates/ProjectTemplatesPage'
import { BuyingPreferencesPage } from '../features/settings/BuyingPreferencesPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { ToolGuidePage } from '../features/tool-guides/ToolGuidePage'
import { ToolLibraryPage } from '../features/tool-library/ToolLibraryPage'
import { WishlistPage } from '../features/wishlist/WishlistPage'
import { WorkshopScorePage } from '../features/workshop-score/WorkshopScorePage'

export function AppRoutes() {
  const onboarding = useOnboardingStatus()
  const accountOnboarding = useAccountOnboardingStatus()

  if (!onboarding.ready || !accountOnboarding.ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bench-bg p-6 text-bench-text">
        <div className="panel-surface rounded-xl p-6 text-center">
          <p className="text-lg font-semibold">Checking workshop setup...</p>
          <p className="mt-2 text-sm text-bench-muted">Preparing your local-first workspace.</p>
        </div>
      </div>
    )
  }

  if (!onboarding.complete) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<AppShell />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account-onboarding" element={<AccountOnboardingPage />} />
          <Route path="/local-mode" element={<LocalModePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  if (!accountOnboarding.complete) {
    return (
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/account-onboarding" element={<AccountOnboardingPage />} />
          <Route path="/account" element={<Navigate to="/account-onboarding" replace />} />
          <Route path="/local-mode" element={<LocalModePage />} />
          <Route path="*" element={<Navigate to="/account-onboarding" replace />} />
        </Route>
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="tool-library" element={<ToolLibraryPage />} />
        <Route path="tool-guides/:toolTypeId" element={<ToolGuidePage />} />
        <Route path="my-tools" element={<MyToolsPage />} />
        <Route path="materials" element={<MaterialsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="project-templates" element={<ProjectTemplatesPage />} />
        <Route path="project-templates/:templateId" element={<ProjectTemplateDetailPage />} />
        <Route path="gap-analyzer" element={<GapAnalyzerPage />} />
        <Route path="workshop-score" element={<WorkshopScorePage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="mastery" element={<MasteryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/buying-preferences" element={<BuyingPreferencesPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="account-onboarding" element={<AccountOnboardingPage />} />
        <Route path="local-mode" element={<LocalModePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
