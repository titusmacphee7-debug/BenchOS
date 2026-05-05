import { createContext, useContext } from 'react'
import type { User } from '@auth0/auth0-react'
import { getRequiredAuth0Origins } from './auth0Config'

export type BenchAuth0ContextValue = {
  available: boolean
  isLoading: boolean
  isAuthenticated: boolean
  error?: Error
  user?: User
  login: () => Promise<void>
  signup: () => Promise<void>
  logout: () => void
  requiredOrigins: ReturnType<typeof getRequiredAuth0Origins>
}

const defaultContext: BenchAuth0ContextValue = {
  available: false,
  isLoading: false,
  isAuthenticated: false,
  login: () => Promise.reject(new Error('Auth0 is not available in this render tree.')),
  signup: () => Promise.reject(new Error('Auth0 is not available in this render tree.')),
  logout: () => undefined,
  requiredOrigins: getRequiredAuth0Origins(),
}

export const BenchAuth0Context = createContext<BenchAuth0ContextValue>(defaultContext)

export function useBenchAuth0() {
  return useContext(BenchAuth0Context)
}
