import { BrowserRouter } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AppRoutes } from './app/routes'
import { useSeedDatabase } from './data/hooks'
import { getCurrentSession, listenToAuthChanges, persistAuthSession } from './lib/auth/authService'

export default function App() {
  const { ready, error } = useSeedDatabase()
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let active = true
    void getCurrentSession()
      .catch(() => persistAuthSession(null).catch(() => undefined))
      .finally(() => {
        if (active) setAuthReady(true)
      })
    const unsubscribe = listenToAuthChanges()
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

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

  if (!ready || !authReady) {
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
