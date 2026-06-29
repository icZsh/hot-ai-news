# Tasks: AI HOT API Sync

**Input**: Design documents from `/specs/001-aihot-api-sync/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/aihot-public-api.md

**Tests**: Required. This feature changes adapter contracts and normalizers; write failing Vitest tests first.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

**Purpose**: Pin feature context and validate current repo state.

- [x] T001 Verify Spec Kit feature pointer `.specify/feature.json` targets `specs/001-aihot-api-sync`
- [x] T002 Review current AI HOT adapter and normalizer files under `src/lib/aihot/`

---

## Phase 2: Tests First

**Purpose**: Establish failing tests before production code changes.

- [x] T003 [P] [US1] Add adapter test proving `fetchSelectedItems` includes `q` and `since` in `src/lib/aihot/adapter.test.ts`
- [x] T004 [P] [US2] Add normalizer tests for item `permalink`/`score`/`selected` and daily `flashes` in `src/lib/aihot/normalizers.test.ts`
- [x] T005 [P] [US3] Add adapter tests for hot topics and version metadata in `src/lib/aihot/adapter.test.ts`
- [x] T006 Run focused tests and confirm they fail for missing behavior

---

## Phase 3: Implementation

**Purpose**: Implement the smallest adapter/type/schema changes that satisfy tests.

- [x] T007 [US1] Extend `ItemsOptions` and query construction in `src/lib/aihot/adapter.ts` with optional `q` and `since`
- [x] T008 [US2] Extend schemas/types/normalizers in `src/lib/aihot/{schemas.ts,types.ts,normalizers.ts}` for new optional item fields and daily flashes
- [x] T009 [US3] Add schemas/types/normalizers and adapter functions for `/api/public/hot-topics` and `/api/public/version`

---

## Phase 4: Validation & Cleanup

**Purpose**: Verify behavior and update task state.

- [x] T010 Run focused tests and confirm they pass
- [x] T011 Run full `npm test`
- [x] T012 Run `npm run lint`
- [x] T013 Run `npm run build`
- [x] T014 Mark all tasks complete in `specs/001-aihot-api-sync/tasks.md`
