#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
source "$ROOT/scripts/run_report_generator.sh"

mkdir -p test-results

echo "→ flutter pub get"
flutter pub get

JSON_OUT="test-results/flutter-all.json"
HTML_OUT="test-results/flutter-report.html"
SUMMARY_OUT="test-results/flutter-summary.json"

echo "→ flutter test (JSON → $JSON_OUT)"
set +e
flutter test \
  --file-reporter "json:$JSON_OUT" \
  --reporter expanded \
  test/
EXIT=$?
set -e

echo "→ generate HTML + summary (React-style report)"
REPORT_EXIT=0
run_report_generator "$JSON_OUT" "$HTML_OUT" "$SUMMARY_OUT" "All Components" \
  || REPORT_EXIT=$?

bash "$ROOT/scripts/sync_reports_to_web.sh"

echo ""
if [ "$EXIT" -eq 0 ]; then
  echo "✓ All tests passed"
  echo "  HTML:    $HTML_OUT"
  echo "  Summary: $SUMMARY_OUT"
else
  echo "✗ Tests failed (exit $EXIT)"
  echo "  HTML:    $HTML_OUT"
fi

if [ "$REPORT_EXIT" -ne 0 ]; then
  echo "WARNING: HTML/summary report generation failed (exit $REPORT_EXIT)." >&2
  echo "         Run 'pnpm install' at the repo root if tsx is missing." >&2
fi

exit "$EXIT"
