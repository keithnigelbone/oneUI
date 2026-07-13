#!/usr/bin/env bash
#
# Runs golden / visual regression tests and emits a report tagged with the
# `visual` tier so the QA Playground dashboard surfaces them on the
# "Visual Tests" tab.
#
# Usage:
#   bash scripts/run_visual_with_report.sh           # all components
#   bash scripts/run_visual_with_report.sh <slug>    # one component
#
# Outputs (per-slug invocation, slug=button):
#   test-results/components/button-visual.json
#   test-results/components/button-visual-report.html
#   test-results/components/button-visual-summary.json
#   web/qa-reports/components/button-visual-assets/   (PNG trios on failure)
#
# Pixel diff workflow when a test fails:
#   1. `matchesGoldenFile` writes  test/components/<slug>/failures/
#        <basename>_masterImage.png    expected baseline
#        <basename>_testImage.png      pixels this run produced
#        <basename>_maskedDiff.png     diff with matching pixels masked
#        <basename>_isolatedDiff.png   only the differing pixels
#   2. We copy every PNG above into  web/qa-reports/components/<slug>-visual-assets/
#   3. generate-html-report.mts attaches each trio to the matching failed case
#      via the `goldens/<basename>.png` substring in the error message.
#   4. The dashboard renders Expected / Actual / Diff side-by-side under each
#      failed visual case.

set -euo pipefail

# pnpm forwards a literal `--` separator as the first argument when invoked as
# `pnpm <script> -- <args>`. Drop it so the documented `[slug]` arg still works.
if [ "${1:-}" = "--" ]; then
  shift
fi

SLUG="${1:-}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
source "$ROOT/scripts/run_report_generator.sh"
cd "$ROOT"

mkdir -p test-results/components

if [ -n "$SLUG" ]; then
  TARGET="test/components/${SLUG}/${SLUG}_golden_test.dart"
  if [ ! -f "$TARGET" ]; then
    echo "❌ No golden test for slug '$SLUG' (expected $TARGET)" >&2
    exit 1
  fi
  JSON_OUT="test-results/components/${SLUG}-visual.json"
  HTML_OUT="test-results/components/${SLUG}-visual-report.html"
  SUMMARY_OUT="test-results/components/${SLUG}-visual-summary.json"
  REPORT_LABEL="$SLUG (visual)"
  FAILURES_DIR="$ROOT/test/components/${SLUG}/failures"
  ASSETS_DIR_REL="web/qa-reports/components/${SLUG}-visual-assets"
  ASSETS_URL_PREFIX="qa-reports/components/${SLUG}-visual-assets"
else
  # All components: union of every per-slug failures dir gets harder, so for
  # the "all" mode we only collect golden tests with an explicit `_golden_test`
  # suffix.  Per-slug runs are the supported failure-detail flow.
  TARGET="test/components/"
  JSON_OUT="test-results/flutter-visual.json"
  HTML_OUT="test-results/flutter-visual-report.html"
  SUMMARY_OUT="test-results/flutter-visual-summary.json"
  REPORT_LABEL="All components (visual)"
  FAILURES_DIR=""
  ASSETS_DIR_REL=""
  ASSETS_URL_PREFIX=""
fi

# Wipe stale failure PNGs so a passing rerun does not surface yesterday's diff.
if [ -n "$SLUG" ] && [ -d "$FAILURES_DIR" ]; then
  rm -rf "$FAILURES_DIR"
fi

echo "→ flutter pub get"
flutter pub get

echo "→ flutter test goldens → $JSON_OUT"
set +e
if [ -n "$SLUG" ]; then
  flutter test \
    --file-reporter "json:$JSON_OUT" \
    --reporter expanded \
    "$TARGET"
else
  # Filter by `[golden]` group so non-visual tests do not pollute the suite.
  flutter test \
    --file-reporter "json:$JSON_OUT" \
    --reporter expanded \
    --plain-name '[golden]' \
    "$TARGET"
fi
EXIT=$?
set -e

# Always invoke the report generator — even on failure — so the dashboard can
# render the failure case with attached diff PNGs.
echo "→ generate HTML + summary"
ARGS=(
  "$JSON_OUT" "$HTML_OUT" "$SUMMARY_OUT" "$REPORT_LABEL" ""
)
if [ -n "$FAILURES_DIR" ]; then
  # Positional args 7 + 8 + 9: visualFailuresDir, visualAssetsUrl, visualAssetsOutDir.
  ARGS+=("$FAILURES_DIR" "$ASSETS_URL_PREFIX" "$ROOT/$ASSETS_DIR_REL")
fi
REPORT_EXIT=0
run_report_generator "${ARGS[@]}" || REPORT_EXIT=$?

bash "$ROOT/scripts/sync_reports_to_web.sh"

echo ""
if [ "$EXIT" -eq 0 ]; then
  echo "✓ Visual tests passed"
  echo "  HTML:    $HTML_OUT"
  echo "  Summary: $SUMMARY_OUT"
else
  echo "✗ Visual tests failed (exit $EXIT)"
  echo "  HTML:    $HTML_OUT"
  if [ -n "$ASSETS_DIR_REL" ]; then
    echo "  Diff assets: $ASSETS_DIR_REL"
  fi
fi

if [ "$REPORT_EXIT" -ne 0 ]; then
  echo "WARNING: HTML/summary report generation failed (exit $REPORT_EXIT)." >&2
  echo "         Run 'pnpm install' at the repo root if tsx is missing." >&2
fi

exit "$EXIT"
