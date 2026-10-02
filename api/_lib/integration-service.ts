import {
  demoNotice,
  featuredVideos,
  metricsByRange,
  recentUploads,
  trendsByRange,
  type TimeRange,
} from '../../src/data/demoData'
import { exchangeCodeForTokens, refreshAccessToken } from './google-oauth'
import { isOAuthConfigured } from './env'
import {
  buildSessionCookie,
  clearSessionCookie,
  decryptSecret,
  encryptSecret,
  generateOpaqueId,
  readSessionIdFromCookie,
} from './session'
import { getSessionStoreWarning, sessionStore } from './session-store'
import { fetchAnalyticsSnapshot } from './youtube-analytics'
import { fetchChannelSnapshot, fetchRecentVideos } from './youtube-data'
import type { CreatorDataPayload, SessionRecord } from './types'

function nowIso() {
  return new Date().toISOString()
}

export function buildDemoPayload(range: TimeRange, source: 'demo' | 'authorization_required' | 'unavailable'): CreatorDataPayload {
  const metrics = metricsByRange[range]
  return {
    range,
    source,
    sourceLabel: source === 'demo' ? 'Demo data' : source === 'authorization_required' ? 'Authorization required' : 'Live data unavailable',
    sourceNotice:
      source === 'demo'
        ? demoNotice
        : source === 'authorization_required'
          ? 'Connect Google/YouTube to load private analytics and channel metrics.'
          : 'Live API sync is currently unavailable. Showing demo data fallback.',
    updatedAt: null,
    connection: {
      connected: false,
      oauthConfigured: isOAuthConfigured(),
      channelTitle: null,
      channelId: null,
      lastSyncedAt: null,
      syncStatus: source === 'unavailable' ? 'error' : 'demo',
      errorMessage: source === 'unavailable' ? getSessionStoreWarning() : null,
    },
    metrics: {
      subscribers: metrics.subscribers,
      views: metrics.views,
      watchTimeHours: metrics.watchTimeHours,
      youtubeRevenue: metrics.youtubeRevenue,
      sponsorshipRevenue: metrics.sponsorshipRevenue,
    },
    trends: trendsByRange[range],
    featuredVideos,
    recentUploads,
    monetization: {
      revenueAvailability: 'available',
      revenueUnavailableReason: null,
    },
  }
}

function mergeSession(current: SessionRecord, patch: Partial<SessionRecord>): SessionRecord {
  return {
    ...current,
    ...patch,
    updatedAt: nowIso(),
  }
}

export async function createSessionFromCode(code: string) {
  const tokenResponse = await exchangeCodeForTokens(code)

  const session: SessionRecord = {
    sessionId: generateOpaqueId(),
    channelId: null,
    channelTitle: null,
    accessToken: tokenResponse.access_token,
    refreshTokenEncrypted: tokenResponse.refresh_token ? encryptSecret(tokenResponse.refresh_token) : null,
    accessTokenExpiresAt: Date.now() + tokenResponse.expires_in * 1000,
    scope: tokenResponse.scope,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    lastSyncedAt: null,
    lastError: null,
  }

  await sessionStore.set(session)

  return {
    session,
    setCookie: buildSessionCookie(session.sessionId),
  }
}

export async function destroySession(rawCookie: string | undefined) {
  const sessionId = readSessionIdFromCookie(rawCookie)
  if (sessionId) {
    await sessionStore.remove(sessionId)
  }

  return clearSessionCookie()
}

export async function resolveSession(rawCookie: string | undefined) {
  const sessionId = readSessionIdFromCookie(rawCookie)
  if (!sessionId) {
    return null
  }

  return sessionStore.get(sessionId)
}

async function ensureAccessToken(session: SessionRecord) {
  const stillValid = session.accessToken && session.accessTokenExpiresAt && session.accessTokenExpiresAt > Date.now() + 20_000
  if (stillValid) {
    return { accessToken: session.accessToken, session }
  }

  if (!session.refreshTokenEncrypted) {
    throw new Error('Missing refresh token. Reconnect Google account to continue.')
  }

  const refreshToken = decryptSecret(session.refreshTokenEncrypted)
  const refreshed = await refreshAccessToken(refreshToken)

  const updatedSession = mergeSession(session, {
    accessToken: refreshed.access_token,
    accessTokenExpiresAt: Date.now() + refreshed.expires_in * 1000,
    refreshTokenEncrypted: refreshed.refresh_token
      ? encryptSecret(refreshed.refresh_token)
      : session.refreshTokenEncrypted,
    scope: refreshed.scope,
    lastError: null,
  })

  await sessionStore.set(updatedSession)

  return {
    accessToken: refreshed.access_token,
    session: updatedSession,
  }
}

export async function getCreatorData(range: TimeRange, rawCookie: string | undefined): Promise<CreatorDataPayload> {
  if (!isOAuthConfigured()) {
    return buildDemoPayload(range, 'demo')
  }

  const session = await resolveSession(rawCookie)
  if (!session) {
    return buildDemoPayload(range, 'authorization_required')
  }

  try {
    const { accessToken, session: refreshedSession } = await ensureAccessToken(session)
    const [channel, videos, analytics] = await Promise.all([
      fetchChannelSnapshot(accessToken),
      fetchRecentVideos(accessToken, 8),
      fetchAnalyticsSnapshot(accessToken, range),
    ])

    const updatedSession = mergeSession(refreshedSession, {
      channelId: channel.channelId,
      channelTitle: channel.channelTitle,
      lastSyncedAt: nowIso(),
      lastError: null,
    })

    await sessionStore.set(updatedSession)

    const fallbackVideos = videos.length > 0 ? videos : recentUploads

    return {
      range,
      source: 'live',
      sourceLabel: 'Live YouTube data',
      sourceNotice:
        'Live metrics loaded from YouTube Data API and YouTube Analytics API. Sponsorship income is not provided by YouTube APIs and must be managed separately.',
      updatedAt: updatedSession.lastSyncedAt,
      connection: {
        connected: true,
        oauthConfigured: true,
        channelTitle: channel.channelTitle,
        channelId: channel.channelId,
        lastSyncedAt: updatedSession.lastSyncedAt,
        syncStatus: 'ok',
        errorMessage: null,
      },
      metrics: {
        subscribers: channel.subscribers,
        views: analytics.views > 0 ? analytics.views : channel.views,
        watchTimeHours: analytics.watchTimeHours,
        youtubeRevenue: analytics.youtubeRevenue,
        sponsorshipRevenue: null,
      },
      trends: analytics.points,
      featuredVideos: fallbackVideos.slice(0, 3),
      recentUploads: fallbackVideos,
      monetization: {
        revenueAvailability: analytics.youtubeRevenue === null ? 'unavailable' : 'available',
        revenueUnavailableReason: analytics.revenueUnavailableReason,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Live API sync failed'
    const failedSession = mergeSession(session, { lastError: message })
    await sessionStore.set(failedSession)

    const demoPayload = buildDemoPayload(range, 'unavailable')
    return {
      ...demoPayload,
      connection: {
        ...demoPayload.connection,
        connected: true,
        oauthConfigured: true,
        channelTitle: session.channelTitle,
        channelId: session.channelId,
        lastSyncedAt: session.lastSyncedAt,
        syncStatus: 'error',
        errorMessage: message,
      },
    }
  }
}
