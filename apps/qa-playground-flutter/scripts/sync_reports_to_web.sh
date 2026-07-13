#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

mkdir -p web/qa-reports/components

if [ -f test-results/flutter-summary.json ]; then
  cp test-results/flutter-summary.json web/qa-reports/flutter-summary.json
  echo "→ synced flutter-summary.json"
fi

if [ -f test-results/flutter-report.html ]; then
  cp test-results/flutter-report.html web/qa-reports/flutter-report.html
  echo "→ synced flutter-report.html"
fi

if [ -f test-results/flutter-e2e-summary.json ]; then
  cp test-results/flutter-e2e-summary.json web/qa-reports/flutter-e2e-summary.json
  echo "→ synced flutter-e2e-summary.json"
fi

if [ -f test-results/flutter-e2e-report.html ]; then
  cp test-results/flutter-e2e-report.html web/qa-reports/flutter-e2e-report.html
  echo "→ synced flutter-e2e-report.html"
fi

if [ -d test-results/components ]; then
  cp -f test-results/components/*.html web/qa-reports/components/ 2>/dev/null || true
  cp -f test-results/components/*-summary.json web/qa-reports/components/ 2>/dev/null || true
  echo "→ synced component HTML + summary JSON reports"
fi

# Visual failure diff PNGs (run_visual_with_report.sh writes these directly into
# web/qa-reports/components/<slug>-visual-assets/ already; nothing to copy here,
# but make sure the dir exists so the dashboard's empty-state path resolves).
if compgen -G "web/qa-reports/components/*-visual-assets" >/dev/null; then
  echo "→ visual diff assets present under web/qa-reports/components/*-visual-assets/"
fi

echo "Reports available under web/qa-reports/"
