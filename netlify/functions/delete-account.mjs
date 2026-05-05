import { requireAuth } from './_shared/auth.mjs'
import { transaction } from './_shared/db.mjs'
import { handleError, json, methodNotAllowed, readJson } from './_shared/responses.mjs'

export const handler = async (event) => {
  if (event.httpMethod !== 'DELETE') return methodNotAllowed('DELETE')

  try {
    const payload = readJson(event)
    if (payload.confirmation !== 'DELETE') {
      const error = new Error('Type DELETE to confirm account deletion.')
      error.statusCode = 400
      throw error
    }

    const claims = await requireAuth(event)
    const deletion = await deleteBenchOsData(claims.auth0Sub)
    await deleteAuth0User(claims.auth0Sub)

    return json(200, {
      ok: true,
      redirectTo: '/account-deleted',
      appUserDeleted: deletion.appUserDeleted,
    })
  } catch (error) {
    return handleError(error)
  }
}

async function deleteBenchOsData(auth0Sub) {
  return transaction(async (client) => {
    const user = await client.query('select id from app_users where auth0_sub = $1 limit 1', [auth0Sub])
    if (!user.rows[0]) return { appUserDeleted: false }

    const userId = user.rows[0].id
    await client.query('update workspaces set sample_batch_id = null where owner_user_id = $1', [userId])
    await client.query('delete from sample_data_batches where user_id = $1', [userId])
    await client.query('delete from app_users where id = $1', [userId])

    return { appUserDeleted: true }
  })
}

async function deleteAuth0User(auth0Sub) {
  const domain = serverAuth0Domain()
  const token = await getManagementAccessToken(domain)
  const response = await fetch(`https://${domain}/api/v2/users/${encodeURIComponent(auth0Sub)}`, {
    method: 'DELETE',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  if (response.ok || response.status === 404) return

  const error = new Error('BenchOS could not complete Auth0 account deletion. Please try again or contact support.')
  error.statusCode = 500
  throw error
}

async function getManagementAccessToken(domain) {
  const clientId = requiredEnv('AUTH0_MANAGEMENT_CLIENT_ID')
  const clientSecret = requiredEnv('AUTH0_MANAGEMENT_CLIENT_SECRET')
  const audience = process.env.AUTH0_MANAGEMENT_AUDIENCE || `https://${domain}/api/v2/`
  const response = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      audience,
    }),
  })

  if (!response.ok) {
    const error = new Error('Auth0 Management API credentials are not valid for account deletion.')
    error.statusCode = 500
    throw error
  }

  const body = await response.json()
  if (typeof body.access_token !== 'string' || !body.access_token) {
    const error = new Error('Auth0 Management API did not return an access token.')
    error.statusCode = 500
    throw error
  }
  return body.access_token
}

function serverAuth0Domain() {
  return requiredEnv('AUTH0_DOMAIN').replace(/^https?:\/\//, '')
}

function requiredEnv(name) {
  const value = process.env[name]
  if (!value) {
    const error = new Error(`${name} is required for account deletion.`)
    error.statusCode = 500
    throw error
  }
  return value
}
