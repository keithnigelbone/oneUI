#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${JAVA_HOME:-}" ]]; then
  if [[ -d "/Applications/Android Studio.app/Contents/jbr/Contents/Home" ]]; then
    export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
  elif command -v /usr/libexec/java_home >/dev/null 2>&1; then
    export JAVA_HOME="$(
      /usr/libexec/java_home -v 21 2>/dev/null ||
        /usr/libexec/java_home -v 17 2>/dev/null ||
        /usr/libexec/java_home 2>/dev/null ||
        true
    )"
  fi
fi

if [[ -z "${JAVA_HOME:-}" || ! -x "${JAVA_HOME}/bin/java" ]]; then
  echo "ERROR: JDK 17+ required. Install Android Studio or set JAVA_HOME." >&2
  exit 1
fi

export PATH="${JAVA_HOME}/bin:${PATH}"
export GRADLE_OPTS="${GRADLE_OPTS:-} -Dorg.gradle.java.installations.auto-download=false"
exec "$@"
