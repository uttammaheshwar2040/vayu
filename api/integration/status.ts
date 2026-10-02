import { isOAuthConfigured } from '../_lib/env'
import { resolveSession } from '../_lib/integration-service'
import type { ApiRequest, ApiResponse } from '../_lib/http'
import { sendJson } from '../_lib/http'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  const rawCookie = typeof req.headers.cookie === 'string' ? req.headers.cookie : undefined
  const session = await resolveSession(rawCookie)

  sendJson(res, 200, {
    oauthConfigured: isOAuthConfigured(),
    connected: Boolean(session),
    channelId: session?.channelId ?? null,
    channelTitle: session?.channelTitle ?? null,
    lastSyncedAt: session?.lastSyncedAt ?? null,
    syncStatus: session?.lastError ? 'error' : session ? 'ok' : 'pending',
    errorMessage: session?.lastError ?? null,
  })
}
