#!/bin/zsh
set -euo pipefail

script_dir="${0:A:h}"
repo_dir="${script_dir:h}"
node_bin="${NODE_BIN:-node}"
host="${HOT_AI_NEWS_HOST:-0.0.0.0}"
port="${HOT_AI_NEWS_PORT:-3100}"

cd "$repo_dir"

exec "$node_bin" "$repo_dir/node_modules/next/dist/bin/next" start -H "$host" -p "$port"
