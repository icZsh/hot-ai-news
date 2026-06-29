# Implementation Plan: AI HOT API Sync

**Branch**: `main` | **Date**: 2026-06-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-aihot-api-sync/spec.md`

## Summary

Update the local AI HOT adapter to match the current public OpenAPI surface: support server-side keyword and since filters, preserve new optional response metadata, and expose hot-topic/version discovery functions. Keep the change adapter-first with no UI scope.

## Technical Context

**Language/Version**: TypeScript 6, Node/Next.js runtime

**Primary Dependencies**: Next.js 16, React 19, Zod 4, Vitest

**Storage**: No schema changes; optional Postgres cache remains unchanged

**Testing**: Vitest unit tests for adapter URL construction and normalizers; npm lint/build for full validation

**Target Platform**: Local/server-rendered Next.js app

**Project Type**: Web application with adapter/service layer

**Performance Goals**: Preserve existing request timeout/retry behavior and avoid extra API calls for existing screens

**Constraints**: Anonymous read-only AI HOT public endpoints; no new secrets; no UI expansion in this slice

**Scale/Scope**: Adapter and normalized data types only

## Constitution Check

The constitution is still the Spec Kit template, so no project-specific governance constraints are active. TDD is enforced by task plan and local development skill.

## Project Structure

### Documentation (this feature)

```text
specs/001-aihot-api-sync/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/aihot-public-api.md
└── tasks.md
```

### Source Code (repository root)

```text
src/lib/aihot/
├── adapter.ts
├── adapter.test.ts
├── normalizers.ts
├── normalizers.test.ts
├── schemas.ts
└── types.ts
```

**Structure Decision**: Keep all changes inside the existing `src/lib/aihot` adapter boundary. Do not touch UI routes or persistence schema in this feature.

## Complexity Tracking

No constitution violations or extra complexity introduced.
