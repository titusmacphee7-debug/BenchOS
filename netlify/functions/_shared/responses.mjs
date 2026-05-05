export function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
    body: JSON.stringify(body),
  }
}

export function methodNotAllowed(allowed) {
  return json(405, { error: `Method not allowed. Use ${allowed}.` })
}

export function readJson(event) {
  if (!event.body) return {}
  try {
    return JSON.parse(event.body)
  } catch {
    const error = new Error('Request body must be valid JSON.')
    error.statusCode = 400
    throw error
  }
}

export function handleError(error) {
  const statusCode = Number(error?.statusCode) || 500
  const message = error instanceof Error ? error.message : 'Unexpected server error.'
  return json(statusCode, { error: message })
}
