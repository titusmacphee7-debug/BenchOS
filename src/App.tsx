import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { AppRoutes } from './app/routes'
import { useSeedDatabase } from './data/hooks'
import { getCurrentSession, listenToAuthChanges } from './lib/auth/authService'

export default function App() {
  const { ready, error } = useSeedDatabase()

  useEffect(() => {
    void getCurrentSession().catch(() => undefined)
    return listenToAuthChanges()
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bench-bg p-6 text-bench-text">
        <div className="panel-surface max-w-lg rounded-xl p-6">
          <h1 className="text-xl font-semibold">BenchOS could not initialize local data.</h1>
          <p className="mt-2 text-sm text-bench-muted">{String(error)}</p>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bench-bg p-6 text-bench-text">
        <div className="panel-surface rounded-xl p-6 text-center">
          <p className="text-lg font-semibold">Preparing your local workshop...</p>
          <p className="mt-2 text-sm text-bench-muted">Seeding the Tool Library and sample inventory.</p>
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
