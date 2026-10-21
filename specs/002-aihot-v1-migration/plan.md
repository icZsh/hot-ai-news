# Implementation Plan: AI HOT Stable v1 Migration

## Summary

Migrate the existing adapter at `src/lib/aihot/` to AI HOT's stable anonymous read-only v1 API while retaining the normalized contracts consumed by services and UI. Keep scope adapter-only: no new UI, database migration, mirror protocol, or scheduled polling redesign.

## Technical Context

- Runtime: Next.js 16, TypeScript, Zod, Vitest.
- Source contract: `https://aihot.news/openapi-v1.json` (the watched legacy-host URL redirects to this canonical host).
- Legacy contract: `https://aihot.virxact.com/openapi.yaml`, which announces shutdown on 2026-12-31.
- Existing consumers rely on `NormalizedItemsResponse`, `NormalizedDailyReport`, `NormalizedDailyIndex`, and `NormalizedHotTopicsResponse`.

## Approach

1. Add failing adapter tests for v1 paths and query names.
2. Add failing normalizer tests for v1 envelopes and nested `source`, `links`, and attribution fields.
3. Update Zod schemas and normalizers while preserving normalized local types.
4. Move production calls to v1 endpoints and remove legacy-only version/fingerprint APIs.
5. Run focused tests, full tests, lint, build, and one live v1 normalization smoke.

## Constraints

- Anonymous read-only requests only.
- No cookies, credentials, browser state, or external publication.
- No database schema or UI changes.
- Do not implement full selected snapshot/changes mirroring in this migration; current local sync remains bounded head sync.
