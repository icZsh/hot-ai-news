# Feature Specification: AI HOT Stable v1 Migration

**Feature Branch**: `hermes/aihot-v1-migration-20260725`

**Created**: 2026-07-25

**Status**: Ready for implementation

**Input**: Migrate the local AI News workbench from AI HOT's deprecated `/api/public/*` compatibility endpoints to the stable anonymous read-only `/api/v1/*` contract before the announced 2026-12-31 shutdown.

## User Scenarios & Testing

### User Story 1 - Continue syncing selected AI news (Priority: P1)

The local workbench can fetch current selected AI HOT items after the legacy endpoints are retired, while preserving the normalized records used by local archive, search, bookmarks, and review workflows.

**Acceptance Scenarios**:

1. Given an item request, the client calls `/api/v1/items` with `limit`, `window`, and optional query/category/cursor parameters.
2. Given the v1 `{items, page}` response and nested `source`/`links` objects, normalization preserves the existing local item shape.
3. Given pagination metadata, `page.hasMore` and `page.nextCursor` map to the existing normalized pagination fields.

### User Story 2 - Continue reading and syncing daily reports (Priority: P1)

The local workbench can fetch the latest daily report, a report by date, and the daily index through v1 without changing the UI/service contract.

**Acceptance Scenarios**:

1. Latest daily uses `/api/v1/dailies/latest`.
2. Date lookup uses `/api/v1/dailies/{date}`.
3. Daily index uses `/api/v1/dailies?limit=N`.
4. The v1 `{report}` wrapper plus nested `source`/`links` fields normalize to existing local daily types.

### User Story 3 - Preserve current hot-topic behavior (Priority: P2)

The workbench can fetch `/api/v1/hot-topics` and preserve the existing normalized hot-topic shape.

### Edge Cases

- Unknown response fields must remain harmless.
- Nullable summaries, publication timestamps, categories, scores, and AI HOT links must not cause parse failures.
- Timeout, parse, 4xx, and 5xx mapping must remain stable.
- Legacy-only version/fingerprint probes must not remain on the active adapter path.

## Requirements

- **FR-001**: Production adapter calls MUST use only `https://aihot.news/api/v1/*` AI HOT data endpoints.
- **FR-002**: Item query construction MUST use v1 names: `limit`, `window`, `by`, `q`, `category`, `cursor`, and `mode`.
- **FR-003**: Existing normalized item, daily, daily-index, and hot-topic types MUST remain compatible with local services and UI.
- **FR-004**: The adapter MUST unwrap v1 response envelopes and nested source/link objects.
- **FR-005**: The migration MUST remain anonymous and read-only; no token, cookie, account, or paid service may be introduced.
- **FR-006**: Legacy-only version/fingerprint adapter functions MUST be removed because v1 uses per-URL ETags instead.

## Success Criteria

- Focused tests prove all production paths are `/api/v1/*` and fail against the pre-migration implementation.
- Normalizer tests cover representative v1 item, daily, daily-index, and hot-topic payloads.
- `npm test`, `npm run lint`, and `npm run build` pass.
- A harmless live v1 request returns data that the local normalizers accept.
