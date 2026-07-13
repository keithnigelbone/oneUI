#!/usr/bin/env bash
set -euo pipefail

# Supports both:
#   pnpm qa:flutter:component checkbox-field
#   pnpm qa:flutter:component -- checkbox-field
SLUG=""
for arg in "$@"; do
  if [ "$arg" = "--" ]; then
    continue
  fi
  if [ -z "$SLUG" ]; then
    SLUG="$arg"
    break
  fi
done

if [ -z "$SLUG" ]; then
  echo "Usage: pnpm qa:flutter:component [--] <component-slug>  e.g. checkbox-field" >&2
  exit 1
fi
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
source "$ROOT/scripts/run_report_generator.sh"

FOLDER="${SLUG//-/_}"
TARGET="test/components/$FOLDER"
if [ ! -d "$TARGET" ]; then
  echo "Unknown component: $SLUG (expected $TARGET)" >&2
  exit 1
fi

flutter pub get
mkdir -p test-results/components

# Wipe stale failure PNGs so a passing rerun does not surface yesterday's diff
# under the Visual Tests tab. The failures dir is recreated by `matchesGoldenFile`
# only when a golden actually fails.
FAILURES_DIR="$ROOT/$TARGET/failures"
if [ -d "$FAILURES_DIR" ]; then
  rm -rf "$FAILURES_DIR"
fi

JSON_OUT="test-results/components/${SLUG}.json"
HTML_OUT="test-results/components/${SLUG}-report.html"
SUMMARY_OUT="test-results/components/${SLUG}-summary.json"
# The dashboard's Visual tile reads from `${SLUG}-visual-summary.json` via
# `_copyWithVisual` in qa_report_summary.dart. If we don't refresh it here,
# the dashboard reports stale visual counts from an earlier
# `run_visual_with_report.sh` invocation. Mirror the main summary so both
# files stay coherent — the main summary already classifies every
# [golden] + [visual] tagged test into the Visual tier via parseTier.
VISUAL_SUMMARY_OUT="test-results/components/${SLUG}-visual-summary.json"

# Visual-assets sink for the Visual Tests tab. The report generator copies any
# failure trio PNGs into ASSETS_DIR_REL and attaches site-rooted URLs to each
# failed [golden] case so the dashboard can render Expected / Actual / Diff.
ASSETS_DIR_REL="web/qa-reports/components/${SLUG}-visual-assets"
ASSETS_URL_PREFIX="qa-reports/components/${SLUG}-visual-assets"

set +e
flutter test \
  --file-reporter "json:$JSON_OUT" \
  --reporter expanded \
  "$TARGET"
EXIT=$?
set -e

# Positional args 7 + 8 + 9 wire visual failure capture
# (visualFailuresDir, visualAssetsUrl, visualAssetsOutDir).
REPORT_EXIT=0
run_report_generator \
  "$JSON_OUT" "$HTML_OUT" "$SUMMARY_OUT" "$SLUG" "" \
  "$FAILURES_DIR" "$ASSETS_URL_PREFIX" "$ROOT/$ASSETS_DIR_REL" \
  || REPORT_EXIT=$?

# Mirror the main summary to the visual-summary path so the dashboard's
# Visual tile picks up the latest [golden] + [visual] tier counts.
if [ -f "$SUMMARY_OUT" ]; then
  cp "$SUMMARY_OUT" "$VISUAL_SUMMARY_OUT"
fi

bash "$ROOT/scripts/sync_reports_to_web.sh"

if [ "$REPORT_EXIT" -ne 0 ]; then
  echo "WARNING: HTML/summary report generation failed (exit $REPORT_EXIT)." >&2
  echo "         Run 'pnpm install' at the repo root if tsx is missing." >&2
fi

exit "$EXIT"
