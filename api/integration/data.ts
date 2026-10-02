import { timeRanges, type TimeRange } from '../../src/data/demoData'
import { getCreatorData } from '../_lib/integration-service'
import type { ApiRequest, ApiResponse } from '../_lib/http'
import { readRange, sendJson } from '../_lib/http'

function parseRange(range: string | undefined): TimeRange {
  if (!range) {
    return '28D'
  }

  const matched = timeRanges.find((supported) => supported === range)
  return matched ?? '28D'
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  const range = parseRange(readRange(req.query))
  const rawCookie = typeof req.headers.cookie === 'string' ? req.headers.cookie : undefined

  try {
    const payload = await getCreatorData(range, rawCookie)
    sendJson(res, 200, payload)
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Failed to load integration data',
      source: 'unavailable',
    })
  }
}
