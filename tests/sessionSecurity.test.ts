import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildSessionCookie,
  buildSignedSessionValue,
  clearSessionCookie,
  encryptSecret,
  decryptSecret,
  parseSignedSessionValue,
  readSessionIdFromCookie,
} from '../api/_lib/session'

process.env.SESSION_SECRET = 'unit-test-session-secret-keep-private'

test('signed session values reject tampering', () => {
  const signedValue = buildSignedSessionValue('session-id-123')
  assert.equal(parseSignedSessionValue(signedValue), 'session-id-123')

  const tampered = `${signedValue}tampered`
  assert.equal(parseSignedSessionValue(tampered), null)
})

test('session cookie parser reads valid cookie and ignores clears', () => {
  const sessionCookie = buildSessionCookie('session-id-abc')
  const combinedCookie = `${sessionCookie}; another=value`

  assert.equal(readSessionIdFromCookie(combinedCookie), 'session-id-abc')

  const cleared = clearSessionCookie()
  assert.equal(readSessionIdFromCookie(cleared), null)
})

test('refresh token encryption is reversible with same secret', () => {
  const token = 'refresh-token-for-tests'
  const encrypted = encryptSecret(token)
  assert.notEqual(encrypted, token)
  assert.equal(decryptSecret(encrypted), token)
})
