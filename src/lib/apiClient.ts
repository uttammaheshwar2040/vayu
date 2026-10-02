import type { TimeRange } from '../data/demoData'
import type { CreatorDataResponse } from '../types/integration'

async function requestJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

export async function fetchCreatorData(range: TimeRange) {
  const encodedRange = encodeURIComponent(range)
  return requestJson<CreatorDataResponse>(`/api/integration/data?range=${encodedRange}`)
}

export async function disconnectGoogleAccount() {
  return requestJson<{ disconnected: boolean }>('/api/auth/disconnect', {
    method: 'POST',
  })
}
