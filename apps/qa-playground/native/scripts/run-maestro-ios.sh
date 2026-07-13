#!/usr/bin/env bash
# run-maestro-ios.sh
#
# Full E2E driver for native component Maestro tests on iOS.
#
# Flow:
#   1. Start Convex local dev backend (bypasses cloud SSL issues in simulator)
#   2. Seed it with brand data
#   3. Start Metro pointing to local Convex
#   4. Launch the dev-client app (auto-connects to Metro)
#   5. Wait for JS bundle + brand theme to load
#   6. Run all Maestro flows (_helpers/_setup.yaml handles the Expo dev-client
#      welcome dialog and navigation to the Components list)
#
# Usage (from repo root):
#   bash apps/qa-playground/native/scripts/run-maestro-ios.sh
#
# Prerequisites:
#   - A booted iOS simulator
#   - com.oneui.nativecomponents installed (run `pnpm dev:native:ios` once)
#   - Maestro CLI (~/.maestro/bin/maestro)
#   - Java 17 (openjdk@17 via Homebrew)

set -euo pipefail

# ── Environment ───────────────────────────────────────────────────────────────
export PATH="/opt/homebrew/opt/openjdk@17/bin:/opt/homebrew/bin:$HOME/.maestro/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export LANG="en_US.UTF-8"
export LC_ALL="en_US.UTF-8"

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../../" && pwd)"
APP_DIR="$REPO_ROOT/apps/native-components-sample"
CONVEX_PKG="$REPO_ROOT/packages/convex"
MAESTRO_FLOWS="$REPO_ROOT/apps/qa-playground/native/e2e/maestro"
RESULTS_DIR="$MAESTRO_FLOWS/test-results"
LOGS_DIR="$REPO_ROOT/apps/qa-playground/native/test-results"
METRO_LOG="$LOGS_DIR/metro.log"
CONVEX_LOG="$LOGS_DIR/convex.log"
EXPO_BIN="$REPO_ROOT/node_modules/.bin/expo"
CONVEX_BIN="$REPO_ROOT/node_modules/.bin/convex"
METRO_PORT=8081
CONVEX_PORT=3210
METRO_PID=""
CONVEX_PID=""
ENV_LOCAL="$APP_DIR/.env.local"
ENV_LOCAL_BAK="$APP_DIR/.env.local.maestro-bak"

# ── Cleanup on exit ────────────────────────────────────────────────────────────
cleanup() {
  echo ""
  if [ -n "$METRO_PID" ] && kill -0 "$METRO_PID" 2>/dev/null; then
    echo "→ Stopping Metro (PID $METRO_PID)..."
    kill "$METRO_PID" 2>/dev/null || true
    lsof -ti tcp:"$METRO_PORT" | xargs kill -9 2>/dev/null || true
  fi
  if [ -n "$CONVEX_PID" ] && kill -0 "$CONVEX_PID" 2>/dev/null; then
    echo "→ Stopping Convex local (PID $CONVEX_PID)..."
    kill "$CONVEX_PID" 2>/dev/null || true
    lsof -ti tcp:"$CONVEX_PORT" | xargs kill -9 2>/dev/null || true
  fi
  # Restore .env.local so the dev environment is unchanged after the test run
  if [ -f "$ENV_LOCAL_BAK" ]; then
    echo "→ Restoring $ENV_LOCAL..."
    mv "$ENV_LOCAL_BAK" "$ENV_LOCAL"
  fi
}
trap cleanup EXIT INT TERM

echo "════════════════════════════════════════════════"
echo "  OneUI Native — Maestro E2E (iOS)"
echo "════════════════════════════════════════════════"

# ── 1. Prerequisites ───────────────────────────────────────────────────────────
if ! command -v maestro &>/dev/null; then
  echo "ERROR: maestro not found. Install: curl -Ls https://get.maestro.mobile.dev | bash"
  exit 1
fi
if ! java -version 2>&1 | grep -qE "17|21"; then
  echo "ERROR: Java 17+ required."
  exit 1
fi

# ── 2. Booted simulator UDID ───────────────────────────────────────────────────
UDID=$(xcrun simctl list devices booted 2>/dev/null \
  | grep -Eo '[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}' \
  | head -1)
if [ -z "$UDID" ]; then
  echo "ERROR: No booted iOS simulator found."
  exit 1
fi
echo "✓ Simulator: $UDID"

# ── 3. Kill stale processes ────────────────────────────────────────────────────
lsof -ti tcp:"$METRO_PORT" | xargs kill -9 2>/dev/null || true
lsof -ti tcp:"$CONVEX_PORT" | xargs kill -9 2>/dev/null || true
sleep 1

# ── 4. Start Convex local dev backend ─────────────────────────────────────────
# Cloud Convex WSS fails in iOS simulator with SSL -9807 errors.
# Local Convex uses plain HTTP so there are no SSL issues.
mkdir -p "$LOGS_DIR"
echo "→ Starting Convex local backend on port $CONVEX_PORT..."
echo "  Log: $CONVEX_LOG"

cd "$CONVEX_PKG"
CI=1 "$CONVEX_BIN" dev --local \
  < /dev/null \
  > "$CONVEX_LOG" 2>&1 &
CONVEX_PID=$!
echo "  Convex PID: $CONVEX_PID"

# ── 5. Wait for Convex to be ready ────────────────────────────────────────────
echo -n "→ Waiting for Convex local"
MAX_WAIT=120
WAITED=0
until curl -sf "http://127.0.0.1:$CONVEX_PORT" >/dev/null 2>&1; do
  if ! kill -0 "$CONVEX_PID" 2>/dev/null; then
    echo ""
    echo "ERROR: Convex process died. Last 20 lines:"
    tail -20 "$CONVEX_LOG"
    exit 1
  fi
  echo -n "."
  sleep 3
  WAITED=$((WAITED + 3))
  if [ "$WAITED" -ge "$MAX_WAIT" ]; then
    echo ""
    echo "ERROR: Convex did not start within ${MAX_WAIT}s."
    tail -20 "$CONVEX_LOG"
    exit 1
  fi
done
# Extra wait for schema + functions to finish deploying
sleep 10
echo ""
echo "✓ Convex local ready (${WAITED}s + 10s deploy)"

# ── 6. Seed brand data ─────────────────────────────────────────────────────────
# Use --url to target the local backend directly (--deployment local requires
# cloud auth which fails without a logged-in session).
echo "→ Seeding brand data..."
cd "$CONVEX_PKG"
"$CONVEX_BIN" run seed:seedDatabase --url "http://127.0.0.1:$CONVEX_PORT" 2>&1 \
  | grep -E "Error|error|brand|Seed|seed|✔|Done" \
  || true
echo "✓ Seed complete"

# ── 7. Patch .env.local to point at local Convex ──────────────────────────────
# Expo's @expo/env loader reads .env.local with higher priority than the shell
# environment, so setting EXPO_PUBLIC_CONVEX_URL inline is not enough.
# We back up .env.local, write the local URL, and restore in the cleanup trap.
echo "→ Patching $ENV_LOCAL for local Convex..."
if [ -f "$ENV_LOCAL" ]; then
  cp "$ENV_LOCAL" "$ENV_LOCAL_BAK"
fi
printf 'EXPO_PUBLIC_CONVEX_URL=http://127.0.0.1:%s\n' "$CONVEX_PORT" > "$ENV_LOCAL"
echo "  EXPO_PUBLIC_CONVEX_URL=http://127.0.0.1:$CONVEX_PORT"

# ── 8. Start Metro ─────────────────────────────────────────────────────────────
# --clear forces Metro to discard its bundle cache so that the fresh
# EXPO_PUBLIC_CONVEX_URL value from .env.local is baked into the served bundle.
# Without --clear, Metro serves a cached delta bundle that still contains
# the old cloud Convex URL and the app connects to the wrong backend.
echo "→ Starting Metro on port $METRO_PORT (Convex: http://127.0.0.1:$CONVEX_PORT)..."
cd "$APP_DIR"
CI=1 "$EXPO_BIN" start \
  --localhost \
  --port "$METRO_PORT" \
  --clear \
  < /dev/null \
  > "$METRO_LOG" 2>&1 &
METRO_PID=$!
echo "  Metro PID: $METRO_PID"

echo -n "→ Waiting for Metro"
MAX_WAIT=90
WAITED=0
until curl -sf "http://127.0.0.1:$METRO_PORT/status" >/dev/null 2>&1; do
  if ! kill -0 "$METRO_PID" 2>/dev/null; then
    echo ""
    echo "ERROR: Metro exited early."
    tail -20 "$METRO_LOG"
    exit 1
  fi
  echo -n "."
  sleep 2
  WAITED=$((WAITED + 2))
  if [ "$WAITED" -ge "$MAX_WAIT" ]; then
    echo ""
    echo "ERROR: Metro did not start within ${MAX_WAIT}s."
    exit 1
  fi
done
echo ""
echo "✓ Metro ready (${WAITED}s)"

# ── 9. Launch app ─────────────────────────────────────────────────────────────
echo "→ Launching app (com.oneui.nativecomponents)..."
xcrun simctl launch "$UDID" com.oneui.nativecomponents > /dev/null 2>&1 || true

# Wait for: full JS bundle download (--clear forces a fresh bundle, not delta) +
# Expo dev-client dialogs (handled by _setup.yaml) + Convex brand data load.
# Fresh bundle on a cold cache takes ~60-90s on the simulator.
echo "→ Waiting 90s for fresh JS bundle + brand theme to load..."
sleep 90

# ── 10. Run Maestro flows ─────────────────────────────────────────────────────
mkdir -p "$RESULTS_DIR"
echo ""
echo "→ Running Maestro flows..."
echo "  Flows : $MAESTRO_FLOWS"
echo "  Results: $RESULTS_DIR/results.xml"
echo ""

MAESTRO_DRIVER_STARTUP_TIMEOUT=180000 \
  maestro --device "$UDID" test "$MAESTRO_FLOWS" \
    --format junit \
    --output "$RESULTS_DIR/results.xml"

echo ""
echo "✓ Maestro run complete."
echo "  Generate HTML report: pnpm qa:native:e2e:report:html"
