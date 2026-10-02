import { createSessionFromCode } from '../_lib/integration-service'
import { clearOAuthStateCookie, readOAuthStateFromCookie } from '../_lib/session'
import type { ApiRequest, ApiResponse } from '../_lib/http'
import { sendJson } from '../_lib/http'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  const state = Array.isArray(req.query?.state) ? req.query?.state[0] : req.query?.state
  const code = Array.isArray(req.query?.code) ? req.query?.code[0] : req.query?.code
  const cookieState = readOAuthStateFromCookie(typeof req.headers.cookie === 'string' ? req.headers.cookie : undefined)

  if (!state || !code || !cookieState || state !== cookieState) {
    res.setHeader('Set-Cookie', clearOAuthStateCookie())
    sendJson(res, 400, {
      error: 'Invalid OAuth callback state. Please retry Google connect from Settings.',
    })
    return
  }

  try {
    const { setCookie } = await createSessionFromCode(code)
    res.setHeader('Set-Cookie', [clearOAuthStateCookie(), setCookie])
    res.redirect(302, '/settings?connected=1')
  } catch (error) {
    res.setHeader('Set-Cookie', clearOAuthStateCookie())
    sendJson(res, 502, {
      error: error instanceof Error ? error.message : 'Google OAuth callback failed',
    })
  }
}
