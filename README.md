# Hot AI News

A personal AI news radar built with Next.js, AI HOT, and optional Postgres persistence.

Hot AI News starts as a lightweight reader for the public AI HOT API. When a Postgres `DATABASE_URL` is configured, it also keeps a local cache, bookmarks, notes, search data, and weekly review material.

## Features

- AI HOT selected items and daily reports
- Adapter layer that normalizes remote AI HOT responses
- Database-first reads with remote fallback
- Optional local archive, bookmarks, read status, notes, search, and weekly review
- Markdown export for review notes
- Docker and Docker Compose deployment

## Docker Deployment

You can run Hot AI News in two Docker modes:

- **App only**: no database required. The app reads directly from AI HOT. Bookmarks, notes, search, and local archive features are unavailable.
- **App + Postgres**: starts a local Postgres container, creates the Prisma schema, and enables persistence-backed features.

### Prerequisites

- Docker Desktop or Docker Engine with Docker Compose v2
- Git

Check that Compose is available:

```bash
docker compose version
```

### 1. Clone The Repo

```bash
git clone https://github.com/icZsh/hot-ai-news.git
cd hot-ai-news
```

### 2. Create Your Env File

```bash
cp .env.example .env
```

For local/private-network use, edit `.env` and set:

```bash
LOCAL_PRIVATE_ACCESS=true
```

For a public internet deployment, leave `LOCAL_PRIVATE_ACCESS=false` and set strong secrets instead:

```bash
CRON_SECRET=replace-with-a-long-random-secret
ADMIN_TOKEN=replace-with-a-long-random-secret
```

You can generate secrets with:

```bash
openssl rand -hex 32
```

### 3A. Run App-Only Mode

Use this if you only want the live AI HOT reader and do not need persistence:

```bash
docker compose up --build
```

Open:

```text
http://localhost:3100
```

Verify from the terminal:

```bash
curl -I http://localhost:3100
```

Expected result:

```text
HTTP/1.1 200 OK
```

### 3B. Run With Local Postgres

Use this if you want local cache, archive, bookmarks, notes, search, and review data:

```bash
docker compose -f docker-compose.yml -f docker-compose.postgres.yml up --build
```

The Postgres overlay does three things:

- starts a `postgres` service
- runs `npx prisma db push` in a one-shot `migrate` service
- starts the web app with a container-local `DATABASE_URL`

Open:

```text
http://localhost:3100
```

After the app is up, trigger an initial sync. If this is a local/private deployment with `LOCAL_PRIVATE_ACCESS=true`, you can call:

```bash
curl -X POST http://localhost:3100/api/cron/sync-selected
curl -X POST http://localhost:3100/api/cron/sync-daily
```

If `LOCAL_PRIVATE_ACCESS=false` and you configured `CRON_SECRET`, include it:

```bash
curl -X POST http://localhost:3100/api/cron/sync-selected \
  -H "x-cron-secret: $CRON_SECRET"

curl -X POST http://localhost:3100/api/cron/sync-daily \
  -H "x-cron-secret: $CRON_SECRET"
```

### Common Docker Commands

Run in the background:

```bash
docker compose up --build -d
```

View logs:

```bash
docker compose logs -f web
```

Stop containers:

```bash
docker compose down
```

Stop containers and remove the local Postgres volume:

```bash
docker compose -f docker-compose.yml -f docker-compose.postgres.yml down -v
```

Use a different host port if `3100` is already taken:

```bash
HOT_AI_NEWS_PORT=3310 docker compose up --build
```

Then open:

```text
http://localhost:3310
```

Update to the latest version:

```bash
git pull
docker compose up --build -d
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `APP_TIMEZONE` | No | Display timezone. Defaults to `America/Los_Angeles`. |
| `AIHOT_BASE_URL` | No | AI HOT base URL. Defaults to `https://aihot.virxact.com`. |
| `AIHOT_USER_AGENT` | No | User agent used for server-side AI HOT requests. |
| `DATABASE_URL` | No | Postgres connection string. Enables local persistence when set. |
| `CRON_SECRET` | Production writes | Secret accepted by cron/write endpoints via `x-cron-secret` or bearer auth. |
| `ADMIN_TOKEN` | Production writes | Secret accepted by admin/write endpoints via `x-admin-token` or bearer auth. |
| `LOCAL_PRIVATE_ACCESS` | No | Local/private-network convenience mode. Do not enable on public internet deployments. |

Production deployments should set `CRON_SECRET` and/or `ADMIN_TOKEN` before exposing write endpoints.

## Database Setup

With an external Postgres database:

```bash
cp .env.example .env.local
npm install
npm run db:generate
npm run db:push
```

For Supabase, use the session pooler connection string on port `5432` for `prisma db push`. Avoid the transaction pooler for schema changes.

## Local Development

```bash
npm install
npm run db:generate
npm run dev
```

Open:

```text
http://localhost:3100
```

If `DATABASE_URL` is missing, the app still runs in remote read-only mode. Personal features that require local persistence will show an unavailable state.

## Sync Endpoints

Manual sync:

```bash
curl -X POST http://localhost:3100/api/refresh/selected
curl -X POST http://localhost:3100/api/cron/sync-daily
```

With a configured secret:

```bash
curl -X POST http://localhost:3100/api/cron/sync-daily \
  -H "x-cron-secret: $CRON_SECRET"
```

Use your platform scheduler, cron, GitHub Actions, or another trusted scheduler to call these endpoints.

## Validation

```bash
npm run lint
npm test
npm run build
docker build -t hot-ai-news .
```

## Security Notes

- Never commit `.env`, `.env.local`, database URLs, API keys, or admin tokens.
- `LOCAL_PRIVATE_ACCESS=true` is intended only for local/private networks.
- Public deployments should protect write endpoints with `CRON_SECRET` and/or `ADMIN_TOKEN`.
- This project does not require an LLM API key for the current AI HOT hybrid mode.

## Architecture Notes

- `src/lib/aihot/adapter.ts` isolates remote AI HOT calls from application data models.
- `src/lib/services/*` implements database-first reads and remote fallbacks.
- `prisma/schema.prisma` defines the optional Postgres persistence layer.
- `src/app/api/*` contains sync, item, bookmark, note, and daily-report endpoints.

## License

MIT
