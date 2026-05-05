export type BenchApiTokenProvider = () => Promise<string>

export async function benchApi<T>(
  getAccessToken: BenchApiTokenProvider,
  functionName: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken()
  const response = await fetch(`/.netlify/functions/${functionName}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  })

  const body = await readBody(response)
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body ? String(body.error) : `Request failed with status ${response.status}.`
    throw new Error(message)
  }
  return body as T
}

export function jsonBody(value: unknown) {
  return JSON.stringify(value)
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
