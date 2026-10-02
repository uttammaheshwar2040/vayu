import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import DataTable from './components/DataTable'
import SectionHeader from './components/SectionHeader'
import Sidebar, { type NavSection } from './components/Sidebar'
import StatCard from './components/StatCard'
import TrendChart from './components/TrendChart'
import VideoCard from './components/VideoCard'
import {
  channelBranding,
  demoNotice,
  featuredVideos,
  metricsByRange,
  recentUploads,
  timeRanges,
  trendsByRange,
  type TimeRange,
} from './data/demoData'
import { disconnectGoogleAccount, fetchCreatorData } from './lib/apiClient'
import { sourceBadgeLabel, shouldUseDemoFallback } from './lib/sourceSelection'
import type { CreatorDataResponse } from './types/integration'
import './App.css'

function currency(value: number | null) {
  if (value === null) {
    return 'Not available'
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

const sectionRoutes: Record<NavSection, string> = {
  Dashboard: '/dashboard',
  Analytics: '/analytics',
  Monetization: '/monetization',
  Settings: '/settings',
}

type DashboardScreenProps = {
  activeSection: NavSection
  onSelectSection: (section: NavSection) => void
}

function buildLocalDemoResponse(range: TimeRange): CreatorDataResponse {
  return {
    range,
    source: 'demo',
    sourceLabel: 'Demo data',
    sourceNotice: demoNotice,
    updatedAt: null,
    connection: {
      connected: false,
      oauthConfigured: false,
      channelTitle: null,
      channelId: null,
      lastSyncedAt: null,
      syncStatus: 'demo',
      errorMessage: null,
    },
    metrics: {
      ...metricsByRange[range],
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

function DashboardScreen({ activeSection, onSelectSection }: DashboardScreenProps) {
  const [activeRange, setActiveRange] = useState<TimeRange>('28D')
  const [data, setData] = useState<CreatorDataResponse>(() => buildLocalDemoResponse('28D'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setIsLoading(true)
      try {
        const response = await fetchCreatorData(activeRange)
        if (!cancelled) {
          setData(response)
        }
      } catch {
        if (!cancelled) {
          setData(buildLocalDemoResponse(activeRange))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [activeRange])

  const displayData = shouldUseDemoFallback(data.source) ? buildLocalDemoResponse(activeRange) : data
  const combinedRevenue = (displayData.metrics.youtubeRevenue ?? 0) + (displayData.metrics.sponsorshipRevenue ?? 0)

  const revenueBreakdown = useMemo(
    () => [
      {
        label: 'YouTube revenue',
        value: displayData.metrics.youtubeRevenue,
      },
      {
        label: 'Sponsorship revenue (manual/demo only)',
        value: displayData.metrics.sponsorshipRevenue,
      },
    ],
    [displayData.metrics.sponsorshipRevenue, displayData.metrics.youtubeRevenue],
  )

  const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + (item.value ?? 0), 0)

  return (
    <section className="dashboard" aria-label="Private dashboard prototype">
      <Sidebar active={activeSection} onSelect={onSelectSection} />
      <div className="dashboard__content">
        <div className="toolbar">
          <h2>{activeSection}</h2>
          <div className="toolbar__status-group">
            <span className={`source-pill source-pill--${data.source}`}>{sourceBadgeLabel(data.source)}</span>
            <div className="range-picker" role="radiogroup" aria-label="Time range">
              {timeRanges.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setActiveRange(range)}
                  className={`range-picker__btn${activeRange === range ? ' range-picker__btn--active' : ''}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="notice">{data.sourceNotice}</p>
        {data.connection.errorMessage && <p className="notice notice--error">{data.connection.errorMessage}</p>}

        {activeSection === 'Dashboard' && (
          <>
            <section className="stats-grid">
              <StatCard
                label="Subscribers"
                value={displayData.metrics.subscribers.toLocaleString()}
                helper={`${activeRange} ${displayData.source}`}
              />
              <StatCard label="Views" value={displayData.metrics.views.toLocaleString()} helper={`${activeRange} ${displayData.source}`} />
              <StatCard
                label="Watch Time"
                value={`${displayData.metrics.watchTimeHours.toLocaleString()} hrs`}
                helper={`${activeRange} ${displayData.source}`}
              />
              <StatCard
                label="Estimated YouTube Revenue"
                value={currency(displayData.metrics.youtubeRevenue)}
                helper={
                  displayData.metrics.youtubeRevenue === null
                    ? 'Unavailable from API for this account/range'
                    : `${activeRange} ${displayData.source}`
                }
              />
              <StatCard
                label="Sponsorship Revenue"
                value={currency(displayData.metrics.sponsorshipRevenue)}
                helper="Manual/demo-only (not from YouTube API)"
              />
              <StatCard label="Combined Revenue" value={currency(combinedRevenue)} helper="Includes sponsorship manual/demo amount" />
            </section>

            <SectionHeader
              title="Content Insights"
              subtitle="Featured content cards and recent uploads list for planning next videos."
            />
            <section className="video-grid">
              {displayData.featuredVideos.map((video) => (
                <VideoCard key={video.title} video={video} />
              ))}
            </section>
            <DataTable rows={displayData.recentUploads} />
          </>
        )}

        {activeSection === 'Analytics' && (
          <>
            <SectionHeader
              title="Analytics Trends"
              subtitle="Views, watch time, subscriber gains, and revenue trends from selected source."
            />
            <section className="trend-grid">
              <TrendChart title="Views Trend" points={displayData.trends.map((p) => ({ label: p.label, value: p.views }))} />
              <TrendChart
                title="Watch Time Trend"
                points={displayData.trends.map((p) => ({ label: p.label, value: p.watchTimeHours }))}
                unit=" hrs"
              />
              <TrendChart
                title="Subscribers Trend"
                points={displayData.trends.map((p) => ({ label: p.label, value: p.subscribers }))}
              />
              <TrendChart
                title="Revenue Trend"
                points={displayData.trends.map((p) => ({ label: p.label, value: p.revenue }))}
                unit=" USD"
              />
            </section>
          </>
        )}

        {activeSection === 'Monetization' && (
          <>
            <SectionHeader
              title="Monetization Overview"
              subtitle="YouTube API revenue and separate sponsorship tracking (manual/demo-only)."
            />
            <section className="stats-grid stats-grid--three">
              <StatCard
                label="YouTube Revenue"
                value={currency(displayData.metrics.youtubeRevenue)}
                helper={displayData.monetization.revenueAvailability === 'available' ? `${activeRange} ${displayData.source}` : 'Unavailable'}
              />
              <StatCard
                label="Sponsorships"
                value={currency(displayData.metrics.sponsorshipRevenue)}
                helper="Manual/demo-only source"
              />
              <StatCard label="Combined" value={currency(combinedRevenue)} helper={`${activeRange} ${displayData.source}`} />
            </section>
            {displayData.monetization.revenueUnavailableReason && (
              <p className="notice">{displayData.monetization.revenueUnavailableReason}</p>
            )}
            <section className="revenue-breakdown">
              {revenueBreakdown.map((source) => {
                const pct = totalRevenue ? ((source.value ?? 0) / totalRevenue) * 100 : 0
                return (
                  <article key={source.label} className="revenue-breakdown__item">
                    <div>
                      <p>{source.label}</p>
                      <strong>{currency(source.value)}</strong>
                    </div>
                    <div className="progress">
                      <div className="progress__fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span>{pct.toFixed(1)}%</span>
                  </article>
                )
              })}
            </section>
          </>
        )}

        {activeSection === 'Settings' && (
          <>
            <SectionHeader
              title="Settings & Integration"
              subtitle="Secure Google OAuth integration status for YouTube Data/Analytics APIs."
            />
            <section className="settings-grid">
              <article className="settings-card">
                <h4>Google / YouTube Connection</h4>
                <p>
                  Status: {data.connection.connected ? 'Connected' : 'Disconnected'} {isLoading ? '(syncing...)' : ''}
                </p>
                <p>OAuth configured: {data.connection.oauthConfigured ? 'Yes' : 'No (demo mode)'}</p>
                <p>Source: {sourceBadgeLabel(data.source)}</p>
                <p>Channel: {data.connection.channelTitle ?? 'Not connected'}</p>
                <p>Last synced: {data.connection.lastSyncedAt ? new Date(data.connection.lastSyncedAt).toLocaleString() : 'Never'}</p>
                <p>Sync status: {data.connection.syncStatus}</p>
                <div className="settings-card__actions">
                  <a className="primary-btn" href="/api/auth/google">
                    Connect Google / YouTube
                  </a>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={async () => {
                      await disconnectGoogleAccount()
                      setData(buildLocalDemoResponse(activeRange))
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              </article>
              <article className="settings-card">
                <h4>Monetization Data Rules</h4>
                <ul>
                  <li>YouTube API metrics: views, watch time, subscribers, and revenue-related reports where available.</li>
                  <li>Revenue can be unavailable if channel monetization/access is limited.</li>
                  <li>Sponsorship income is manual/demo-only unless a separate sponsorship integration is implemented.</li>
                  <li>Refresh tokens stay on server session storage and are never stored in browser localStorage.</li>
                </ul>
              </article>
            </section>
          </>
        )}
      </div>
    </section>
  )
}

function DashboardRoute({ section }: { section: NavSection }) {
  const navigate = useNavigate()

  return <DashboardScreen activeSection={section} onSelectSection={(nextSection) => navigate(sectionRoutes[nextSection])} />
}

function LandingPage() {
  return (
    <main className="landing">
      <p className="landing__eyebrow">Educational Creator Platform</p>
      <h1>
        {channelBranding.creatorName} / {channelBranding.channelName}
      </h1>
      <p className="landing__handle">YouTube: {channelBranding.channelHandle}</p>
      <p className="landing__tagline">{channelBranding.tagline}</p>
      <div className="notice notice--landing">
        Public landing page + private dashboard with secure OAuth scaffolding and demo fallback.
      </div>
      <Link to="/dashboard" className="primary-btn">
        Open Private Dashboard
      </Link>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardRoute section="Dashboard" />} />
      <Route path="/analytics" element={<DashboardRoute section="Analytics" />} />
      <Route path="/monetization" element={<DashboardRoute section="Monetization" />} />
      <Route path="/settings" element={<DashboardRoute section="Settings" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
