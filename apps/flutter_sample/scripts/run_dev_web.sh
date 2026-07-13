#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$APP_DIR/../.." && pwd)"
PORT="${PORT:-5200}"

cd "$APP_DIR"
flutter pub get

ENV_FILE="$REPO_ROOT/.env.local"
DART_DEFINES=()
if [[ -f "$ENV_FILE" ]]; then
  DART_DEFINES=(--dart-define-from-file="$ENV_FILE")
  echo "Using Convex URL from $ENV_FILE"
fi

echo "Starting Flutter Sample App on http://localhost:$PORT"
flutter run -d chrome --web-port="$PORT" --web-hostname=localhost "${DART_DEFINES[@]}"
