#!/usr/bin/env bash
# Extract the packaged ui_flutter tarball into vendor/ for external-consumer testing.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARBALL="${TARBALL:-$ROOT/../../packages/ui_flutter/ui_flutter-0.1.0-alpha.1.tar.gz}"
VENDOR_DIR="$ROOT/vendor/ui_flutter"

if [[ ! -f "$TARBALL" ]]; then
  echo "error: tarball not found at $TARBALL" >&2
  echo "Build it from the monorepo: cd packages/ui_flutter && ./tool/pack.sh" >&2
  exit 1
fi

rm -rf "$VENDOR_DIR"
mkdir -p "$VENDOR_DIR"
tar -xzf "$TARBALL" -C "$VENDOR_DIR"

echo "Extracted ui_flutter into $VENDOR_DIR"
echo "Run: cd apps/flutter_sample && flutter pub get"
