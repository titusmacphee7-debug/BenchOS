import { BrowserRouter } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AppRoutes } from './app/routes'
import { HammerLoadingReveal } from './components/loading/HammerLoadingReveal'
import { db } from './data/db'
import { clearAuthSession, persistAuth0Session } from './lib/auth/authService'
import { useBenchAuth0 } from './lib/auth/benchAuth0Context'

export default function App() {
  const auth0 = useBenchAuth0()
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let active = true
    async function prepareAuth() {
      if (auth0.available && auth0.isLoading) {
        setAuthReady(false)
        return
      }

      if (auth0.available && auth0.isAuthenticated && auth0.user?.sub) {
        await persistAuth0Session({
          userId: auth0.user.sub,
          email: auth0.user.email,
          displayName: auth0.user.name,
          avatarUrl: auth0.user.picture,
        }).catch(() => undefined)
      } else {
        await clearAuthSession().catch(() => undefined)
      }

      if (active) setAuthReady(true)
    }

    void prepareAuth()
    return () => {
      active = false
    }
  }, [auth0.available, auth0.isAuthenticated, auth0.isLoading, auth0.user?.email, auth0.user?.name, auth0.user?.picture, auth0.user?.sub])

  useEffect(() => {
    if (!authReady) return undefined
    let active = true
    const runSeedWarmup = () => {
      import('./data/seed/seedDatabase')
        .then((seedModule) => seedModule.ensureDatabaseSeeded(db, { includeSampleData: false }))
        .catch(() => undefined)
    }

    const scheduleIdle = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 1))
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout
    const idleId = scheduleIdle(() => {
      if (active) runSeedWarmup()
    }, { timeout: 1800 })

    return () => {
      active = false
      cancelIdle(idleId)
    }
  }, [authReady])

  if (!authReady || (auth0.available && auth0.isLoading)) {
    return (
      <HammerLoadingReveal
        fullScreen
        label="Preparing secure workshop access..."
        slowLabel="Checking Auth0 session state. Catalog data will warm up after the app shell is ready."
      />
    )
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
