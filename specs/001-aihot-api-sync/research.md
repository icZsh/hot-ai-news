# Research: AI HOT API Sync

## Decision: Adapter-first, no UI change

- **Rationale**: The OpenAPI diff shows compatibility gaps in the adapter layer, while current UI flows still work. Updating adapter/types first gives future UI work a stable contract without expanding scope.
- **Alternative considered**: Add visible hot-topic UI immediately. Rejected because Isaac asked for an update, not a new screen, and small useful v1 wins here.

## Decision: Preserve optional fields as first-class normalized fields

- **Rationale**: `permalink`, `score`, `selected`, and daily `flashes` are useful downstream and should not be hidden only in `raw`.
- **Alternative considered**: Rely on `raw` for all new fields. Rejected because consumers would need to know remote field names and duplicate parsing.

## Decision: Support `q` and `since` in `fetchSelectedItems`

- **Rationale**: The existing function already owns `/api/public/items` query construction. Adding optional fields there keeps category/mode/cursor behavior in one place.
- **Alternative considered**: Add a separate search function. Rejected because `q` and `since` compose orthogonally with existing mode/category options.

## Decision: Add separate discovery functions for hot topics and version

- **Rationale**: `/hot-topics` and `/version` return different entities and deserve explicit normalized results.
- **Alternative considered**: Generic fetch helper exports. Rejected to keep the adapter typed and user-facing.

## External facts checked

- `https://aihot.virxact.com/openapi.yaml` on 2026-06-28
- Current OpenAPI hash matched watchlist state: `a3a5f8cb470ea6bff6f055e2440f233345f35ec33368b28f2d17b93ce663a11d`
