#!/bin/zsh
set -euo pipefail

script_dir="${0:A:h}"
repo_dir="${script_dir:h}"
node_bin="${NODE_BIN:-node}"
port="${HOT_AI_NEWS_PORT:-3100}"
base_url="${HOT_AI_NEWS_BASE_URL:-http://127.0.0.1:${port}}"

cd "$repo_dir"

job="${1:-}"

case "$job" in
  selected)
    url="${base_url}/api/cron/sync-selected"
    ;;
  daily)
    url="${base_url}/api/cron/sync-daily"
    ;;
  *)
    echo "Usage: $0 selected|daily" >&2
    exit 64
    ;;
esac

for _ in {1..60}; do
  if curl -fsS -I "$base_url" >/dev/null 2>&1; then
    break
  fi

  sleep 1
done

token=$("$node_bin" - <<'NODE'
const fs = require("fs");
const dotenv = require("dotenv");

try {
  const envFile = fs.existsSync(".env.local") ? ".env.local" : ".env";
  const env = dotenv.parse(fs.readFileSync(envFile));
  process.stdout.write(env.CRON_SECRET || env.ADMIN_TOKEN || "");
} catch {
  process.stdout.write("");
}
NODE
)

if [[ -n "$token" ]]; then
  printf 'header = "x-cron-secret: %s"\n' "$token" |
    curl -fsS -X POST -K - "$url"
else
  curl -fsS -X POST "$url"
fi

echo
