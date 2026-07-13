#!/usr/bin/env bash
#
# Builds a debug or release APK (same Gradle pipeline as integration tests).
#
# Usage:
#   bash scripts/build_apk.sh              # debug APK (default)
#   bash scripts/build_apk.sh release      # release APK
#   bash scripts/build_apk.sh debug install emulator-5554
#
# Output:
#   build/app/outputs/flutter-apk/app-debug.apk
#   build/app/outputs/flutter-apk/app-release.apk
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT/../.." && pwd)"
cd "$ROOT"

MODE="${1:-debug}"
INSTALL_DEVICE=""

if [[ "${2:-}" == "install" ]]; then
  INSTALL_DEVICE="${3:-${INSTALL_DEVICE:-}}"
fi

bash "$ROOT/scripts/ensure_mobile_platforms.sh"

echo "→ flutter pub get"
flutter pub get

DEVICE_ARG="${INSTALL_DEVICE:-}"
# shellcheck source=mobile_dart_defines.sh
source "$ROOT/scripts/mobile_dart_defines.sh"

case "$MODE" in
  debug)
    echo "→ flutter build apk --debug"
    flutter build apk --debug "${DART_DEFINE_ARGS[@]}"
    APK="$ROOT/build/app/outputs/flutter-apk/app-debug.apk"
    ;;
  release)
    echo "→ flutter build apk --release"
    flutter build apk --release "${DART_DEFINE_ARGS[@]}"
    APK="$ROOT/build/app/outputs/flutter-apk/app-release.apk"
    ;;
  *)
    echo "Usage: bash scripts/build_apk.sh [debug|release] [install <device-id>]" >&2
    exit 1
    ;;
esac

echo ""
echo "✓ APK: $APK"

if [[ -n "$INSTALL_DEVICE" ]]; then
  echo "→ flutter install -d $INSTALL_DEVICE"
  flutter install -d "$INSTALL_DEVICE" "${DART_DEFINE_ARGS[@]}"
fi
