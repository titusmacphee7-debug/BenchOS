import { requireAuth } from './_shared/auth.mjs'
import { bootstrapWorkspace } from './_shared/onboardingStore.mjs'
import { handleError, json, methodNotAllowed } from './_shared/responses.mjs'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed('POST')
  try {
    const claims = await requireAuth(event)
    return json(200, await bootstrapWorkspace(claims))
  } catch (error) {
    return handleError(error)
  }
}
