import { requireAuth } from './_shared/auth.mjs'
import { getBenchXpState, saveBenchXpAction } from './_shared/benchXpStore.mjs'
import { handleError, json, methodNotAllowed, readJson } from './_shared/responses.mjs'

export const handler = async (event) => {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') return methodNotAllowed('GET or POST')

  try {
    const claims = await requireAuth(event)
    if (event.httpMethod === 'GET') return json(200, await getBenchXpState(claims))

    return json(200, await saveBenchXpAction(claims, readJson(event)))
  } catch (error) {
    return handleError(error)
  }
}
