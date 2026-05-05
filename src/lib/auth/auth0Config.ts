const DEFAULT_AUTH0_DOMAIN = 'appbenchos.us.auth0.com'
const DEFAULT_AUTH0_CLIENT_ID = 'Y0a2nfZcrGrwkAFWpeeHn6CoZPmcwCKh'
const LOCAL_AUTH0_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'] as const
const PRODUCTION_AUTH0_ORIGIN = 'https://appbenchos.com'

export type Auth0Config = {
  domain: string
  clientId: string
}

export function getAuth0Config(): Auth0Config {
  const env = import.meta.env as Record<string, string | undefined>
  return {
    domain: env.VITE_AUTH0_DOMAIN?.trim() || DEFAULT_AUTH0_DOMAIN,
    clientId: env.VITE_AUTH0_CLIENT_ID?.trim() || DEFAULT_AUTH0_CLIENT_ID,
  }
}

export function getAuth0RedirectUri() {
  if (typeof window === 'undefined') return LOCAL_AUTH0_ORIGINS[0]
  return window.location.origin
}

export function getRequiredAuth0Origins() {
  return {
    callbacks: [...LOCAL_AUTH0_ORIGINS, PRODUCTION_AUTH0_ORIGIN],
    logouts: [...LOCAL_AUTH0_ORIGINS, PRODUCTION_AUTH0_ORIGIN],
    webOrigins: [...LOCAL_AUTH0_ORIGINS, PRODUCTION_AUTH0_ORIGIN],
  }
}
