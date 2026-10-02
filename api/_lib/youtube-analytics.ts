import type { TimeRange } from '../../src/data/demoData'
import type { YoutubeAnalyticsSnapshot } from './types'

const analyticsBaseUrl = 'https://youtubeanalytics.googleapis.com/v2/reports'

const rangeDays: Record<TimeRange, number> = {
  '7D': 7,
  '28D': 28,
  '90D': 90,
  '365D': 365,
}

type AnalyticsResponse = {
  rows?: Array<[string, number, number, number, number?]>
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function dayLabel(dateString: string, range: TimeRange) {
  const date = new Date(dateString)
  if (range === '7D' || range === '28D') {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  if (range === '90D') {
    return date.toLocaleDateString('en-US', { month: 'short' })
  }

  return `Q${Math.floor(date.getMonth() / 3) + 1}`
}

async function analyticsRequest(accessToken: string, metrics: string, range: TimeRange) {
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - (rangeDays[range] - 1))

  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    metrics,
    dimensions: 'day',
    sort: 'day',
  })

  const response = await fetch(`${analyticsBaseUrl}?${params.toString()}`, {
    headers: {
      Authorization: ['Bearer', accessToken].join(' '),
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`YouTube Analytics API error ${response.status}: ${body}`)
  }

  return (await response.json()) as AnalyticsResponse
}

export async function fetchAnalyticsSnapshot(accessToken: string, range: TimeRange): Promise<YoutubeAnalyticsSnapshot> {
  const baseMetrics = 'views,estimatedMinutesWatched,subscribersGained'
  const baseResponse = await analyticsRequest(accessToken, baseMetrics, range)

  let revenueByDate = new Map<string, number>()
  let revenueUnavailableReason: string | null = null

  try {
    const revenueResponse = await analyticsRequest(accessToken, 'estimatedRevenue', range)
    revenueByDate = new Map(
      (revenueResponse.rows ?? []).map((row) => [row[0], Number(row[1] ?? 0)]),
    )
  } catch (error) {
    revenueUnavailableReason =
      error instanceof Error
        ? 'Revenue metric unavailable. This can happen if monetization is not enabled or scope access is restricted.'
        : 'Revenue metric unavailable for this channel.'
  }

  const points = (baseResponse.rows ?? []).map((row) => {
    const date = row[0]
    const views = Number(row[1] ?? 0)
    const watchTimeHours = Math.round((Number(row[2] ?? 0) / 60) * 100) / 100
    const subscribers = Number(row[3] ?? 0)
    const revenue = revenueByDate.get(date) ?? 0

    return {
      label: dayLabel(date, range),
      views,
      watchTimeHours,
      subscribers,
      revenue,
    }
  })

  const totals = points.reduce(
    (accumulator, point) => ({
      views: accumulator.views + point.views,
      watchTimeHours: accumulator.watchTimeHours + point.watchTimeHours,
      subscribers: accumulator.subscribers + point.subscribers,
      revenue: accumulator.revenue + point.revenue,
    }),
    { views: 0, watchTimeHours: 0, subscribers: 0, revenue: 0 },
  )

  const revenueAvailable = revenueByDate.size > 0

  return {
    points,
    views: totals.views,
    watchTimeHours: Math.round(totals.watchTimeHours * 100) / 100,
    subscribers: totals.subscribers,
    youtubeRevenue: revenueAvailable ? Math.round(totals.revenue * 100) / 100 : null,
    revenueUnavailableReason,
  }
}
