#!/usr/bin/env bash
# Prefetch CDN brand JSON (Dart) + bake Flutter snapshot assets (TS engine in monorepo).
#
# Usage (from repo root):
#   pnpm flutter:sync-cdn-cache
#
# Or from any Flutter app that depends on ui_flutter:
#   dart run ui_flutter:oneui_sync_brands

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
APP_DIR="${ONEUI_FLUTTER_APP_DIR:-$ROOT/apps/flutter_sample}"
CACHE_DIR="${ONEUI_CACHE_DIR:-$APP_DIR/.oneui_cached}"

cd "$APP_DIR"
flutter pub get
dart run ui_flutter:oneui_sync_brands --cache-dir "$CACHE_DIR"
