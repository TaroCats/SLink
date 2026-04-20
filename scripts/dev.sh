#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup() {
  jobs -p | xargs -r kill 2>/dev/null || true
}
trap cleanup EXIT INT TERM

if command -v cargo >/dev/null 2>&1; then
  (cd "$ROOT_DIR/api" && cargo run) &
else
  mkdir -p "$ROOT_DIR/data"
  docker run --rm -p 8080:8080 \
    -e DATABASE_URL="sqlite:///work/data/shortlink.db" \
    -w /work/api \
    -v "$ROOT_DIR":/work \
    rust:1.88 cargo run &
fi

if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  (cd "$ROOT_DIR/frontend" && npm ci)
fi

(cd "$ROOT_DIR/frontend" && npm run dev -- --port 5174) &

wait

