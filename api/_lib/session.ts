import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto'
import { getEnv } from './env'

const sessionCookieName = 'vayu_session'
const oauthStateCookieName = 'vayu_oauth_state'

function toBase64Url(value: Buffer) {
  return value.toString('base64url')
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url')
}

function getSessionSecret() {
  const secret = getEnv('SESSION_SECRET')
  if (!secret) {
    throw new Error('SESSION_SECRET is required for secure sessions')
  }

  return secret
}

export function generateOpaqueId() {
  return toBase64Url(randomBytes(24))
}

function signValue(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url')
}

export function buildSignedSessionValue(sessionId: string) {
  const signature = signValue(sessionId)
  return `${sessionId}.${signature}`
}

export function parseSignedSessionValue(value: string | null) {
  if (!value) {
    return null
  }

  const [sessionId, signature] = value.split('.')
  if (!sessionId || !signature) {
    return null
  }

  if (signValue(sessionId) !== signature) {
    return null
  }

  return sessionId
}

function buildCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`
}

export function buildSessionCookie(sessionId: string) {
  return buildCookie(sessionCookieName, buildSignedSessionValue(sessionId), 60 * 60 * 24 * 30)
}

export function clearSessionCookie() {
  return buildCookie(sessionCookieName, '', 0)
}

export function buildOAuthStateCookie(state: string) {
  return buildCookie(oauthStateCookieName, state, 60 * 10)
}

export function clearOAuthStateCookie() {
  return buildCookie(oauthStateCookieName, '', 0)
}

export function readCookie(rawCookie: string | undefined, name: string) {
  if (!rawCookie) {
    return null
  }

  const values = rawCookie.split(';').map((part) => part.trim())
  for (const value of values) {
    if (value.startsWith(`${name}=`)) {
      return value.slice(name.length + 1)
    }
  }

  return null
}

export function readSessionIdFromCookie(rawCookie: string | undefined) {
  return parseSignedSessionValue(readCookie(rawCookie, sessionCookieName))
}

export function readOAuthStateFromCookie(rawCookie: string | undefined) {
  return readCookie(rawCookie, oauthStateCookieName)
}

function getEncryptionKey() {
  const secret = createHmac('sha256', getSessionSecret()).update('refresh-token').digest()
  return secret.subarray(0, 32)
}

export function encryptSecret(secretValue: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(secretValue, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${toBase64Url(iv)}.${toBase64Url(tag)}.${toBase64Url(encrypted)}`
}

export function decryptSecret(encryptedValue: string) {
  const [ivEncoded, tagEncoded, payloadEncoded] = encryptedValue.split('.')
  if (!ivEncoded || !tagEncoded || !payloadEncoded) {
    throw new Error('Invalid encrypted payload format')
  }

  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), fromBase64Url(ivEncoded))
  decipher.setAuthTag(fromBase64Url(tagEncoded))
  const decrypted = Buffer.concat([
    decipher.update(fromBase64Url(payloadEncoded)),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}
