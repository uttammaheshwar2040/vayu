import type { SessionRecord } from './types'

export type SessionStore = {
  get: (sessionId: string) => Promise<SessionRecord | null>
  set: (session: SessionRecord) => Promise<void>
  remove: (sessionId: string) => Promise<void>
}

const memoryStore = new Map<string, SessionRecord>()

export const sessionStore: SessionStore = {
  async get(sessionId) {
    return memoryStore.get(sessionId) ?? null
  },
  async set(session) {
    memoryStore.set(session.sessionId, session)
  },
  async remove(sessionId) {
    memoryStore.delete(sessionId)
  },
}

export function getSessionStoreWarning() {
  return 'Using in-memory session storage. Configure a persistent encrypted database/session adapter before production use on Vercel.'
}
