import type { TimeRange, TrendPoint, VideoItem } from '../../src/data/demoData'

export type SourceStatus = 'demo' | 'live' | 'unavailable' | 'authorization_required'

export type SessionRecord = {
  sessionId: string
  channelId: string | null
  channelTitle: string | null
  accessToken: string | null
  refreshTokenEncrypted: string | null
  accessTokenExpiresAt: number | null
  scope: string
  createdAt: string
  updatedAt: string
  lastSyncedAt: string | null
  lastError: string | null
}

export type YoutubeChannelSnapshot = {
  channelId: string
  channelTitle: string
  subscribers: number
  views: number
}

export type YoutubeVideoSnapshot = {
  title: string
  topic: string
  published: string
  views: number
  watchTimeHours: number
  cta: string
}

export type YoutubeAnalyticsPoint = TrendPoint

export type YoutubeAnalyticsSnapshot = {
  points: YoutubeAnalyticsPoint[]
  watchTimeHours: number
  views: number
  subscribers: number
  youtubeRevenue: number | null
  revenueUnavailableReason: string | null
}

export type CreatorDataPayload = {
  range: TimeRange
  source: SourceStatus
  sourceLabel: string
  sourceNotice: string
  updatedAt: string | null
  connection: {
    connected: boolean
    oauthConfigured: boolean
    channelTitle: string | null
    channelId: string | null
    lastSyncedAt: string | null
    syncStatus: 'demo' | 'ok' | 'error' | 'pending'
    errorMessage: string | null
  }
  metrics: {
    subscribers: number
    views: number
    watchTimeHours: number
    youtubeRevenue: number | null
    sponsorshipRevenue: number | null
  }
  trends: YoutubeAnalyticsPoint[]
  featuredVideos: VideoItem[]
  recentUploads: VideoItem[]
  monetization: {
    revenueAvailability: 'available' | 'unavailable'
    revenueUnavailableReason: string | null
  }
}
