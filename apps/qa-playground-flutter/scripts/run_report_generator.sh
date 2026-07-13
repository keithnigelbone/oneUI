#!/usr/bin/env bash
# Shared HTML/summary report generator for flutter_test JSON output.
# Source from other scripts:  source "$(dirname "$0")/run_report_generator.sh"

run_report_generator() {
  local json_out="$1"
  local html_out="$2"
  local summary_out="$3"
  local slug="$4"
  local extra="${5:-}"
  local failures_dir="${6:-}"
  local assets_url="${7:-}"
  local assets_out="${8:-}"

  local script_dir qa_root repo_root tsx_cli
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  qa_root="$(cd "$script_dir/.." && pwd)"
  repo_root="$(cd "$qa_root/../.." && pwd)"
  tsx_cli="$repo_root/node_modules/tsx/dist/cli.mjs"

  if [ ! -f "$tsx_cli" ]; then
    if command -v pnpm >/dev/null 2>&1 && [ -f "$repo_root/package.json" ]; then
      (
        cd "$repo_root"
        pnpm exec tsx "$script_dir/generate-html-report.mts" \
          "$json_out" "$html_out" "$summary_out" "$slug" "$extra" \
          "$failures_dir" "$assets_url" "$assets_out"
      )
      return $?
    fi
    echo "ERROR: tsx is not installed. Run 'pnpm install' at the repo root, then retry." >&2
    return 1
  fi

  node "$tsx_cli" "$script_dir/generate-html-report.mts" \
    "$json_out" "$html_out" "$summary_out" "$slug" "$extra" \
    "$failures_dir" "$assets_url" "$assets_out"
}
