import { getEnv } from './env'

const googleTokenEndpoint = 'https://oauth2.googleapis.com/token'
const googleAuthEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth'

const scopes = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
]

type TokenResponse = {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope: string
  token_type: 'Bearer'
}

function getOAuthConfig() {
  const clientId = getEnv('GOOGLE_CLIENT_ID')
  const clientSecret = getEnv('GOOGLE_CLIENT_SECRET')
  const redirectUri = getEnv('GOOGLE_OAUTH_REDIRECT_URI')

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google OAuth environment variables are incomplete')
  }

  return { clientId, clientSecret, redirectUri }
}

export function buildGoogleAuthUrl(state: string) {
  const { clientId, redirectUri } = getOAuthConfig()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'consent',
    scope: scopes.join(' '),
    state,
  })

  return `${googleAuthEndpoint}?${params.toString()}`
}

async function postTokenRequest(params: URLSearchParams) {
  const response = await fetch(googleTokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Google token exchange failed: ${response.status} ${errorText}`)
  }

  return (await response.json()) as TokenResponse
}

export async function exchangeCodeForTokens(code: string) {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig()

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  return postTokenRequest(params)
}

export async function refreshAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = getOAuthConfig()

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  return postTokenRequest(params)
}

export function getRequestedScopes() {
  return [...scopes]
}
