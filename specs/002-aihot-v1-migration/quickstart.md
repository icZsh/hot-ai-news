# Quickstart: Verify AI HOT v1 Migration

```bash
.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks
npm test -- src/lib/aihot/adapter.test.ts src/lib/aihot/normalizers.test.ts
npm test
npm run lint
npm run build
```

Live smoke uses only anonymous read-only endpoints and a harmless one-item response:

```bash
curl -fsSL 'https://aihot.news/api/v1/items?mode=selected&window=7d&limit=1'
```
