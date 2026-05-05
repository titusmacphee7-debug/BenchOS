import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import { useMemo, type ReactNode } from 'react'
import { BenchAuth0Context, type BenchAuth0ContextValue } from './benchAuth0Context'
import { getAuth0Config, getAuth0RedirectUri } from './auth0Config'

export function BenchAuth0Provider({ children }: { children: ReactNode }) {
  const { domain, clientId, audience } = getAuth0Config()

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: getAuth0RedirectUri(), ...(audience ? { audience } : {}) }}
    >
      <BenchAuth0SessionProvider>{children}</BenchAuth0SessionProvider>
    </Auth0Provider>
  )
}

function BenchAuth0SessionProvider({ children }: { children: ReactNode }) {
  const auth0 = useAuth0()
  const { audience } = getAuth0Config()
  const value = useMemo<BenchAuth0ContextValue>(() => ({
    available: true,
    isLoading: auth0.isLoading,
    isAuthenticated: auth0.isAuthenticated,
    error: auth0.error,
    user: auth0.user,
    login: () => auth0.loginWithRedirect(),
    signup: () => auth0.loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } }),
    getAccessToken: () => auth0.getAccessTokenSilently(audience ? { authorizationParams: { audience } } : undefined),
    logout: () => auth0.logout({ logoutParams: { returnTo: getAuth0RedirectUri() } }),
  }), [auth0, audience])

  return (
    <BenchAuth0Context.Provider value={value}>
      {children}
    </BenchAuth0Context.Provider>
  )
}
