#!/usr/bin/env bash
#
# capture.sh — capture one cropped screenshot per section of each screen.
#
# Navigates with Maestro, scrolls with adb (Android) or xcrun simctl (iOS),
# reads section bounds from `maestro hierarchy`, and crops each section out of
# the screencap (sharp). See capture-crop.mts for details.
#
# Prereqs: Metro running + project loaded in Expo Go on a booted device;
# Maestro CLI + a JDK; adb on PATH for Android OR Xcode CLI tools for iOS.
#
# Usage:
#   bash visual/capture.sh                    # all screens (auto-detects device)
#   bash visual/capture.sh Button             # one (or more) named screens
#   IOS_UDID=<UDID> bash visual/capture.sh    # force specific iOS simulator
set -euo pipefail

export PATH="/opt/homebrew/opt/openjdk@17/bin:/opt/homebrew/bin:$HOME/.maestro/bin:$HOME/Library/Android/sdk/platform-tools:$PATH"
if [ -d "/opt/homebrew/opt/openjdk@17" ]; then
  export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17}"
fi

# ── Auto-detect platform ──────────────────────────────────────────────────────
# Priority: IOS_UDID env > connected Android device > booted iOS simulator.
# We check for an *active* Android device (not just the adb binary) so that
# machines with Android SDK installed but no running emulator fall through to
# iOS automatically.
if [ -z "${IOS_UDID:-}" ]; then
  ANDROID_DEVICE=""
  if command -v adb >/dev/null 2>&1; then
    ANDROID_DEVICE="$(adb devices 2>/dev/null \
      | awk 'NR>1 && /\tdevice$/{print $1; exit}' || true)"
  fi

  if [ -z "${ANDROID_DEVICE}" ]; then
    BOOTED_UDID="$(xcrun simctl list devices booted 2>/dev/null \
      | grep -Eo '[0-9A-F-]{36}' | head -1 || true)"
    if [ -n "${BOOTED_UDID}" ]; then
      export IOS_UDID="${BOOTED_UDID}"
      SIM_NAME="$(xcrun simctl list devices booted 2>/dev/null \
        | grep "${BOOTED_UDID}" | sed 's/ *(.*//' | xargs || echo 'iOS Simulator')"
      echo "Platform: iOS — ${SIM_NAME} (${IOS_UDID})"
    else
      echo "error: No connected Android device and no booted iOS simulator found." >&2
      echo "Start a simulator or connect a device first." >&2
      exit 1
    fi
  fi
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

mkdir -p "$SCRIPT_DIR/screenshots"
node "$REPO_ROOT/node_modules/tsx/dist/cli.mjs" "$SCRIPT_DIR/capture-crop.mts" "$@"
