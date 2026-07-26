# Data Model: AI HOT Stable v1 Migration

No Prisma schema change is required.

The adapter maps v1 wire objects into existing local normalized entities:

- `V1Item` -> `NormalizedItem`
  - `originalTitle` -> `titleEn`
  - `links.original` -> `url`
  - `links.aihot` -> `permalink`
  - `source.name` -> `sourceName`
- `V1ItemsResponse.page` -> normalized `count`, `hasNext`, and `nextCursor`
- `V1DailyResponse.report` -> `NormalizedDailyReport`
- `V1DailySectionItem` and `V1DailyFlash` -> existing daily item/flash shapes
- `V1HotTopic` -> `NormalizedHotTopic`
- `{name, url}` attribution -> local `{source, canonical}`

Unknown wire fields remain available only through `raw` and do not leak into UI-facing normalized fields.
