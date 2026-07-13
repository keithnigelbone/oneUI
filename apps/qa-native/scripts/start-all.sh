#!/usr/bin/env bash
# start-all.sh — boot Metro + iOS simulator + Android emulator together.
#
# Sequence:
#   1. `expo start --ios` in the background (boots Metro on :8081 and opens
#      the iOS simulator).
#   2. `start-android.sh` waits for Metro to come up, then adb-reverses port
#      8081 and deep-links Expo Go on whatever Android device/emulator is
#      currently connected. If no Android device is connected the step is
#      skipped — iOS keeps running.
#   3. Foregrounds Metro so its logs stream and Ctrl+C cleanly stops both.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${METRO_PORT:-8081}"

# Kill any stale Metro instance on the port so `expo start --ios` boots clean.
# Without this, `expo` errors out with "Port 8081 is running this app in
# another window" when a prior dev run was orphaned.
if STALE_PID="$(lsof -tiTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null)"; then
  if [[ -n "${STALE_PID}" ]]; then
    echo "Port ${PORT} is busy (pid ${STALE_PID}). Killing and continuing..."
    kill -9 ${STALE_PID} 2>/dev/null || true
    # Give the kernel a beat to release the socket.
    sleep 1
  fi
fi

npx expo start --ios &
EXPO_PID=$!

# Run the Android opener but don't kill iOS if no emulator is connected.
if ! bash "${SCRIPT_DIR}/start-android.sh"; then
  echo "warning: Android launch skipped — Metro + iOS will keep running." >&2
fi

# Keep Metro in the foreground so its log output streams to this terminal.
wait "${EXPO_PID}"
