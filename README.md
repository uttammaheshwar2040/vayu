# SUBBUEDUCATION2025 Creator Dashboard Prototype

A Vite + React + TypeScript frontend prototype for **SUBBAREDDY.85 / SUBBUEDUCATION2025**.

This project includes:
- Public landing page with creator branding (education-focused, dark theme)
- Private dashboard prototype with sidebar pages: **Dashboard, Analytics, Monetization, Settings**
- Centralized demo data for easy future replacement (`/src/data/demoData.ts`)
- Explicit demo labeling (no claim of real analytics/revenue)
- Responsive layout for desktop, tablet, and mobile

> **Demo notice:** all analytics and revenue are sample data only until Google OAuth + YouTube Analytics integration is added.

## Local setup

From repository root:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build and preview

```bash
npm run lint
npm run build
npm run preview
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, create a new project and import this repo.
3. Use defaults for Vite projects:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Deploy.

## Future YouTube API integration

The app is structured so demo data can be replaced cleanly:
- Replace static values in `src/data/demoData.ts` with API-backed hooks/services.
- Add Google OAuth flow and token handling.
- Load channel analytics/revenue from YouTube APIs after authentication.
