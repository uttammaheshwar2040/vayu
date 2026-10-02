import { buildGoogleAuthUrl } from '../_lib/google-oauth'
import { getMissingOAuthVariables, isOAuthConfigured } from '../_lib/env'
import { generateOpaqueId, buildOAuthStateCookie } from '../_lib/session'
import type { ApiRequest, ApiResponse } from '../_lib/http'
import { sendJson } from '../_lib/http'

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  if (!isOAuthConfigured()) {
    sendJson(res, 503, {
      error: 'OAuth environment variables are not configured',
      missingVariables: getMissingOAuthVariables(),
    })
    return
  }

  const state = generateOpaqueId()
  res.setHeader('Set-Cookie', buildOAuthStateCookie(state))
  res.redirect(302, buildGoogleAuthUrl(state))
}
