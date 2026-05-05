import { requireAuth } from './_shared/auth.mjs'
import { getOnboarding, saveOnboarding } from './_shared/onboardingStore.mjs'
import { handleError, json, methodNotAllowed, readJson } from './_shared/responses.mjs'

export const handler = async (event) => {
  if (!['GET', 'PUT'].includes(event.httpMethod)) return methodNotAllowed('GET or PUT')
  try {
    const claims = await requireAuth(event)
    if (event.httpMethod === 'GET') return json(200, await getOnboarding(claims))
    return json(200, await saveOnboarding(claims, readJson(event)))
  } catch (error) {
    return handleError(error)
  }
}
