# Research: AI HOT Stable v1 Migration

## Contract decision

The legacy OpenAPI changed materially. It now announces formal retirement of the legacy item/daily/hot-topic endpoints on **2026-12-31** and directs new clients to `/api/v1`.

- Legacy schema SHA-256: `d9d72ba9c8e04bb11ced569db6591c2dbc3ec0bb0b038fda219efe01de72113b`
- v1 schema SHA-256: `557f37c0f7cf1dfd77b287f79296e2c0d255f3c03c6bfaa45753a8f9f5dd6900`
- AI HOT skill upstream: v1.1.2, repo commit `93d800f9a5aac0c992f1147b683cefa2764397f6`

## Relevant mappings

- `/api/public/items?take=&since=` -> `/api/v1/items?limit=&window=`
- `/api/public/daily` -> `/api/v1/dailies/latest`
- `/api/public/daily/{date}` -> `/api/v1/dailies/{date}`
- `/api/public/dailies?take=` -> `/api/v1/dailies?limit=`
- `/api/public/hot-topics` -> `/api/v1/hot-topics`
- Legacy `/version` and `/fingerprint` are migration/discovery bridges, not stable v1 data APIs; v1 prefers ETag on each full URL.

## Shape changes

- Items: `{count, hasNext, nextCursor, items}` -> `{schemaVersion, query, items, page}`.
- Item source/link fields become nested `source.name`, `links.aihot`, and `links.original`.
- Daily report becomes `{schemaVersion, report}`; section/flash links and sources are nested.
- Attribution changes from `{source, canonical}` to `{name, url}`.

## Scope decision

Keep normalized local types stable to avoid database/UI churn. Do not add full snapshot/changes mirroring in this maintenance pass; it is a separate capability with state-machine semantics.
