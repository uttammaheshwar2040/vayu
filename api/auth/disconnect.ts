import { destroySession } from '../_lib/integration-service'
import type { ApiRequest, ApiResponse } from '../_lib/http'
import { sendJson } from '../_lib/http'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  const rawCookie = typeof req.headers.cookie === 'string' ? req.headers.cookie : undefined
  const clearCookie = await destroySession(rawCookie)
  res.setHeader('Set-Cookie', clearCookie)

  sendJson(res, 200, {
    disconnected: true,
  })
}
