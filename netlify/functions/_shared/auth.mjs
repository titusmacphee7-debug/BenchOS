import { createRemoteJWKSet, jwtVerify } from 'jose'

let jwks

function auth0Domain() {
  return (process.env.AUTH0_DOMAIN || process.env.VITE_AUTH0_DOMAIN || 'appbenchos.us.auth0.com').replace(/^https?:\/\//, '')
}

function auth0Audience() {
  return process.env.AUTH0_AUDIENCE || process.env.VITE_AUTH0_AUDIENCE
}

function bearerToken(event) {
  const header = event.headers.authorization || event.headers.Authorization
  if (!header?.startsWith('Bearer ')) {
    const error = new Error('Missing Auth0 bearer token.')
    error.statusCode = 401
    throw error
  }
  return header.slice('Bearer '.length).trim()
}

export async function requireAuth(event) {
  const domain = auth0Domain()
  const audience = auth0Audience()
  if (!audience) {
    const error = new Error('Server Auth0 audience is not configured. Add AUTH0_AUDIENCE in Netlify and VITE_AUTH0_AUDIENCE in the frontend environment.')
    error.statusCode = 500
    throw error
  }

  jwks ??= createRemoteJWKSet(new URL(`https://${domain}/.well-known/jwks.json`))
  const token = bearerToken(event)
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `https://${domain}/`,
    audience,
  })

  if (!payload.sub) {
    const error = new Error('Auth0 token did not include a subject.')
    error.statusCode = 401
    throw error
  }

  return {
    auth0Sub: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    displayName: typeof payload.name === 'string' ? payload.name : undefined,
    avatarUrl: typeof payload.picture === 'string' ? payload.picture : undefined,
  }
}
