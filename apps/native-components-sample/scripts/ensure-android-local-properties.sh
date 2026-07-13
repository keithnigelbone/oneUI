#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROPS="${ROOT}/android/local.properties"
sdk_dir="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"

if [[ -z "$sdk_dir" && -d "${HOME}/Library/Android/sdk" ]]; then
  sdk_dir="${HOME}/Library/Android/sdk"
fi

if [[ -z "$sdk_dir" || ! -d "$sdk_dir" ]]; then
  exit 0
fi

mkdir -p "${ROOT}/android"
cat > "$PROPS" <<EOF
sdk.dir=${sdk_dir}
EOF
