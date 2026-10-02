import type { TimeRange, TrendPoint, VideoItem } from '../data/demoData'

export type SourceStatus = 'demo' | 'live' | 'unavailable' | 'authorization_required'

export type SyncStatus = 'demo' | 'ok' | 'error' | 'pending'

export type RevenueAvailability = 'available' | 'unavailable'

export type IntegrationConnection = {
  connected: boolean
  oauthConfigured: boolean
  channelTitle: string | null
  channelId: string | null
  lastSyncedAt: string | null
  syncStatus: SyncStatus
  errorMessage: string | null
}

export type CreatorMetrics = {
  subscribers: number
  views: number
  watchTimeHours: number
  youtubeRevenue: number | null
  sponsorshipRevenue: number | null
}

export type CreatorDataResponse = {
  range: TimeRange
  source: SourceStatus
  sourceLabel: string
  sourceNotice: string
  updatedAt: string | null
  connection: IntegrationConnection
  metrics: CreatorMetrics
  trends: TrendPoint[]
  featuredVideos: VideoItem[]
  recentUploads: VideoItem[]
  monetization: {
    revenueAvailability: RevenueAvailability
    revenueUnavailableReason: string | null
  }
}
