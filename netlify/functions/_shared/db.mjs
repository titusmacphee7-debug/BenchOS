import { getDatabase } from '@netlify/database'

function databasePool() {
  try {
    return getDatabase().pool
  } catch (caught) {
    const error = new Error('Netlify Database is not initialized for this site. Run the Netlify Database setup flow, then redeploy so migrations can run.')
    error.statusCode = 500
    error.cause = caught
    throw error
  }
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
