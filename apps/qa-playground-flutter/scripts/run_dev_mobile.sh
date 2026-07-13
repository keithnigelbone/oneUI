#!/usr/bin/env bash
#
# Launches the Flutter QA Playground on an iOS Simulator or Android emulator.
# Companion to run_dev_web.sh (which is Chrome-only). Mirrors its behaviour:
#   - syncs the latest test reports into web/qa-reports/ so the catalog UI
#     bundles them as assets (rootBundle fallback when HTTP is unavailable),
#   - runs flutter pub get,
#   - forwards .env.local via --dart-define-from-file (CONVEX_URL etc.),
#   - rewrites localhost -> 10.0.2.2 on Android so the emulator can reach the
#     host's Convex dev server (Android emulator quirk — iOS Simulator shares
#     localhost with the host so no rewrite needed).
#
# Usage:
#   bash scripts/run_dev_mobile.sh                        # catalog, auto-picked device
#   bash scripts/run_dev_mobile.sh <device-id>            # catalog, explicit device
#   bash scripts/run_dev_mobile.sh <device-id> <slug>     # boot straight into <slug>
#   DEVICE=iphone bash scripts/run_dev_mobile.sh          # substring match on device name
#   SLUG=button bash scripts/run_dev_mobile.sh            # boot into component, auto device
#
# Tip: run `flutter emulators --launch <id>` first to boot a sim/emulator.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT/../.." && pwd)"
cd "$ROOT"

DEVICE_ARG="${1:-${DEVICE:-}}"
SLUG_ARG="${2:-${SLUG:-}}"

echo "→ Sync latest test reports to web/qa-reports/ (bundled as Flutter assets)"
bash "$ROOT/scripts/sync_reports_to_web.sh"

echo "→ flutter pub get"
flutter pub get

# Resolve target device. If the user passed nothing, pick the first device that
# is NOT chrome/macOS/web/linux/windows (i.e. an actual mobile target).
if [[ -z "$DEVICE_ARG" ]]; then
  DEVICE_ARG=$(flutter devices --machine 2>/dev/null \
    | python3 -c "import json,sys; d=json.load(sys.stdin); m=[x for x in d if x.get('targetPlatform','') in ('ios','android-arm64','android-arm','android-x64')]; print(m[0]['id'] if m else '')" \
    || true)
fi

if [[ -z "$DEVICE_ARG" ]]; then
  echo ""
  echo "❌ No mobile device detected. Available:"
  flutter devices
  echo ""
  echo "Boot one with:"
  echo "  flutter emulators                              # list"
  echo "  flutter emulators --launch apple_ios_simulator # iOS"
  echo "  flutter emulators --launch Pixel_9_Pro_XL      # Android"
  exit 1
fi

# Detect platform of the chosen device so we can branch Convex URL handling.
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

echo ""
echo "Target device: $DEVICE_ARG  (platform: ${DEVICE_PLATFORM:-unknown})"
echo ""

# Build dart-define arguments. .env.local is the same file used by run_dev_web.sh,
# so the Convex URL stays in sync. On Android emulators we additionally inject a
# rewritten CONVEX_URL that points at 10.0.2.2 instead of localhost / 127.0.0.1.
ENV_FILE="$REPO_ROOT/.env.local"
DART_DEFINE_ARGS=()

if [[ -f "$ENV_FILE" ]]; then
  DART_DEFINE_ARGS+=(--dart-define-from-file="$ENV_FILE")
  echo "→ Using Convex URL from $ENV_FILE"

  # Corporate SSL-inspection proxies (Zscaler, Netskope, Cisco Umbrella) re-sign
  # HTTPS responses with a CA the Android/iOS trust stores do not include, so
  # Dart's HttpClient rejects the handshake with CERTIFICATE_VERIFY_FAILED.
  # Browsers on the host work because the OS keychain trusts the corp CA; the
  # emulator does not. Opt in to a *debug-only*, *Convex-host-only* override.
  # The flag is harmless if no proxy is present and is compiled away in release.
  DART_DEFINE_ARGS+=(--dart-define=ALLOW_INSECURE_TLS=true)
  echo "→ ALLOW_INSECURE_TLS=true (debug-only; trusts corp-signed certs for Convex host only)"

  if [[ "$DEVICE_PLATFORM" == android* ]]; then
    HOST_URL=$(grep -E '^CONVEX_URL=' "$ENV_FILE" | head -1 | cut -d= -f2- || true)
    if [[ -n "$HOST_URL" && ( "$HOST_URL" == *"localhost"* || "$HOST_URL" == *"127.0.0.1"* ) ]]; then
      REWRITTEN="${HOST_URL//localhost/10.0.2.2}"
      REWRITTEN="${REWRITTEN//127.0.0.1/10.0.2.2}"
      echo "→ Android emulator detected — rewriting CONVEX_URL: $HOST_URL → $REWRITTEN"
      # --dart-define wins over --dart-define-from-file when keys collide.
      DART_DEFINE_ARGS+=(--dart-define="CONVEX_URL=$REWRITTEN")
    fi
  fi
else
  echo "⚠ No $ENV_FILE — brand dropdown will show offline hint. Copy .env.local from repo root."
fi

if [[ -n "$SLUG_ARG" ]]; then
  DART_DEFINE_ARGS+=(--dart-define="INITIAL_SLUG=$SLUG_ARG")
  echo "→ Boot directly into component: $SLUG_ARG (--dart-define=INITIAL_SLUG=$SLUG_ARG)"
fi

echo ""
echo "Starting Flutter QA Playground on $DEVICE_ARG"
echo "  React web QA playground: pnpm qa-playground      → http://localhost:5180"
echo "  Flutter web QA playground: pnpm qa-playground:flutter → http://localhost:5190"
echo ""
echo "Hot reload: press 'r'   Hot restart: press 'R'   Quit: press 'q'"
echo ""

flutter run -d "$DEVICE_ARG" "${DART_DEFINE_ARGS[@]}"
