import { requireAuth } from './_shared/auth.mjs'
import { completeOnboarding } from './_shared/onboardingStore.mjs'
import { handleError, json, methodNotAllowed, readJson } from './_shared/responses.mjs'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed('POST')
  try {
    const claims = await requireAuth(event)
    return json(200, await completeOnboarding(claims, readJson(event)))
  } catch (error) {
    return handleError(error)
  }
}
