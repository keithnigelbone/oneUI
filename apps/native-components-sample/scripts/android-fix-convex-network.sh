#!/usr/bin/env bash
# Fix Android emulator Convex connectivity (corporate DNS + SSL).
# 1. Maps convex.cloud hostname when emulator DNS cannot resolve external hosts.
# 2. adb reverse for optional local Convex (EXPO_PUBLIC_CONVEX_URL_ANDROID=http://127.0.0.1:3210).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${CONVEX_CLOUD_HOST:-robust-stoat-734.convex.cloud}"
IP="${CONVEX_CLOUD_IP:-}"

if [[ -z "$IP" ]]; then
  IP="$(python3 -c "import socket; print(socket.gethostbyname('${HOST}'))" 2>/dev/null || true)"
fi

if [[ -z "$IP" ]]; then
  echo "Could not resolve ${HOST} on the Mac. Set CONVEX_CLOUD_IP and re-run." >&2
  exit 1
fi

export ANDROID_HOME="${ANDROID_HOME:-${HOME}/Library/Android/sdk}"
export PATH="${ANDROID_HOME}/platform-tools:${PATH}"

if ! adb devices | grep -q 'device$'; then
  echo "No Android device/emulator connected." >&2
  exit 1
fi

echo "→ adb reverse tcp:3210 tcp:3210 (local Convex optional)"
adb reverse tcp:3210 tcp:3210 2>/dev/null || true

echo "→ Disabling private DNS on emulator (can block corporate resolution)"
adb shell settings put global private_dns_mode off 2>/dev/null || true

echo "→ Mapping ${HOST} → ${IP} in emulator /etc/hosts"
if adb root 2>/dev/null | grep -q adbd; then
  adb wait-for-device
  adb shell "grep -q '${HOST}' /etc/hosts 2>/dev/null || echo '${IP} ${HOST}' >> /etc/hosts" 2>/dev/null || \
    adb shell "su 0 sh -c \"grep -q '${HOST}' /etc/hosts || echo '${IP} ${HOST}' >> /etc/hosts\"" 2>/dev/null || \
    echo "  (Could not write /etc/hosts — use EXPO_PUBLIC_CONVEX_URL_ANDROID=http://127.0.0.1:3210 + local Convex)"
else
  echo "  (adb root unavailable — use EXPO_PUBLIC_CONVEX_URL_ANDROID=http://127.0.0.1:3210 + npx convex dev)"
fi

CERT="${ROOT}/assets/certs/corporate-root.crt"
if [[ -f "$CERT" ]]; then
  echo "→ Installing corporate root CA from assets/certs/corporate-root.crt"
  adb push "$CERT" /sdcard/Download/corporate-root.crt 2>/dev/null || true
  echo "  Open emulator: Settings → Security → Install a certificate → CA certificate"
fi

echo ""
echo "Done. Rebuild the dev client after native SSL changes:"
echo "  pnpm --filter @oneui/native-components-sample android"
echo "Then: pnpm --filter @oneui/native-components-sample android:metro"
echo ""
echo "If hostname resolution still fails, cold-boot the AVD with explicit DNS, e.g.:"
echo "  emulator -avd <name> -dns-server 8.8.8.8,8.8.4.4"
