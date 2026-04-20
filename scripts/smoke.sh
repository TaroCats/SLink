#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
DB_PATH="$TMP_DIR/shortlink_smoke.db"
BASE_URL="http://127.0.0.1:8080"

cleanup() {
  if [ -n "${BACK_PID:-}" ] && kill -0 "$BACK_PID" 2>/dev/null; then
    kill "$BACK_PID" 2>/dev/null || true
    wait "$BACK_PID" 2>/dev/null || true
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT INT TERM

if command -v cargo >/dev/null 2>&1; then
  (cd "$ROOT_DIR/api" && DATABASE_URL="sqlite:///$DB_PATH" cargo run) &
  BACK_PID=$!
else
  docker run --rm -p 8080:8080 \
    -e DATABASE_URL="sqlite:////tmp/shortlink_smoke.db" \
    -w /work/api \
    -v "$ROOT_DIR":/work \
    rust:1.88 cargo run &
  BACK_PID=$!
fi

for _ in $(seq 1 60); do
  if curl -sf "$BASE_URL/api/domains" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

node "$ROOT_DIR/scripts/smoke-api.mjs" --base "$BASE_URL" --change-password

