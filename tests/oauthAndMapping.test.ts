import assert from 'node:assert/strict'
import test from 'node:test'
import { buildGoogleAuthUrl, getRequestedScopes } from '../api/_lib/google-oauth'
import { buildDemoPayload } from '../api/_lib/integration-service'

process.env.GOOGLE_CLIENT_ID = 'test-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
process.env.GOOGLE_OAUTH_REDIRECT_URI = 'http://localhost:3000/api/auth/callback'
process.env.SESSION_SECRET = 'unit-test-session-secret-keep-private'

test('google auth URL includes state and required YouTube scopes', () => {
  const state = 'oauth-state-1'
  const url = new URL(buildGoogleAuthUrl(state))

  assert.equal(url.origin, 'https://accounts.google.com')
  assert.equal(url.searchParams.get('state'), state)
  assert.equal(url.searchParams.get('redirect_uri'), process.env.GOOGLE_OAUTH_REDIRECT_URI)

  const scope = url.searchParams.get('scope') ?? ''
  for (const requiredScope of getRequestedScopes()) {
    assert.equal(scope.includes(requiredScope), true)
  }
})

test('demo payload mapping stays explicit for unavailable/auth-required states', () => {
  const unavailable = buildDemoPayload('28D', 'unavailable')
  assert.equal(unavailable.source, 'unavailable')
  assert.equal(unavailable.connection.syncStatus, 'error')

  const authRequired = buildDemoPayload('28D', 'authorization_required')
  assert.equal(authRequired.source, 'authorization_required')
  assert.equal(authRequired.connection.connected, false)
})
