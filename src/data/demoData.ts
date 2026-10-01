export const channelBranding = {
  creatorName: 'SUBBAREDDY.85',
  channelName: 'SUBBUEDUCATION2025',
  channelHandle: '@Subbareddy.85',
  tagline: 'Creator Dashboard Prototype for educational growth, insights, and monetization planning.',
}

export const demoNotice =
  'Demo-only sample data. Metrics and revenue shown here are not real channel analytics. Connect Google OAuth + YouTube Analytics API to load live data.'

export const timeRanges = ['7D', '28D', '90D', '365D'] as const

export type TimeRange = (typeof timeRanges)[number]

export type DashboardMetrics = {
  subscribers: number
  views: number
  watchTimeHours: number
  youtubeRevenue: number
  sponsorshipRevenue: number
}

export const metricsByRange: Record<TimeRange, DashboardMetrics> = {
  '7D': {
    subscribers: 3520,
    views: 18240,
    watchTimeHours: 621,
    youtubeRevenue: 122.5,
    sponsorshipRevenue: 80,
  },
  '28D': {
    subscribers: 3612,
    views: 74120,
    watchTimeHours: 2480,
    youtubeRevenue: 498.2,
    sponsorshipRevenue: 320,
  },
  '90D': {
    subscribers: 3875,
    views: 206430,
    watchTimeHours: 7110,
    youtubeRevenue: 1345.6,
    sponsorshipRevenue: 960,
  },
  '365D': {
    subscribers: 4530,
    views: 884920,
    watchTimeHours: 27490,
    youtubeRevenue: 5389.3,
    sponsorshipRevenue: 4280,
  },
}

export type TrendPoint = {
  label: string
  views: number
  watchTimeHours: number
  subscribers: number
  revenue: number
}

export const trendsByRange: Record<TimeRange, TrendPoint[]> = {
  '7D': [
    { label: 'Mon', views: 2100, watchTimeHours: 84, subscribers: 8, revenue: 27 },
    { label: 'Tue', views: 2330, watchTimeHours: 88, subscribers: 7, revenue: 29 },
    { label: 'Wed', views: 2480, watchTimeHours: 90, subscribers: 10, revenue: 31 },
    { label: 'Thu', views: 2520, watchTimeHours: 92, subscribers: 8, revenue: 32 },
    { label: 'Fri', views: 2700, watchTimeHours: 95, subscribers: 11, revenue: 34 },
    { label: 'Sat', views: 3000, watchTimeHours: 100, subscribers: 12, revenue: 36 },
    { label: 'Sun', views: 3110, watchTimeHours: 102, subscribers: 14, revenue: 37 },
  ],
  '28D': [
    { label: 'Week 1', views: 17300, watchTimeHours: 570, subscribers: 18, revenue: 186 },
    { label: 'Week 2', views: 18100, watchTimeHours: 605, subscribers: 22, revenue: 201 },
    { label: 'Week 3', views: 18950, watchTimeHours: 632, subscribers: 24, revenue: 209 },
    { label: 'Week 4', views: 19770, watchTimeHours: 673, subscribers: 28, revenue: 222 },
  ],
  '90D': [
    { label: 'Month 1', views: 63210, watchTimeHours: 2140, subscribers: 75, revenue: 710 },
    { label: 'Month 2', views: 68420, watchTimeHours: 2360, subscribers: 82, revenue: 761 },
    { label: 'Month 3', views: 74790, watchTimeHours: 2610, subscribers: 106, revenue: 834 },
  ],
  '365D': [
    { label: 'Q1', views: 182100, watchTimeHours: 5690, subscribers: 230, revenue: 1770 },
    { label: 'Q2', views: 209450, watchTimeHours: 6460, subscribers: 286, revenue: 2190 },
    { label: 'Q3', views: 228370, watchTimeHours: 7080, subscribers: 304, revenue: 2630 },
    { label: 'Q4', views: 265000, watchTimeHours: 8260, subscribers: 410, revenue: 3079 },
  ],
}

export type VideoItem = {
  title: string
  topic: string
  published: string
  views: number
  watchTimeHours: number
  cta: string
}

export const featuredVideos: VideoItem[] = [
  {
    title: 'How to Build Study Discipline in 30 Days',
    topic: 'Learning Strategy',
    published: '2 weeks ago',
    views: 12400,
    watchTimeHours: 410,
    cta: 'Replicate format for upcoming exam series',
  },
  {
    title: '10th Class Science Revision Sprint',
    topic: 'Exam Prep',
    published: '1 month ago',
    views: 9800,
    watchTimeHours: 330,
    cta: 'Expand into chapter-wise short videos',
  },
  {
    title: 'Career Guidance After Intermediate',
    topic: 'Career Advice',
    published: '5 days ago',
    views: 7200,
    watchTimeHours: 270,
    cta: 'Build follow-up Q&A live stream',
  },
]

export const recentUploads: VideoItem[] = [
  {
    title: 'Daily Study Plan for Students',
    topic: 'Productivity',
    published: '3 days ago',
    views: 3600,
    watchTimeHours: 124,
    cta: 'Pin study checklist in description',
  },
  {
    title: 'Mathematics Shortcuts for Exams',
    topic: 'Math Tips',
    published: '1 week ago',
    views: 5100,
    watchTimeHours: 178,
    cta: 'Create Part 2 with worksheet PDF',
  },
  {
    title: 'Motivation for Consistent Learning',
    topic: 'Motivation',
    published: '11 days ago',
    views: 4480,
    watchTimeHours: 160,
    cta: 'Clip highlights for shorts strategy',
  },
  {
    title: 'English Vocabulary Booster Session',
    topic: 'Language Skills',
    published: '2 weeks ago',
    views: 4890,
    watchTimeHours: 171,
    cta: 'Add quiz section in community post',
  },
]

export const integrationSteps = [
  'Create Google Cloud project and enable YouTube Data + YouTube Analytics APIs.',
  'Configure OAuth consent and add authorized redirect URIs for your frontend domain.',
  'Replace demoData.ts values with API fetch hooks after token exchange.',
  'Persist selected channel and refresh tokens securely in backend services.',
]
