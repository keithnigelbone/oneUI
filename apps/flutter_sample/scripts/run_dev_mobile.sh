#!/usr/bin/env bash
#
# Launches the Flutter Sample App on iOS Simulator or Android emulator/device.
# Mirrors qa-playground-flutter/scripts/run_dev_mobile.sh.
#
# Usage:
#   bash scripts/run_dev_mobile.sh              # auto-pick first mobile device
#   bash scripts/run_dev_mobile.sh <device-id>  # explicit device
#   DEVICE=iphone bash scripts/run_dev_mobile.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT/../.." && pwd)"
cd "$ROOT"

bash "$ROOT/scripts/ensure_mobile_platforms.sh"

DEVICE_ARG="${1:-${DEVICE:-}}"

echo "→ flutter pub get"
flutter pub get

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
  echo "  flutter emulators --launch apple_ios_simulator"
  echo "  flutter emulators --launch Pixel_9_Pro_XL"
  exit 1
fi

# shellcheck source=mobile_dart_defines.sh
source "$ROOT/scripts/mobile_dart_defines.sh"

echo ""
echo "Starting Flutter Sample App on $DEVICE_ARG  (platform: ${DEVICE_PLATFORM:-unknown})"
echo "  Web sample: pnpm flutter:sample:web → http://localhost:5200"
echo ""
echo "Hot reload: r   Hot restart: R   Quit: q"
echo ""

flutter run -d "$DEVICE_ARG" "${DART_DEFINE_ARGS[@]}"
