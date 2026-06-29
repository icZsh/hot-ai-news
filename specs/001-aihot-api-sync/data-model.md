# Data Model: AI HOT API Sync

## NormalizedItem additions

- `permalink?: string` — AI HOT canonical permalink for the item.
- `score?: number` — remote ranking/relevance score when present.
- `selected?: boolean` — whether AI HOT marked the item as selected.

## NormalizedDailyFlash

- `title: string`
- `sourceName?: string`
- `sourceUrl: string`
- `publishedAt?: string`
- `permalink?: string`
- `raw?: unknown`

## NormalizedDailyReport additions

- `flashes: NormalizedDailyFlash[]` — defaults to an empty array for older responses.

## NormalizedHotTopic

- `id: string`
- `title: string`
- `url: string`
- `permalink: string`
- `sourceName: string`
- `sourceCount: number`
- `sourceNames: string[]`
- `latestAt: string`
- `raw?: unknown`

## NormalizedAihotVersion

- `apiVersion?: string`
- `skillVersion?: string`
- `updatedAt?: string`
- `changelogUrl?: string`
- `recentChanges: string[]`
- `raw?: unknown`
