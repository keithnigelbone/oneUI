#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT/../.." && pwd)"
cd "$ROOT"

PORT="${PORT:-5190}"

echo "→ Sync latest test reports to web/qa-reports/"
bash "$ROOT/scripts/sync_reports_to_web.sh"

echo "→ flutter pub get"
flutter pub get

echo ""
echo "Starting Flutter QA Playground on http://localhost:$PORT"
echo "  React web QA playground: pnpm qa-playground  →  http://localhost:5180"
echo "  This Flutter app uses port $PORT on purpose — do not confuse the two."
echo ""
echo "To refresh reports while developing:"
echo "  pnpm qa:flutter:report && bash scripts/sync_reports_to_web.sh"
echo ""

ENV_FILE="$REPO_ROOT/.env.local"
DART_DEFINE_ARGS=()
if [[ -f "$ENV_FILE" ]]; then
  DART_DEFINE_ARGS=(--dart-define-from-file="$ENV_FILE")
  echo "→ Using Convex URL from $ENV_FILE"
else
  echo "⚠ No $ENV_FILE — brand dropdown will show offline hint. Copy .env.local from repo root."
fi

flutter run -d chrome --web-port="$PORT" --web-hostname=localhost "${DART_DEFINE_ARGS[@]}"
