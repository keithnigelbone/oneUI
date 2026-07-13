#!/usr/bin/env bash
#
# Runs integration tests on a connected device and emits e2e report files
# alongside the existing widget-test reports.
#
# Usage:
#   bash scripts/run_e2e_with_report.sh <device-id> [<slug>]
#     - device-id required; e2e tests need a real device (emulator / sim / phone)
#     - optional <slug>: when present, runs only integration_test/<slug>_e2e_test.dart
#                        and writes test-results/components/<slug>-e2e-summary.json
#
# Outputs:
#   test-results/flutter-e2e.json              (raw test JSON)
#   test-results/flutter-e2e-report.html       (standalone HTML report)
#   test-results/flutter-e2e-summary.json      (loaded by the Flutter QA dashboard)
#   test-results/components/<slug>-e2e-summary.json   (when slug is provided)
#
# After running, the Flutter QA Playground component detail page shows the
# "E2E (on-device)" mini stat in the Report panel.

set -euo pipefail

# pnpm forwards a literal `--` separator as the first argument when invoked as
# `pnpm <script> -- <args>`. Drop it so the documented `<device> [slug]` order
# still works in both invocation styles.
if [ "${1:-}" = "--" ]; then
  shift
fi

DEVICE="${1:-}"
SLUG="${2:-}"

if [ -z "$DEVICE" ]; then
  echo "Usage: bash scripts/run_e2e_with_report.sh <device-id> [<slug>]" >&2
  echo "" >&2
  echo "Connected devices:" >&2
  flutter devices >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
source "$ROOT/scripts/run_report_generator.sh"
cd "$ROOT"

mkdir -p test-results/components

if [ -n "$SLUG" ]; then
  # Dart test files use snake_case; the slug arg may be hyphenated to match
  # `run_component.sh`'s convention. Mirror the `${SLUG//-/_}` normalization
  # so e.g. `indicator-badge` resolves to `indicator_badge_e2e_test.dart`.
  # Output filenames keep the original hyphenated slug so dashboard URLs stay
  # consistent with the component-detail page.
  FILE_SLUG="${SLUG//-/_}"
  TARGET="integration_test/${FILE_SLUG}_e2e_test.dart"
  if [ ! -f "$TARGET" ]; then
    echo "❌ No integration test for slug '$SLUG' (expected $TARGET)" >&2
    exit 1
  fi
  JSON_OUT="test-results/components/${SLUG}-e2e.json"
  HTML_OUT="test-results/components/${SLUG}-e2e-report.html"
  SUMMARY_OUT="test-results/components/${SLUG}-e2e-summary.json"
  REPORT_LABEL="$SLUG (e2e)"
else
  TARGET="integration_test/"
  JSON_OUT="test-results/flutter-e2e.json"
  HTML_OUT="test-results/flutter-e2e-report.html"
  SUMMARY_OUT="test-results/flutter-e2e-summary.json"
  REPORT_LABEL="All components (e2e)"
fi

echo "→ flutter pub get"
flutter pub get

# Resolve the device's targetPlatform (android/ios/...) so the generated summary
# can stamp every e2e case with it. The QA dashboard then surfaces Android / iOS
# filter chips on the E2E tab — `flutter test` does NOT inject a `(android)` /
# `(iOS)` suffix into the test name the way `testWidgetsAllPlatforms` does for
# widget tests, so we have to thread the device platform through manually.
_FLUTTER_DEVICES_JSON="$(flutter devices --machine 2>&1)" || true
DEVICE_PLATFORM=""
if [ -n "$_FLUTTER_DEVICES_JSON" ] && printf '%s' "$_FLUTTER_DEVICES_JSON" | python3 -c "import json,sys; json.load(sys.stdin)" 2>/dev/null; then
  DEVICE_PLATFORM=$(printf '%s' "$_FLUTTER_DEVICES_JSON" \
    | python3 -c "
import json,sys
d=json.load(sys.stdin)
arg='''$DEVICE'''
for x in d:
    if x.get('id','')==arg or arg.lower() in x.get('name','').lower():
        print(x.get('targetPlatform','')); break
" \
    || echo "")
else
  echo "⚠ Could not read flutter devices JSON — platform stamp will be empty" >&2
fi

# Normalise: 'ios' → 'ios', 'android-*' → 'android'. Anything else (linux, web,
# darwin) is passed through unchanged and the dashboard treats it as desktop.
case "$DEVICE_PLATFORM" in
  ios) E2E_PLATFORM="ios" ;;
  android-*|android) E2E_PLATFORM="android" ;;
  *) E2E_PLATFORM="$DEVICE_PLATFORM" ;;
esac
echo "→ device targetPlatform: ${DEVICE_PLATFORM:-unknown} → e2e platform: ${E2E_PLATFORM:-unknown}"

echo "→ flutter test integration_test on $DEVICE (JSON → $JSON_OUT)"
echo "   Note: first run builds/installs the app — Android Gradle can take 10–15 min"
echo "   with little console output. This is normal; subsequent runs are faster."
set +e
flutter test \
  --file-reporter "json:$JSON_OUT" \
  --reporter expanded \
  -d "$DEVICE" \
  "$TARGET"
EXIT=$?
set -e

echo "→ generate HTML + summary"
REPORT_EXIT=0
run_report_generator "$JSON_OUT" "$HTML_OUT" "$SUMMARY_OUT" "$REPORT_LABEL" "$E2E_PLATFORM" \
  || REPORT_EXIT=$?

bash "$ROOT/scripts/sync_reports_to_web.sh"

echo ""
if [ "$EXIT" -eq 0 ]; then
  echo "✓ E2E tests passed"
  echo "  HTML:    $HTML_OUT"
  echo "  Summary: $SUMMARY_OUT"
else
  echo "✗ E2E tests failed (exit $EXIT)"
  echo "  HTML:    $HTML_OUT"
fi

if [ "$REPORT_EXIT" -ne 0 ]; then
  echo "WARNING: HTML/summary report generation failed (exit $REPORT_EXIT)." >&2
  echo "         Run 'pnpm install' at the repo root if tsx is missing." >&2
fi

exit "$EXIT"
