#!/usr/bin/env bash
# Creates local android/ + ios/ scaffolding (gitignored) when missing.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d android || ! -d ios ]]; then
  echo "→ Generating android/ and ios/ via flutter create (local-only; not committed)"
  flutter create . --project-name flutter_sample --platforms=android,ios
fi

MANIFEST="$ROOT/android/app/src/main/AndroidManifest.xml"
if [[ -f "$MANIFEST" ]]; then
  python3 - "$MANIFEST" <<'PY'
from pathlib import Path
import sys

manifest = Path(sys.argv[1])
text = manifest.read_text()
perm = '<uses-permission android:name="android.permission.INTERNET"/>'
needle = '<manifest xmlns:android="http://schemas.android.com/apk/res/android">'
if perm not in text and needle in text:
    manifest.write_text(
        text.replace(needle, needle + "\n    " + perm, 1)
    )
    print("→ Added INTERNET permission to AndroidManifest.xml")
PY
fi
