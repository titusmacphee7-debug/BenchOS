import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { useAccountOnboardingStatus, useOnboardingStatus } from '../data/hooks'

const AccountOnboardingPage = lazy(() =>
  import('../features/auth/AccountOnboardingPage').then((module) => ({ default: module.AccountOnboardingPage })),
)
const AccountPage = lazy(() => import('../features/auth/AuthPages').then((module) => ({ default: module.AccountPage })))
const LocalModePage = lazy(() => import('../features/auth/AuthPages').then((module) => ({ default: module.LocalModePage })))
const LoginPage = lazy(() => import('../features/auth/AuthPages').then((module) => ({ default: module.LoginPage })))
const ResetPasswordPage = lazy(() => import('../features/auth/AuthPages').then((module) => ({ default: module.ResetPasswordPage })))
const SignupPage = lazy(() => import('../features/auth/AuthPages').then((module) => ({ default: module.SignupPage })))
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const GapAnalyzerPage = lazy(() =>
  import('../features/gap-analyzer/GapAnalyzerPage').then((module) => ({ default: module.GapAnalyzerPage })),
)
const MaterialsPage = lazy(() => import('../features/materials/MaterialsPage').then((module) => ({ default: module.MaterialsPage })))
const MasteryPage = lazy(() => import('../features/mastery/MasteryPage').then((module) => ({ default: module.MasteryPage })))
const MyToolsPage = lazy(() => import('../features/my-tools/MyToolsPage').then((module) => ({ default: module.MyToolsPage })))
const OnboardingPage = lazy(() => import('../features/onboarding/OnboardingPage').then((module) => ({ default: module.OnboardingPage })))
const ProjectDetailPage = lazy(() =>
  import('../features/projects/ProjectDetailPage').then((module) => ({ default: module.ProjectDetailPage })),
)
const ProjectsPage = lazy(() => import('../features/projects/ProjectsPage').then((module) => ({ default: module.ProjectsPage })))
const ProjectTemplateDetailPage = lazy(() =>
  import('../features/project-templates/ProjectTemplateDetailPage').then((module) => ({ default: module.ProjectTemplateDetailPage })),
)
const ProjectTemplatesPage = lazy(() =>
  import('../features/project-templates/ProjectTemplatesPage').then((module) => ({ default: module.ProjectTemplatesPage })),
)
const BuyingPreferencesPage = lazy(() =>
  import('../features/settings/BuyingPreferencesPage').then((module) => ({ default: module.BuyingPreferencesPage })),
)
const SettingsPage = lazy(() => import('../features/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const ToolGuidePage = lazy(() => import('../features/tool-guides/ToolGuidePage').then((module) => ({ default: module.ToolGuidePage })))
const ToolLibraryPage = lazy(() =>
  import('../features/tool-library/ToolLibraryPage').then((module) => ({ default: module.ToolLibraryPage })),
)
const WishlistPage = lazy(() => import('../features/wishlist/WishlistPage').then((module) => ({ default: module.WishlistPage })))
const WorkshopScorePage = lazy(() =>
  import('../features/workshop-score/WorkshopScorePage').then((module) => ({ default: module.WorkshopScorePage })),
)

function routeElement(element: ReactNode) {
  return <Suspense fallback={<RouteLoadingFallback />}>{element}</Suspense>
}

function RouteLoadingFallback() {
  return (
    <div className="panel-surface rounded-xl p-5 text-sm text-bench-muted" role="status" aria-live="polite">
      Loading workshop view...
    </div>
  )
}

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
        <Route path="/onboarding" element={routeElement(<OnboardingPage />)} />
        <Route element={<AppShell />}>
          <Route path="/login" element={routeElement(<LoginPage />)} />
          <Route path="/signup" element={routeElement(<SignupPage />)} />
          <Route path="/reset-password" element={routeElement(<ResetPasswordPage />)} />
          <Route path="/account" element={routeElement(<AccountPage />)} />
          <Route path="/account-onboarding" element={routeElement(<AccountOnboardingPage />)} />
          <Route path="/local-mode" element={routeElement(<LocalModePage />)} />
        </Route>
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  if (!accountOnboarding.complete) {
    return (
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/account-onboarding" element={routeElement(<AccountOnboardingPage />)} />
          <Route path="/account" element={<Navigate to="/account-onboarding" replace />} />
          <Route path="/local-mode" element={routeElement(<LocalModePage />)} />
          <Route path="*" element={<Navigate to="/account-onboarding" replace />} />
        </Route>
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
      <Route element={<AppShell />}>
        <Route index element={routeElement(<DashboardPage />)} />
        <Route path="tool-library" element={routeElement(<ToolLibraryPage />)} />
        <Route path="tool-guides/:toolTypeId" element={routeElement(<ToolGuidePage />)} />
        <Route path="my-tools" element={routeElement(<MyToolsPage />)} />
        <Route path="materials" element={routeElement(<MaterialsPage />)} />
        <Route path="projects" element={routeElement(<ProjectsPage />)} />
        <Route path="projects/:projectId" element={routeElement(<ProjectDetailPage />)} />
        <Route path="project-templates" element={routeElement(<ProjectTemplatesPage />)} />
        <Route path="project-templates/:templateId" element={routeElement(<ProjectTemplateDetailPage />)} />
        <Route path="gap-analyzer" element={routeElement(<GapAnalyzerPage />)} />
        <Route path="workshop-score" element={routeElement(<WorkshopScorePage />)} />
        <Route path="wishlist" element={routeElement(<WishlistPage />)} />
        <Route path="mastery" element={routeElement(<MasteryPage />)} />
        <Route path="settings" element={routeElement(<SettingsPage />)} />
        <Route path="settings/buying-preferences" element={routeElement(<BuyingPreferencesPage />)} />
        <Route path="login" element={routeElement(<LoginPage />)} />
        <Route path="signup" element={routeElement(<SignupPage />)} />
        <Route path="reset-password" element={routeElement(<ResetPasswordPage />)} />
        <Route path="account" element={routeElement(<AccountPage />)} />
        <Route path="account-onboarding" element={routeElement(<AccountOnboardingPage />)} />
        <Route path="local-mode" element={routeElement(<LocalModePage />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
