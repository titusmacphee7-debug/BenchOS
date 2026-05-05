import { getDatabase } from '@netlify/database'

function databasePool() {
  try {
    return getDatabase(databaseOptions()).pool
  } catch (caught) {
    const error = new Error('Netlify Database connection is not available to this Function runtime. Confirm the appbenchos Netlify project has Database enabled, then redeploy the published site.')
    error.statusCode = 500
    error.cause = caught
    throw error
  }
}

function databaseOptions() {
  const connectionString = envValue('NETLIFY_DB_URL') || envValue('NETLIFY_DATABASE_URL') || envValue('DATABASE_URL')
  return connectionString ? { connectionString } : {}
}

function envValue(name) {
  try {
    const netlifyEnv = globalThis.Netlify?.env
    const value = typeof netlifyEnv?.get === 'function' ? netlifyEnv.get(name) : undefined
    if (value) return value
  } catch {
    // Fall back to process.env below when Netlify.env is not available.
  }
  return process.env[name]
}

export async function transaction(callback) {
  const client = await databasePool().connect()
  try {
    await client.query('begin')
    const result = await callback(client)
    await client.query('commit')
    return result
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}
