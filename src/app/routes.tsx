import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { useAccountOnboardingStatus, useAuthGateState } from '../data/hooks'

const AccountOnboardingPage = lazy(() =>
  import('../features/auth/AccountOnboardingPage').then((module) => ({ default: module.AccountOnboardingPage })),
)
const AccountPage = lazy(() => import('../features/auth/AuthPages').then((module) => ({ default: module.AccountPage })))
const LoginPage = lazy(() => import('../features/auth/AuthPages').then((module) => ({ default: module.LoginPage })))
const SignupPage = lazy(() => import('../features/auth/AuthPages').then((module) => ({ default: module.SignupPage })))
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const GapAnalyzerPage = lazy(() =>
  import('../features/gap-analyzer/GapAnalyzerPage').then((module) => ({ default: module.GapAnalyzerPage })),
)
const MaterialsPage = lazy(() => import('../features/materials/MaterialsPage').then((module) => ({ default: module.MaterialsPage })))
const MasteryPage = lazy(() => import('../features/mastery/MasteryPage').then((module) => ({ default: module.MasteryPage })))
const MyToolsPage = lazy(() => import('../features/my-tools/MyToolsPage').then((module) => ({ default: module.MyToolsPage })))
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

function SessionLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bench-bg p-6 text-bench-text">
      <div className="panel-surface rounded-xl p-6 text-center">
        <p className="text-lg font-semibold">Checking secure session...</p>
        <p className="mt-2 text-sm text-bench-muted">BenchOS will send you to sign in if this device has no active account session.</p>
      </div>
    </div>
  )
}

function PublicAuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bench-bg px-5 py-7 text-bench-text lg:px-8">
      <div className="mx-auto mb-7 flex max-w-6xl items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-bench-orange/35 bg-bench-orange/15 text-lg font-black text-bench-orange">
          B
        </span>
        <div>
          <p className="text-lg font-black tracking-wide text-bench-text">BenchOS</p>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bench-muted">Workshop command center</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function publicAuthElement(element: ReactNode) {
  return routeElement(<PublicAuthFrame>{element}</PublicAuthFrame>)
}

export function AppRoutes() {
  const authGate = useAuthGateState()
  const accountOnboarding = useAccountOnboardingStatus()
  const signedIn = authGate.session?.status === 'signed_in' && authGate.session.provider === 'auth0'

  if (!authGate.ready) return <SessionLoadingFallback />

  if (!signedIn) {
    return (
      <Routes>
        <Route path="/login" element={publicAuthElement(<LoginPage />)} />
        <Route path="/signup" element={publicAuthElement(<SignupPage />)} />
        <Route path="/reset-password" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (!accountOnboarding.ready) return <SessionLoadingFallback />

  if (!accountOnboarding.complete) {
    return (
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/account-onboarding" element={routeElement(<AccountOnboardingPage />)} />
          <Route path="/account" element={routeElement(<AccountPage />)} />
          <Route path="/login" element={<Navigate to="/account-onboarding" replace />} />
          <Route path="/signup" element={<Navigate to="/account-onboarding" replace />} />
          <Route path="/reset-password" element={<Navigate to="/account-onboarding" replace />} />
          <Route path="*" element={<Navigate to="/account-onboarding" replace />} />
        </Route>
      </Routes>
    )
  }

  return (
    <Routes>
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
        <Route path="login" element={<Navigate to="/" replace />} />
        <Route path="signup" element={<Navigate to="/" replace />} />
        <Route path="reset-password" element={<Navigate to="/" replace />} />
        <Route path="account" element={routeElement(<AccountPage />)} />
        <Route path="account-onboarding" element={routeElement(<AccountOnboardingPage />)} />
        <Route path="local-mode" element={<Navigate to="/" replace />} />
        <Route path="onboarding" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
