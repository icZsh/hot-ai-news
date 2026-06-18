# TODO

## Setup

- [x] Add Supabase `DATABASE_URL` to `.env.local`.
  - Configured as Supavisor Session pooler on port `5432`.
  - Prisma `db:push` is complete.
  - Initial sync is complete: selected items and latest daily report are cached.

- [x] Add local launchd scheduled sync.
  - Selected items sync every 30 minutes.
  - Daily report syncs at `07:15` America/Los_Angeles.

- [ ] Add production `CRON_SECRET` and `ADMIN_TOKEN` before deploying.
  - Local desktop mode currently uses `LOCAL_PRIVATE_ACCESS=true`; deployed production write endpoints must not.

## Product Hardening

- [ ] Add private browser auth/session before deploying bookmark and note writes.
  - Current server-side token guard protects cron/admin endpoints, but browser bookmark/note writes need a user-facing private session in production.
