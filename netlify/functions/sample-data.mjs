import { requireAuth } from './_shared/auth.mjs'
import { createSampleBatch, deleteSampleBatch } from './_shared/onboardingStore.mjs'
import { handleError, json, methodNotAllowed, readJson } from './_shared/responses.mjs'

export const handler = async (event) => {
  if (!['POST', 'DELETE'].includes(event.httpMethod)) return methodNotAllowed('POST or DELETE')
  try {
    const claims = await requireAuth(event)
    const payload = readJson(event)
    if (event.httpMethod === 'POST') return json(200, await createSampleBatch(claims, payload))
    return json(200, await deleteSampleBatch(claims, payload))
  } catch (error) {
    return handleError(error)
  }
}
