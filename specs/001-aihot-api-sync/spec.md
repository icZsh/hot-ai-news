# Feature Specification: AI HOT API Sync

**Feature Branch**: `main`

**Created**: 2026-06-28

**Status**: Ready for planning

**Input**: User description: "更新 AI HOT local workbench to match the current AI HOT public OpenAPI surface."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search and time-window AI HOT items (Priority: P1)

A reader can use the local workbench to request AI HOT selected items by keyword and explicit recency window, so broad questions like "Anthropic 最近 3 天" are scoped server-side rather than over-fetching and filtering locally.

**Why this priority**: Keyword and time-window filtering are the most immediately useful API capabilities missing from the local adapter.

**Independent Test**: Can be tested by requesting selected items with a keyword and since timestamp, then verifying the outgoing AI HOT request contains both filters and still normalizes the response.

**Acceptance Scenarios**:

1. **Given** a keyword and since timestamp, **When** selected items are fetched, **Then** the AI HOT request includes `q` and `since` query parameters.
2. **Given** no keyword or since timestamp, **When** selected items are fetched, **Then** existing selected/all/category/cursor behavior remains unchanged.

---

### User Story 2 - Preserve new AI HOT metadata (Priority: P2)

A reader or future UI surface can access the new AI HOT metadata returned by the public API, including permalinks, score, selected status, and daily flashes.

**Why this priority**: Preserving metadata now prevents silent data loss and makes future UI additions cheaper.

**Independent Test**: Can be tested by normalizing fixtures containing new optional fields and verifying the normalized result exposes them without breaking old fixtures.

**Acceptance Scenarios**:

1. **Given** an item response with `permalink`, `score`, and `selected`, **When** it is normalized, **Then** those fields are available on the normalized item.
2. **Given** a daily report with `flashes`, **When** it is normalized, **Then** the flashes are available on the normalized report.
3. **Given** an older response without those optional fields, **When** it is normalized, **Then** normalization still succeeds.

---

### User Story 3 - Expose AI HOT discovery endpoints (Priority: P3)

A reader or future UI can fetch AI HOT hot topics and API version metadata through the same adapter layer as existing items/daily calls.

**Why this priority**: `/hot-topics` and `/version` are useful but not required for the current main reader flow.

**Independent Test**: Can be tested by mocking AI HOT responses for hot topics and version metadata, then verifying adapter functions normalize and return them.

**Acceptance Scenarios**:

1. **Given** the hot topics endpoint returns topics, **When** the adapter fetches hot topics, **Then** the result contains topic IDs, titles, source counts, source names, and permalinks.
2. **Given** the version endpoint returns API metadata, **When** the adapter fetches version metadata, **Then** the result contains API/skill version and recent changes.

### Edge Cases

- Missing optional metadata must not cause parse failures.
- Unknown extra fields from AI HOT must not leak into UI-facing normalized objects except through `raw`.
- Query parameters with spaces or non-ASCII text must be URL-encoded correctly.
- Timeout, parse, 4xx, and 5xx error mapping must remain unchanged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow selected/all AI HOT item fetches to include an optional keyword query.
- **FR-002**: The system MUST allow selected/all AI HOT item fetches to include an optional ISO timestamp lower bound.
- **FR-003**: The system MUST preserve item permalinks, scores, and selected status when returned by AI HOT.
- **FR-004**: The system MUST preserve daily report flash items when returned by AI HOT.
- **FR-005**: The system MUST expose hot topics through the local AI HOT adapter.
- **FR-006**: The system MUST expose AI HOT version metadata through the local AI HOT adapter.
- **FR-007**: Existing item, daily, and daily index behavior MUST continue to work for existing responses.

### Key Entities *(include if feature involves data)*

- **AI HOT Item**: A remote AI news item with title, source, URL, optional permalink, score, selected status, publication time, summary, and category.
- **Daily Flash**: A short daily report highlight with title, source information, publication time, and permalink.
- **Hot Topic**: A grouped topic with source count, source names, latest time, canonical URL, and permalink.
- **Version Metadata**: API and skill version information plus recent changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Adapter tests verify `q` and `since` are included in outgoing requests when provided.
- **SC-002**: Normalizer tests verify new optional item and daily fields are preserved.
- **SC-003**: Adapter tests verify hot topics and version metadata can be fetched and normalized.
- **SC-004**: The existing test suite, lint, and production build complete successfully.

## Assumptions

- The current OpenAPI hash is unchanged from the watchlist baseline, so this is a compatibility update rather than a breaking migration.
- UI changes are out of scope for this v1; this update prepares the adapter/service layer first.
- The app remains anonymous/read-only for AI HOT public endpoints.
