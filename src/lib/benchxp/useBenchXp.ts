import { useCallback, useEffect, useState } from 'react'
import { useBenchAuth0 } from '../auth/benchAuth0Context'
import { emptyBenchXpState, fetchBenchXpState, sendBenchXpAction, type BenchXpAction, type BenchXpState } from './benchXpApi'

export function useBenchXp() {
  const auth = useBenchAuth0()
  const [state, setState] = useState<BenchXpState>(emptyBenchXpState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const ready = auth.available && auth.isAuthenticated && !auth.isLoading

  const refresh = useCallback(async () => {
    if (!ready) {
      setState(emptyBenchXpState)
      setLoading(false)
      return emptyBenchXpState
    }

    setLoading(true)
    setError(undefined)
    try {
      const nextState = await fetchBenchXpState(auth.getAccessToken)
      setState(nextState)
      return nextState
    } catch (err) {
      const message = err instanceof Error ? err.message : 'BenchXP could not load.'
      setError(message)
      return emptyBenchXpState
    } finally {
      setLoading(false)
    }
  }, [auth.getAccessToken, ready])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh()
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [refresh])

  const sendAction = useCallback(async (action: BenchXpAction) => {
    if (!ready) throw new Error('Sign in is required before saving BenchXP progress.')

    setError(undefined)
    try {
      const nextState = await sendBenchXpAction(auth.getAccessToken, action)
      setState(nextState)
      return nextState
    } catch (err) {
      const message = err instanceof Error ? err.message : 'BenchXP could not save progress.'
      setError(message)
      throw err
    }
  }, [auth.getAccessToken, ready])

  return {
    state,
    loading,
    error,
    ready,
    refresh,
    sendAction,
    startGuide: (payload: Omit<Extract<BenchXpAction, { action: 'start-guide' }>, 'action'>) => sendAction({ action: 'start-guide', ...payload }),
    completeStep: (payload: Omit<Extract<BenchXpAction, { action: 'complete-step' }>, 'action'>) => sendAction({ action: 'complete-step', ...payload }),
    logPractice: (payload: Omit<Extract<BenchXpAction, { action: 'log-practice' }>, 'action'>) => sendAction({ action: 'log-practice', ...payload }),
    logConfidence: (payload: Omit<Extract<BenchXpAction, { action: 'confidence-checkin' }>, 'action'>) => sendAction({ action: 'confidence-checkin', ...payload }),
    logMistake: (payload: Omit<Extract<BenchXpAction, { action: 'mistake-log' }>, 'action'>) => sendAction({ action: 'mistake-log', ...payload }),
    logMaintenance: (payload: Omit<Extract<BenchXpAction, { action: 'maintenance-log' }>, 'action'>) => sendAction({ action: 'maintenance-log', ...payload }),
    toggleFavoriteGuide: (payload: Omit<Extract<BenchXpAction, { action: 'favorite-guide' }>, 'action'>) => sendAction({ action: 'favorite-guide', ...payload }),
    dismissTooltip: (tooltipKey: string) => sendAction({ action: 'dismiss-tooltip', tooltipKey }),
    saveReadinessPreferences: (payload: Omit<Extract<BenchXpAction, { action: 'readiness-preferences' }>, 'action'>) => sendAction({ action: 'readiness-preferences', ...payload }),
  }
}
