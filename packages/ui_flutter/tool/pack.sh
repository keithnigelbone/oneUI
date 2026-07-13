#!/usr/bin/env bash
# Pack ui_flutter for external consumers (same layout as pub publish tarball).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(grep '^version:' "$ROOT/pubspec.yaml" | awk '{print $2}')"
OUT="$ROOT/ui_flutter-${VERSION}.tar.gz"
ICON_SRC="$ROOT/../../apps/platform/public/jio-icons-data.json"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

mkdir -p "$STAGE/assets/brand_data/cdn"
cp -R "$ROOT/pubspec.yaml" "$ROOT/lib" "$ROOT/fonts" "$ROOT/bin" "$STAGE/"
cp -R "$ROOT/assets/brand_data/"* "$STAGE/assets/brand_data/" 2>/dev/null || true
touch "$STAGE/assets/brand_data/cdn/.gitkeep"

if [[ -f "$ICON_SRC" ]]; then
  cp "$ICON_SRC" "$STAGE/assets/jio-icons-data.json"
elif [[ ! -f "$STAGE/assets/jio-icons-data.json" ]]; then
  echo "error: jio-icons-data.json missing. Run: pnpm build:jio-icons" >&2
  exit 1
fi

LOGO_SRC="$ROOT/assets/jio-logo.svg"
if [[ -f "$LOGO_SRC" ]]; then
  cp "$LOGO_SRC" "$STAGE/assets/jio-logo.svg"
fi

tar -czf "$OUT" -C "$STAGE" .

echo "Created $OUT ($(du -h "$OUT" | awk '{print $1}'))"
