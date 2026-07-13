#!/usr/bin/env bash
# Shared --dart-define args for mobile run/build (source from other scripts).
# Sets: DART_DEFINE_ARGS (bash array), DEVICE_PLATFORM (when DEVICE_ARG is set).
set -euo pipefail

: "${ROOT:?ROOT must be set before sourcing mobile_dart_defines.sh}"
: "${REPO_ROOT:?REPO_ROOT must be set before sourcing mobile_dart_defines.sh}"

DEVICE_ARG="${DEVICE_ARG:-}"
DEVICE_PLATFORM=""

if [[ -n "$DEVICE_ARG" ]]; then
  DEVICE_PLATFORM=$(flutter devices --machine 2>/dev/null \
    | python3 -c "
import json,sys
d=json.load(sys.stdin)
arg='''$DEVICE_ARG'''
for x in d:
    if x.get('id','')==arg or arg.lower() in x.get('name','').lower():
        print(x.get('targetPlatform','')); break
" \
    || echo "")
fi

ENV_FILE="$REPO_ROOT/.env.local"
DART_DEFINE_ARGS=()

if [[ -f "$ENV_FILE" ]]; then
  DART_DEFINE_ARGS+=(--dart-define-from-file="$ENV_FILE")
  echo "→ Using Convex URL from $ENV_FILE"
  DART_DEFINE_ARGS+=(--dart-define=ALLOW_INSECURE_TLS=true)
  echo "→ ALLOW_INSECURE_TLS=true (debug-only; corp proxy / Convex TLS)"

  if [[ "$DEVICE_PLATFORM" == android* ]]; then
    HOST_URL=$(grep -E '^CONVEX_URL=' "$ENV_FILE" | head -1 | cut -d= -f2- || true)
    if [[ -n "$HOST_URL" && ( "$HOST_URL" == *"localhost"* || "$HOST_URL" == *"127.0.0.1"* ) ]]; then
      REWRITTEN="${HOST_URL//localhost/10.0.2.2}"
      REWRITTEN="${REWRITTEN//127.0.0.1/10.0.2.2}"
      echo "→ Android emulator — rewriting CONVEX_URL: $HOST_URL → $REWRITTEN"
      DART_DEFINE_ARGS+=(--dart-define="CONVEX_URL=$REWRITTEN")
    fi
  fi
else
  echo "⚠ No $ENV_FILE — brand dropdown shows offline hint. Copy from repo root."
fi
