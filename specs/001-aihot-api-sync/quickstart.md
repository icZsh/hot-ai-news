# Quickstart: AI HOT API Sync

1. Run the focused tests:

   ```bash
   npm test -- src/lib/aihot/normalizers.test.ts src/lib/aihot/adapter.test.ts
   ```

2. Run full validation:

   ```bash
   npm test
   npm run lint
   npm run build
   ```

3. Optional live smoke, without secrets:

   ```bash
   node -e "fetch('https://aihot.virxact.com/api/public/version',{headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.json()).then(console.log)"
   ```
