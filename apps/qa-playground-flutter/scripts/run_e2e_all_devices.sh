#!/usr/bin/env bash
#
# Runs integration_test on every connected mobile device (Android + iOS) and
# produces a single merged e2e report. `run_e2e_with_report.sh` already handles
# the per-device run + stamp + merge — this wrapper just iterates over devices.
#
# Usage:
#   bash scripts/run_e2e_all_devices.sh                 # all components, all devices
#   bash scripts/run_e2e_all_devices.sh <slug>          # one component, all devices
#
# Output: same files as run_e2e_with_report.sh, but the e2e suite contains
# cases for every device that ran successfully — the dashboard's Android / iOS
# filter chips then both light up on the E2E tab.
#
# Tip: boot both targets first so they're listed by `flutter devices`:
#   flutter emulators --launch apple_ios_simulator   # iOS
#   flutter emulators --launch Pixel_9_Pro_XL        # Android

set -euo pipefail

# pnpm forwards a literal `--` separator as the first argument when invoked as
# `pnpm <script> -- <args>`. Drop it so the documented `[slug]` arg still
# works in both invocation styles.
if [ "${1:-}" = "--" ]; then
  shift
fi

SLUG="${1:-}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Collect every connected device whose targetPlatform looks like a mobile
# device (Android variant or iOS). Devices for chrome/macos/linux/windows are
# excluded — the integration suite is mobile-only.
#
# `mapfile` would be cleaner but is a bash 4+ builtin — macOS still ships
# bash 3.2 because of the GPLv3 licensing fork. Use a `while read` loop
# instead so the script runs on the stock /bin/bash everyone has.
DEVICE_IDS=()
_FLUTTER_DEVICES_JSON="$(flutter devices --machine 2>&1)" || true
if [ -z "$_FLUTTER_DEVICES_JSON" ] || ! printf '%s' "$_FLUTTER_DEVICES_JSON" | python3 -c "import json,sys; json.load(sys.stdin)" 2>/dev/null; then
  echo "❌ flutter devices failed — Flutter may be broken or disk is full." >&2
  echo "" >&2
  printf '%s\n' "$_FLUTTER_DEVICES_JSON" >&2
  echo "" >&2
  echo "Try freeing disk space, then:" >&2
  echo "    cd apps/qa-playground-flutter && flutter pub get" >&2
  echo "    flutter devices" >&2
  exit 1
fi

while IFS= read -r _id; do
  if [ -n "$_id" ]; then
    DEVICE_IDS+=("$_id")
  fi
done < <(
  printf '%s' "$_FLUTTER_DEVICES_JSON" \
    | python3 -c "
import json, sys
d = json.load(sys.stdin)
for x in d:
    plat = x.get('targetPlatform', '')
    if plat == 'ios' or plat.startswith('android'):
        print(x.get('id', ''))
"
)

if [ "${#DEVICE_IDS[@]}" -eq 0 ]; then
  echo "❌ No mobile devices detected. Boot an emulator / simulator first:" >&2
  echo "    flutter emulators --launch apple_ios_simulator" >&2
  echo "    flutter emulators --launch Pixel_9_Pro_XL" >&2
  echo "" >&2
  flutter devices >&2
  exit 1
fi

echo "→ Targeting ${#DEVICE_IDS[@]} mobile device(s): ${DEVICE_IDS[*]}"
echo ""

OVERALL_EXIT=0
for DEVICE in "${DEVICE_IDS[@]}"; do
  echo "───────────────────────────────────────────────"
  echo "▶ $DEVICE"
  echo "───────────────────────────────────────────────"
  set +e
  if [ -n "$SLUG" ]; then
    bash "$ROOT/scripts/run_e2e_with_report.sh" "$DEVICE" "$SLUG"
  else
    bash "$ROOT/scripts/run_e2e_with_report.sh" "$DEVICE"
  fi
  EXIT=$?
  set -e
  if [ "$EXIT" -ne 0 ]; then
    OVERALL_EXIT="$EXIT"
    echo "⚠ Device $DEVICE returned exit $EXIT — continuing with remaining devices"
  fi
  echo ""
done

if [ "$OVERALL_EXIT" -eq 0 ]; then
  echo "✓ All device runs completed cleanly"
else
  echo "✗ One or more device runs failed (last non-zero exit: $OVERALL_EXIT)"
fi
exit "$OVERALL_EXIT"
