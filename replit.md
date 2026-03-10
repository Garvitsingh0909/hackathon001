# JalDrishti AI

Water quality monitoring and citizen reporting platform for India's rivers and water bodies.

## Architecture

- **Frontend**: React 19 + Vite + Tailwind CSS (SPA)
- **Backend**: Express 5 serving both the Vite dev middleware and REST API
- **Database**: PostgreSQL via Prisma (optional — app falls back to mock data if not configured)
- **AI**: Google Gemini API (all calls server-side via `/api/gemini/*` routes)

## Running the App

```
npm run dev
```

Server starts on port **5000** (required for Replit webview).

## Environment Variables / Secrets

| Key | Required | Description |
|-----|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key (stored in Replit Secrets) |
| `DATABASE_URL` | No | PostgreSQL connection URL (falls back to mock data) |
| `DIRECT_URL` | No | Direct PostgreSQL URL for Prisma migrations |

## Security Notes

- The `GEMINI_API_KEY` is **never** sent to the browser. All Gemini API calls go through server-side routes in `api/gemini.ts`.
- `.env` files are gitignored. Secrets are managed via Replit Secrets.

## Key Files

- `server.ts` — Express server entry point; integrates Vite middleware in dev
- `api/index.ts` — REST API routes for segments, reports, trends, chat logging
- `api/gemini.ts` — Server-side Gemini AI proxy routes
- `server/prisma.ts` — Prisma client factory with graceful DB-not-configured handling
- `services/geminiService.ts` — Frontend service that calls backend `/api/gemini/*` routes
- `vite.config.ts` — Vite config; port 5000, host 0.0.0.0
- `prisma/schema.prisma` — DB schema: WaterReport, SensorData, UserQuery
