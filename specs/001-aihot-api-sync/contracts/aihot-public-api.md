# Contract: AI HOT Public API Adapter

## Item list

`fetchSelectedItems(options)` must accept:

- `mode?: "selected" | "all"`
- `category?: string`
- `take?: number`
- `cursor?: string`
- `since?: string`
- `q?: string`

When present, `since` and `q` are encoded as query parameters on `/api/public/items`.

## Hot topics

`fetchHotTopics(options)` calls `/api/public/hot-topics` and returns normalized topic data. The normalized shape preserves both `sourceCount` (independent sources) and `signalCount` (underlying reports/signals) from the public API.

## Version metadata

`fetchAihotVersion(options)` calls `/api/public/version` and returns normalized version data.

## Error contract

All functions return `AdapterResult<T>` and must preserve existing timeout, parse, 4xx, 5xx, and unknown error mapping.
