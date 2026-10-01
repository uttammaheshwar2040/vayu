import { useMemo, useState } from 'react'
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
  integrationSteps,
  metricsByRange,
  recentUploads,
  timeRanges,
  trendsByRange,
  type TimeRange,
} from './data/demoData'
import './App.css'

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function App() {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<NavSection>('Dashboard')
  const [activeRange, setActiveRange] = useState<TimeRange>('28D')

  const metrics = metricsByRange[activeRange]
  const combinedRevenue = metrics.youtubeRevenue + metrics.sponsorshipRevenue
  const trends = trendsByRange[activeRange]

  const revenueBreakdown = useMemo(
    () => [
      {
        label: 'YouTube revenue',
        value: metrics.youtubeRevenue,
      },
      {
        label: 'Sponsorship revenue',
        value: metrics.sponsorshipRevenue,
      },
    ],
    [metrics.sponsorshipRevenue, metrics.youtubeRevenue],
  )

  const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + item.value, 0)

  return (
    <>
      <main className="landing">
        <p className="landing__eyebrow">Educational Creator Platform</p>
        <h1>
          {channelBranding.creatorName} / {channelBranding.channelName}
        </h1>
        <p className="landing__handle">YouTube: {channelBranding.channelHandle}</p>
        <p className="landing__tagline">{channelBranding.tagline}</p>
        <div className="notice notice--landing">
          This website includes a public creator landing page and a private dashboard prototype for planning.
        </div>
        <button type="button" className="primary-btn" onClick={() => setIsDashboardOpen(true)}>
          Open Private Dashboard Prototype
        </button>
      </main>

      {isDashboardOpen && (
        <section className="dashboard" aria-label="Private dashboard prototype">
          <Sidebar active={activeSection} onSelect={setActiveSection} />
          <div className="dashboard__content">
            <div className="toolbar">
              <h2>{activeSection}</h2>
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

            <p className="notice">{demoNotice}</p>

            {activeSection === 'Dashboard' && (
              <>
                <section className="stats-grid">
                  <StatCard label="Subscribers" value={metrics.subscribers.toLocaleString()} helper={`${activeRange} sample`} />
                  <StatCard label="Views" value={metrics.views.toLocaleString()} helper={`${activeRange} sample`} />
                  <StatCard
                    label="Watch Time"
                    value={`${metrics.watchTimeHours.toLocaleString()} hrs`}
                    helper={`${activeRange} sample`}
                  />
                  <StatCard
                    label="Estimated YouTube Revenue"
                    value={currency(metrics.youtubeRevenue)}
                    helper="Demo estimate"
                  />
                  <StatCard
                    label="Sponsorship Revenue"
                    value={currency(metrics.sponsorshipRevenue)}
                    helper="Demo estimate"
                  />
                  <StatCard label="Combined Revenue" value={currency(combinedRevenue)} helper="Demo total" />
                </section>

                <SectionHeader
                  title="Content Insights"
                  subtitle="Featured content cards and recent uploads list for planning next videos."
                />
                <section className="video-grid">
                  {featuredVideos.map((video) => (
                    <VideoCard key={video.title} video={video} />
                  ))}
                </section>
                <DataTable rows={recentUploads} />
              </>
            )}

            {activeSection === 'Analytics' && (
              <>
                <SectionHeader
                  title="Analytics Trends"
                  subtitle="Views, watch time, subscriber gains, and revenue trends in demo mode."
                />
                <section className="trend-grid">
                  <TrendChart title="Views Trend" points={trends.map((p) => ({ label: p.label, value: p.views }))} />
                  <TrendChart
                    title="Watch Time Trend"
                    points={trends.map((p) => ({ label: p.label, value: p.watchTimeHours }))}
                    unit=" hrs"
                  />
                  <TrendChart
                    title="Subscribers Trend"
                    points={trends.map((p) => ({ label: p.label, value: p.subscribers }))}
                  />
                  <TrendChart
                    title="Revenue Trend"
                    points={trends.map((p) => ({ label: p.label, value: p.revenue }))}
                    unit=" USD"
                  />
                </section>
              </>
            )}

            {activeSection === 'Monetization' && (
              <>
                <SectionHeader
                  title="Monetization Overview"
                  subtitle="Demo snapshot of YouTube and sponsorship earnings with source split."
                />
                <section className="stats-grid stats-grid--three">
                  <StatCard
                    label="YouTube Revenue"
                    value={currency(metrics.youtubeRevenue)}
                    helper={`${activeRange} demo`}
                  />
                  <StatCard
                    label="Sponsorships"
                    value={currency(metrics.sponsorshipRevenue)}
                    helper={`${activeRange} demo`}
                  />
                  <StatCard label="Combined" value={currency(combinedRevenue)} helper={`${activeRange} demo`} />
                </section>
                <section className="revenue-breakdown">
                  {revenueBreakdown.map((source) => {
                    const pct = totalRevenue ? (source.value / totalRevenue) * 100 : 0
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
                  subtitle="Google sign-in placeholder and future API connection plan."
                />
                <section className="settings-grid">
                  <article className="settings-card">
                    <h4>Google Sign-in Status</h4>
                    <p>Not connected (demo mode). OAuth integration pending.</p>
                  </article>
                  <article className="settings-card">
                    <h4>Channel Preferences</h4>
                    <ul>
                      <li>Primary content type: Education tutorials</li>
                      <li>Dashboard default range: {activeRange}</li>
                      <li>Theme: Dark creator dashboard</li>
                    </ul>
                  </article>
                  <article className="settings-card">
                    <h4>Future API Integration Steps</h4>
                    <ol>
                      {integrationSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </article>
                </section>
              </>
            )}
          </div>
        </section>
      )}
    </>
  )
}

export default App
