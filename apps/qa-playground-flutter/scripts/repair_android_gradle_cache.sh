#!/usr/bin/env bash
#
# Repairs Android Gradle / Flutter build failures caused by corrupted caches or
# low disk space.
#
# Symptoms:
#   - NoSuchFileException: .../.gradle/caches/.../gradle-1.0.0.jar
#   - Could not write workspace metadata to .../transforms/.../metadata.bin
#   - java.io.IOException: No space left on device
#
# Usage:
#   bash scripts/repair_android_gradle_cache.sh
#
# Then re-run E2E:
#   pnpm qa:flutter:e2e:report:all -- slider

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MIN_FREE_GB=8

avail_kb="$(df -k /System/Volumes/Data 2>/dev/null | awk 'NR==2 {print $4}')"
if [ -z "$avail_kb" ]; then
  avail_kb="$(df -k . | awk 'NR==2 {print $4}')"
fi
avail_gb=$((avail_kb / 1024 / 1024))

echo "→ Disk free: ~${avail_gb} GB (need ≥ ${MIN_FREE_GB} GB for Android Gradle)"

if [ "$avail_gb" -lt "$MIN_FREE_GB" ]; then
  echo ""
  echo "⚠ Low disk space — clearing rebuildable Flutter + Gradle artifacts..."
  (cd android && ./gradlew --stop) 2>/dev/null || true
  rm -rf build .dart_tool android/.gradle android/.kotlin
  rm -rf "${HOME}/.gradle/caches" "${HOME}/.gradle/daemon"
  rm -rf /opt/homebrew/share/flutter/packages/flutter_tools/gradle/.gradle \
         /opt/homebrew/share/flutter/packages/flutter_tools/gradle/.kotlin 2>/dev/null || true

  avail_kb="$(df -k /System/Volumes/Data 2>/dev/null | awk 'NR==2 {print $4}')"
  if [ -z "$avail_kb" ]; then
    avail_kb="$(df -k . | awk 'NR==2 {print $4}')"
  fi
  avail_gb=$((avail_kb / 1024 / 1024))
  echo "→ Disk free after cleanup: ~${avail_gb} GB"

  if [ "$avail_gb" -lt "$MIN_FREE_GB" ]; then
    echo ""
    echo "❌ Still below ${MIN_FREE_GB} GB free. Free more space before retrying:" >&2
    echo "    • Old Android AVDs: ~/.android/avd  (du -sh ~/.android/avd)" >&2
    echo "    • Xcode DerivedData: ~/Library/Developer/Xcode/DerivedData" >&2
    echo "    • Docker images / unused simulators" >&2
    exit 1
  fi
else
  echo "→ Stopping Gradle daemons"
  (cd android && ./gradlew --stop) 2>/dev/null || true
  echo "→ flutter clean"
  flutter clean
fi

echo "→ flutter pub get"
flutter pub get

echo "→ Rebuilding Android debug APK (refreshes Gradle transforms; first run ~5–10 min)"
cd android
./gradlew assembleDebug --refresh-dependencies

echo ""
echo "✓ Android Gradle cache repaired. Re-run E2E, e.g.:"
echo "    pnpm qa:flutter:e2e:report:all -- slider"
