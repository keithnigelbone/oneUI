#!/usr/bin/env bash
# start-ios.sh — start Metro then deep-link Expo Go on the booted iOS simulator.
#
# Why this exists: `expo start --ios` fires `xcrun simctl openurl` immediately
# as Metro starts, racing Metro's initialisation and causing a timeout (code 60).
# This script mirrors start-android.sh: boots Metro first, waits for port 8081
# to be listening, then opens the dev URL directly via simctl — no race.
#
# Usage (single command):
#   pnpm --filter @oneui/qa-native ios
#
# Or two-terminal (lets you see Metro logs separately):
#   pnpm --filter @oneui/qa-native dev        # Terminal 1 — Metro
#   pnpm --filter @oneui/qa-native ios:open   # Terminal 2 — open in simulator

set -euo pipefail

PORT="${METRO_PORT:-8081}"
WAIT_SECONDS="${METRO_WAIT_SECONDS:-120}"
DEV_URL="exp://localhost:${PORT}"

# ── 1. Kill any stale Metro on the port ──────────────────────────────────────
if STALE_PID="$(lsof -tiTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null)"; then
  if [[ -n "${STALE_PID}" ]]; then
    echo "Port ${PORT} is busy (pid ${STALE_PID}). Killing stale Metro..."
    kill -9 ${STALE_PID} 2>/dev/null || true
    sleep 1
  fi
fi

# ── 2. Find the booted simulator ─────────────────────────────────────────────
UDID="$(xcrun simctl list devices booted | grep -Eo '[0-9A-F-]{36}' | head -1)"
if [[ -z "${UDID}" ]]; then
  echo "error: No booted iOS simulator found." >&2
  echo "Open Simulator.app first, or run: open -a Simulator" >&2
  exit 1
fi
SIM_NAME="$(xcrun simctl list devices booted | grep "${UDID}" | sed 's/ *(.*//' | xargs)"
echo "Simulator: ${SIM_NAME} (${UDID})"

# ── 3. Start Metro in the background ─────────────────────────────────────────
# Use 'expo start' without --ios so Metro can fully initialise before we
# attempt the URL open.
# --localhost forces Metro to advertise 127.0.0.1 instead of any VPN/Tailscale
# interface that Expo auto-detects, which the simulator cannot route to.
npx expo start --localhost &
EXPO_PID=$!

# ── 4. Wait for Metro to be listening ────────────────────────────────────────
echo "Waiting up to ${WAIT_SECONDS}s for Metro on :${PORT}..."
for ((i = 0; i < WAIT_SECONDS; i++)); do
  if lsof -tiTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Metro ready after ${i}s."
    break
  fi
  sleep 1
done

if ! lsof -tiTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "error: Metro did not start on :${PORT} within ${WAIT_SECONDS}s." >&2
  kill "${EXPO_PID}" 2>/dev/null || true
  exit 1
fi

# Extra settle time — Metro is listening but still compiling the initial bundle.
sleep 3

# ── 5. Open URL in simulator (with retries) ──────────────────────────────────
# Springboard may still be loading even when the simulator shows "Booted".
MAX_RETRIES=5
OPENED=0
for ((r = 0; r < MAX_RETRIES; r++)); do
  if xcrun simctl openurl "${UDID}" "${DEV_URL}" 2>/dev/null; then
    echo "Opened ${DEV_URL} on ${SIM_NAME}."
    OPENED=1
    break
  fi
  echo "simctl openurl attempt $((r+1))/${MAX_RETRIES} failed — retrying in 5s..."
  sleep 5
done

if [[ "${OPENED}" -eq 0 ]]; then
  echo "warning: Could not open URL automatically after ${MAX_RETRIES} attempts." >&2
  echo "Press 'i' in the Metro terminal to retry manually." >&2
fi

# ── 6. Keep Metro in the foreground ──────────────────────────────────────────
wait "${EXPO_PID}"
