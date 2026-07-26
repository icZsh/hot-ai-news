# Tasks: AI HOT Stable v1 Migration

## Phase 1: Contract and gates

- [x] T001 Inspect legacy and v1 OpenAPI schemas and record hashes.
- [x] T002 Record the 2026-12-31 legacy shutdown and endpoint/field mappings.
- [x] T003 Pin `.specify/feature.json` to this feature directory.
- [x] T004 Run Spec Kit prerequisite gate.

## Phase 2: Tests first

- [x] T005 Add adapter tests for v1 items/daily/index/hot-topic paths and v1 query names.
- [x] T006 Add normalizer tests for v1 response envelopes and nested wire fields.
- [x] T007 Run focused tests and verify expected RED failures.

## Phase 3: Implementation

- [x] T008 Update schemas and normalizers while preserving local normalized types.
- [x] T009 Move production adapter calls to `/api/v1/*` and remove legacy version/fingerprint APIs.
- [x] T010 Run focused tests and verify GREEN.

## Phase 4: Verification

- [x] T011 Run full `npm test`.
- [x] T012 Run `npm run lint`.
- [x] T013 Run `npm run build`.
- [x] T014 Run a harmless live v1 normalization smoke.
- [x] T015 Commit the verified migration locally.
