import type { YoutubeChannelSnapshot, YoutubeVideoSnapshot } from './types'

const baseUrl = 'https://www.googleapis.com/youtube/v3'

type ChannelListResponse = {
  items?: Array<{
    id: string
    snippet?: { title?: string }
    statistics?: { subscriberCount?: string; viewCount?: string }
    contentDetails?: { relatedPlaylists?: { uploads?: string } }
  }>
}

type PlaylistItemsResponse = {
  items?: Array<{
    snippet?: {
      title?: string
      publishedAt?: string
      resourceId?: { videoId?: string }
    }
  }>
}

type VideoListResponse = {
  items?: Array<{
    id: string
    statistics?: { viewCount?: string }
    snippet?: { title?: string; categoryId?: string }
  }>
}

async function youtubeGet<T>(path: string, params: URLSearchParams, accessToken: string) {
  const requestUrl = `${baseUrl}${path}?${params.toString()}`
  const response = await fetch(requestUrl, {
    headers: {
      Authorization: ['Bearer', accessToken].join(' '),
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`YouTube Data API failed: ${response.status} ${errorText}`)
  }

  return (await response.json()) as T
}

function asNumber(value: string | undefined) {
  if (!value) {
    return 0
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function topicFromCategoryId(categoryId?: string) {
  if (!categoryId) {
    return 'Education'
  }

  return categoryId === '27' ? 'Education' : 'YouTube Content'
}

export async function fetchChannelSnapshot(accessToken: string): Promise<YoutubeChannelSnapshot> {
  const response = await youtubeGet<ChannelListResponse>(
    '/channels',
    new URLSearchParams({
      mine: 'true',
      part: 'id,snippet,statistics,contentDetails',
      maxResults: '1',
    }),
    accessToken,
  )

  const first = response.items?.[0]
  if (!first?.id) {
    throw new Error('Authorized account does not have a readable YouTube channel')
  }

  return {
    channelId: first.id,
    channelTitle: first.snippet?.title ?? 'YouTube Channel',
    subscribers: asNumber(first.statistics?.subscriberCount),
    views: asNumber(first.statistics?.viewCount),
  }
}

export async function fetchRecentVideos(accessToken: string, limit = 8): Promise<YoutubeVideoSnapshot[]> {
  const channels = await youtubeGet<ChannelListResponse>(
    '/channels',
    new URLSearchParams({
      mine: 'true',
      part: 'contentDetails',
      maxResults: '1',
    }),
    accessToken,
  )

  const uploadsPlaylistId = channels.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
  if (!uploadsPlaylistId) {
    return []
  }

  const playlistItems = await youtubeGet<PlaylistItemsResponse>(
    '/playlistItems',
    new URLSearchParams({
      part: 'snippet',
      playlistId: uploadsPlaylistId,
      maxResults: String(limit),
    }),
    accessToken,
  )

  const videoIds = playlistItems.items
    ?.map((item) => item.snippet?.resourceId?.videoId)
    .filter((videoId): videoId is string => Boolean(videoId))

  if (!videoIds || videoIds.length === 0) {
    return []
  }

  const videoStats = await youtubeGet<VideoListResponse>(
    '/videos',
    new URLSearchParams({
      part: 'snippet,statistics',
      id: videoIds.join(','),
      maxResults: String(limit),
    }),
    accessToken,
  )

  const statsById = new Map(videoStats.items?.map((item) => [item.id, item]) ?? [])

  return videoIds.map((videoId) => {
    const playlistItem = playlistItems.items?.find((item) => item.snippet?.resourceId?.videoId === videoId)
    const stat = statsById.get(videoId)
    const publishedAt = playlistItem?.snippet?.publishedAt
    return {
      title: stat?.snippet?.title ?? playlistItem?.snippet?.title ?? 'Untitled video',
      topic: topicFromCategoryId(stat?.snippet?.categoryId),
      published: publishedAt ? new Date(publishedAt).toLocaleDateString('en-IN') : 'Unknown',
      views: asNumber(stat?.statistics?.viewCount),
      watchTimeHours: 0,
      cta: 'Review performance in YouTube Studio for optimization ideas',
    }
  })
}
