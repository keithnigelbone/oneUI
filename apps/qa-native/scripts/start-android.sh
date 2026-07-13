#!/usr/bin/env bash
# start-android.sh — open the qa-native dev URL on a running Android emulator
# or device.
#
# Why this exists: `expo start --android` prompts to upgrade Expo Go when the
# installed version differs from the SDK's recommendation, and the prompt is
# non-interactive-hostile (errors out under pnpm even with CI=1 or piped
# stdin). This script sidesteps the prompt by talking to the device via adb
# directly — Metro must already be running (`pnpm dev`).
#
# Usage:
#   pnpm --filter @oneui/qa-native dev          # in one terminal — boots Metro
#   pnpm --filter @oneui/qa-native android      # in another terminal — opens app

set -euo pipefail

PORT="${METRO_PORT:-8081}"
DEV_URL="exp://127.0.0.1:${PORT}"
WAIT_SECONDS="${METRO_WAIT_SECONDS:-60}"

if ! command -v adb >/dev/null 2>&1; then
  echo "error: adb not found on PATH. Install Android platform-tools or add it to PATH." >&2
  exit 1
fi

if [[ -z "$(adb devices | awk 'NR>1 && $2=="device" {print $1}')" ]]; then
  echo "error: no Android device/emulator connected (\`adb devices\` is empty)." >&2
  echo "Start an emulator first, e.g.:" >&2
  echo "  ~/Library/Android/sdk/emulator/emulator -avd Pixel_9_Pro_XL &" >&2
  exit 1
fi

echo "Waiting up to ${WAIT_SECONDS}s for Metro on :${PORT}..."
for ((i = 0; i < WAIT_SECONDS; i++)); do
  if lsof -tiTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! lsof -tiTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "error: Metro is not running on :${PORT}. Start it with: pnpm --filter @oneui/qa-native dev" >&2
  exit 1
fi

adb reverse tcp:"${PORT}" tcp:"${PORT}" >/dev/null
adb shell am start -a android.intent.action.VIEW -d "${DEV_URL}" >/dev/null
echo "Launched ${DEV_URL} on Android device."
