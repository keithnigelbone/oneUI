#!/usr/bin/env bash
# Corporate SSL blocks foojay JDK downloads — point Gradle at Android Studio JBR (JDK 21).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RN_GRADLE="${ROOT}/../../node_modules/@react-native/gradle-plugin"
JBR="/Applications/Android Studio.app/Contents/jbr/Contents/Home"

sed_in_place() {
  if sed --version >/dev/null 2>&1; then
    sed -i "$@"
  else
    sed -i '' "$@"
  fi
}

if [[ ! -d "$RN_GRADLE" ]]; then
  exit 0
fi

JDK_HOME="${JAVA_HOME:-}"
if [[ -z "$JDK_HOME" && -d "$JBR" ]]; then
  JDK_HOME="$JBR"
fi
if [[ -z "$JDK_HOME" ]]; then
  exit 0
fi

cat > "${RN_GRADLE}/gradle.properties" <<EOF
org.gradle.java.home=${JDK_HOME}
org.gradle.java.installations.auto-download=false
org.gradle.java.installations.paths=${JDK_HOME}
org.gradle.java.installations.fromEnv=JAVA_HOME
EOF

SETTINGS="${RN_GRADLE}/settings.gradle.kts"
if grep -q 'foojay-resolver-convention' "$SETTINGS" 2>/dev/null && \
   ! grep -q 'Disabled: corporate SSL' "$SETTINGS" 2>/dev/null; then
  sed_in_place 's/^plugins { id("org.gradle.toolchains.foojay-resolver-convention").*$/\/\/ Disabled: corporate SSL - &/' "$SETTINGS"
fi

find "$RN_GRADLE" -name 'build.gradle.kts' -print0 2>/dev/null | while IFS= read -r -d '' f; do
  sed_in_place 's/jvmToolchain(17)/jvmToolchain(21)/g' "$f"
done
