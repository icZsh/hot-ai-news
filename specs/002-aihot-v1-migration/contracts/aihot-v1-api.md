# Contract: AI HOT Stable v1 API

Base URL: `https://aihot.news`

The former `https://aihot.virxact.com` host is a compatibility surface and is scheduled to redirect to the same paths after 2026-10-31 (Beijing time).

All requests are anonymous, read-only JSON GETs.

## Used endpoints

- `GET /api/v1/items`
  - Query: `mode`, `window`, `by`, `category`, `q`, `limit`, `cursor`.
  - Response: `{schemaVersion, query, items, page:{count,hasMore,nextCursor}}`.
- `GET /api/v1/dailies/latest`
  - Response: `{schemaVersion, report}`.
- `GET /api/v1/dailies/{date}`
  - `date` is `YYYY-MM-DD`.
- `GET /api/v1/dailies?limit=N`
  - Response: `{schemaVersion, count, items}`.
- `GET /api/v1/hot-topics`
  - Response: `{schemaVersion, count, items}`.
  - Each item carries one-based `rank` (1-10); preserve the API order and do not infer heat from `sourceCount` or `signalCount`.

## Field mapping

- Item source: `source.name`.
- Item links: `links.original` and `links.aihot`.
- Daily section/flash source: `source.name`.
- Daily section/flash links: `links.original` and nullable `links.aihot`.
- Attribution: `{name,url}`.

## Error behavior

- 304 is possible when conditional requests are added later; current adapter does not persist ETags.
- 4xx maps to `remote_4xx`; 5xx maps to `remote_5xx`; timeout and Zod parse behavior remains unchanged.
