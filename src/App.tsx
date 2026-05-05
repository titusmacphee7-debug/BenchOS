import { BrowserRouter } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AppRoutes } from './app/routes'
import { useSeedDatabase } from './data/hooks'
import { clearExternalAuthSession, getCurrentSession, listenToAuthChanges, persistAuthSession, persistExternalAuthSession } from './lib/auth/authService'
import { useBenchAuth0 } from './lib/auth/benchAuth0Context'

export default function App() {
  const { ready, error } = useSeedDatabase()
  const auth0 = useBenchAuth0()
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let active = true
    async function prepareAuth() {
      if (auth0.available && auth0.isLoading) return
      try {
        await getCurrentSession()
      } catch {
        await persistAuthSession(null).catch(() => undefined)
      }

      if (auth0.available && auth0.isAuthenticated && auth0.user?.sub) {
        await persistExternalAuthSession({
          provider: 'auth0',
          userId: auth0.user.sub,
          email: auth0.user.email,
          displayName: auth0.user.name,
          avatarUrl: auth0.user.picture,
        }).catch(() => undefined)
      } else if (auth0.available && !auth0.isAuthenticated) {
        await clearExternalAuthSession('auth0').catch(() => undefined)
      }

      if (active) setAuthReady(true)
    }

    void prepareAuth()
    const unsubscribe = listenToAuthChanges()
    return () => {
      active = false
      unsubscribe()
    }
  }, [auth0.available, auth0.isAuthenticated, auth0.isLoading, auth0.user?.email, auth0.user?.name, auth0.user?.picture, auth0.user?.sub])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bench-bg p-6 text-bench-text">
        <div className="panel-surface max-w-lg rounded-xl p-6">
          <h1 className="text-xl font-semibold">BenchOS could not initialize app data.</h1>
          <p className="mt-2 text-sm text-bench-muted">{String(error)}</p>
        </div>
      </div>
    )
  }

  if (!ready || !authReady || (auth0.available && auth0.isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bench-bg p-6 text-bench-text">
        <div className="panel-surface rounded-xl p-6 text-center">
          <p className="text-lg font-semibold">Preparing your secure workshop...</p>
          <p className="mt-2 text-sm text-bench-muted">Loading the Tool Library and checking your sign-in session.</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
