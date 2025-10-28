# Portfolio Dashboard

A modern admin dashboard for managing a personal portfolio site. Built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase.

## Features

- 📊 **Analytics**: Track page views and engagement via API routes (`/api/analytics/*`).
- 🔐 **Auth**: Supabase Auth for secure, session-based access to the dashboard.
- 🗂️ **Content**: Foundations for managing projects, skills, and messages.
- 📱 **Responsive UI**: Tailwind-based layouts optimized for desktop and mobile.
- 📈 **Charts**: Recharts for visualizing analytics.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend/Data**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **Icons**: Lucide React

## Quick Start

### Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)
- Supabase project (free tier works)

### Install and run

```bash
npm install
npm run dev
```

Visit: `http://localhost:3000`

### Environment variables

Create `.env` and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

See `SUPABASE_SETUP.md` for full instructions and `supabase-schema.sql` for schema.

For a step-by-step walkthrough of local setup and next steps, see `SETUP_GUIDE.md`.

## Project Structure

```
portfolio-dashboard/
├── app/
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── api/analytics/track/route.ts
│   ├── api/analytics/stats/route.ts
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── supabase.ts
│   └── auth.ts
├── supabase-schema.sql
├── SUPABASE_SETUP.md
├── SETUP_GUIDE.md
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## API Overview

- `POST /api/analytics/track`: record a page view
- `GET /api/analytics/stats`: fetch aggregated stats for charts

## Scripts

```bash
# Dev
npm run dev

# Build and start
npm run build && npm start

# Lint
npm run lint
```

## Deployment

Deploy to Vercel:

1. Push to GitHub.
2. Import in Vercel and set env vars.
3. Deploy.

## Resources

- Next.js App Router docs: https://nextjs.org/docs/app
- Supabase docs: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

## Contributing

PRs and suggestions are welcome.

## License

Released under the MIT License. See `LICENSE`.
