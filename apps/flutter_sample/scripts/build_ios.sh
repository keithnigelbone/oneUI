#!/usr/bin/env bash
#
# Builds iOS via Xcode (same pipeline as integration tests on iOS).
#
# Usage:
#   bash scripts/build_ios.sh                    # debug, simulator (no codesign)
#   bash scripts/build_ios.sh release              # release, device bundle (no codesign)
#   bash scripts/build_ios.sh debug run "iPhone 17 Pro"
#
# Output:
#   build/ios/iphonesimulator/Runner.app   (simulator debug)
#   build/ios/iphoneos/Runner.app          (device release, unsigned)
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT/../.." && pwd)"
cd "$ROOT"

MODE="${1:-debug}"
ACTION="${2:-build}"
RUN_DEVICE="${3:-${DEVICE:-}}"

bash "$ROOT/scripts/ensure_mobile_platforms.sh"

echo "→ flutter pub get"
flutter pub get

DEVICE_ARG="${RUN_DEVICE:-}"
# shellcheck source=mobile_dart_defines.sh
source "$ROOT/scripts/mobile_dart_defines.sh"

case "$MODE" in
  debug)
    if [[ "$ACTION" == "run" ]]; then
      if [[ -z "$RUN_DEVICE" ]]; then
        RUN_DEVICE=$(flutter devices --machine 2>/dev/null \
          | python3 -c "import json,sys; d=json.load(sys.stdin); m=[x for x in d if x.get('targetPlatform','')=='ios']; print(m[0]['id'] if m else '')" \
          || true)
      fi
      if [[ -z "$RUN_DEVICE" ]]; then
        echo "❌ No iOS simulator/device found. Run: flutter emulators --launch apple_ios_simulator" >&2
        exit 1
      fi
      echo "→ flutter run -d $RUN_DEVICE"
      flutter run -d "$RUN_DEVICE" "${DART_DEFINE_ARGS[@]}"
    else
      echo "→ flutter build ios --debug --simulator"
      flutter build ios --debug --simulator "${DART_DEFINE_ARGS[@]}"
      echo ""
      echo "✓ Simulator app: $ROOT/build/ios/iphonesimulator/Runner.app"
      echo "  Open ios/Runner.xcworkspace in Xcode to run on a simulator, or:"
      echo "  bash scripts/build_ios.sh debug run \"iPhone 17 Pro\""
    fi
    ;;
  release)
    echo "→ flutter build ios --release --no-codesign"
    flutter build ios --release --no-codesign "${DART_DEFINE_ARGS[@]}"
    echo ""
    echo "✓ Device bundle: $ROOT/build/ios/iphoneos/Runner.app"
    echo "  Open ios/Runner.xcworkspace in Xcode, select a team, and Archive for TestFlight/App Store."
    ;;
  *)
    echo "Usage: bash scripts/build_ios.sh [debug|release] [build|run] [device-id]" >&2
    exit 1
    ;;
esac
