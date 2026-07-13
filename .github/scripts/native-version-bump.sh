#!/usr/bin/env bash
#
# native-version-bump.sh — detect affected React Native packages, bump their
# versions per a keyword in the latest commit SUBJECT, and commit the result.
#
# Invoked by .github/workflows/native-version-bump.yml. Lives in a file (rather
# than inline in the workflow) so the run log shows only the invocation line,
# not the whole script body.
#
# Reads from the environment (all optional, supplied by the workflow):
#   BUMP_LEVEL_INPUT  workflow_dispatch override: auto|major|minor|patch|none
#   BASE_REF_INPUT    explicit git base ref for the affected diff
#   BEFORE_SHA        github.event.before (previous branch tip)
#   GITHUB_REF_NAME   branch to push the bump commit back to (set by Actions)
#   GITHUB_STEP_SUMMARY  Actions job-summary file (set by Actions)
#
# Version math is PRERELEASE-AWARE (semver pre* semantics):
#   from 0.1.0-alpha.5:  [fix] → 0.1.0-alpha.6   (bump prerelease counter)
#                        [feat] → 0.2.0-alpha.0  (preminor, reset counter)
#                        [breaking] → 1.0.0-alpha.0  (premajor, reset counter)
#   from a stable 1.4.2: [fix] → 1.4.3  [feat] → 1.5.0  [breaking] → 2.0.0

set -euo pipefail

# The only packages this pipeline is allowed to bump.
RN_PACKAGES=(
  "@oneui/ui-native"
  "@oneui/icons-jio-native"
  "@oneui/create-native-app"
)

SUMMARY_FILE="${GITHUB_STEP_SUMMARY:-/dev/null}"

# ── Resolve bump level from the commit SUBJECT (or a manual override) ──────────
# Only the subject line (%s) is scanned — for a squash-merge that is the PR
# title. Scanning the whole body (%B) would false-match a keyword mentioned in
# prose (e.g. this script's own comments).
MANUAL="${BUMP_LEVEL_INPUT:-auto}"
SUBJECT="$(git log -1 --pretty=%s)"
echo "Latest commit subject: $SUBJECT"

if [ "$MANUAL" != "auto" ] && [ -n "$MANUAL" ]; then
  LEVEL="$MANUAL"
  echo "Manual override from workflow_dispatch: $LEVEL"
elif printf '%s' "$SUBJECT" | grep -q '\[breaking\]'; then
  LEVEL="major"
elif printf '%s' "$SUBJECT" | grep -q '\[feat\]'; then
  LEVEL="minor"
elif printf '%s' "$SUBJECT" | grep -q '\[fix\]'; then
  LEVEL="patch"
else
  LEVEL="none"
fi
echo "Resolved bump level: $LEVEL"

if [ "$LEVEL" = "none" ]; then
  echo "No version keyword ([breaking] / [feat] / [fix]) in the subject — nothing to bump."
  echo "No version keyword found in the commit subject — nothing to bump." >> "$SUMMARY_FILE"
  exit 0
fi

# ── Resolve the base ref for Turbo's affected diff ────────────────────────────
ZERO="0000000000000000000000000000000000000000"
if [ -n "${BASE_REF_INPUT:-}" ]; then
  BASE="$BASE_REF_INPUT"
elif [ -n "${BEFORE_SHA:-}" ] && [ "$BEFORE_SHA" != "$ZERO" ] && git cat-file -e "${BEFORE_SHA}^{commit}" 2>/dev/null; then
  BASE="$BEFORE_SHA"
else
  # First push / force push / manual run with no base: fall back to the
  # commit's first parent.
  BASE="HEAD~1"
fi
echo "Affected diff base: $BASE  →  head: HEAD"

# ── Ask Turbo which workspace packages are affected ───────────────────────────
export TURBO_SCM_BASE="$BASE"
export TURBO_SCM_HEAD="HEAD"
AFFECTED_JSON="$(pnpm exec turbo ls --affected --output=json)"
AFFECTED_NAMES="$(printf '%s' "$AFFECTED_JSON" | jq -r '.packages.items[]?.name')"
echo "Affected packages:"
echo "$AFFECTED_NAMES"

bump_version() {
  # Prerelease-aware semver increment (see header for the full mapping).
  local current="$1" level="$2"
  local core="${current%%-*}"
  local pre=""
  case "$current" in
    *-*) pre="${current#*-}" ;;
  esac
  local MA MI PA
  IFS='.' read -r MA MI PA <<< "$core"

  if [ -n "$pre" ]; then
    # Split the prerelease into identifier + trailing counter:
    # "alpha.5" -> preid="alpha", prenum="5".
    local preid prenum
    if [[ "$pre" =~ ^(.+)\.([0-9]+)$ ]]; then
      preid="${BASH_REMATCH[1]}"; prenum="${BASH_REMATCH[2]}"
    else
      preid="$pre"; prenum=""
    fi
    case "$level" in
      patch)
        if [ -n "$prenum" ]; then
          echo "${MA}.${MI}.${PA}-${preid}.$((prenum + 1))"
        else
          echo "${MA}.${MI}.${PA}-${preid}.0"
        fi ;;
      minor) echo "${MA}.$((MI + 1)).0-${preid}.0" ;;
      major) echo "$((MA + 1)).0.0-${preid}.0" ;;
      *) echo "Unknown bump level: $level" >&2; return 1 ;;
    esac
  else
    case "$level" in
      patch) echo "${MA}.${MI}.$((PA + 1))" ;;
      minor) echo "${MA}.$((MI + 1)).0" ;;
      major) echo "$((MA + 1)).0.0" ;;
      *) echo "Unknown bump level: $level" >&2; return 1 ;;
    esac
  fi
}

# ── Bump only the RN packages that are affected ───────────────────────────────
BUMPED_ANY="N"
SUMMARY_ROWS=""

for name in "${RN_PACKAGES[@]}"; do
  # Whole-line match against the affected list.
  if ! printf '%s\n' "$AFFECTED_NAMES" | grep -qxF "$name"; then
    echo "· $name — not affected, skipping"
    continue
  fi

  PKG_PATH="$(printf '%s' "$AFFECTED_JSON" | jq -r --arg n "$name" '.packages.items[] | select(.name==$n) | .path')"
  PKG_JSON="$PKG_PATH/package.json"
  if [ ! -f "$PKG_JSON" ]; then
    echo "::warning::$name is affected but $PKG_JSON not found — skipping"
    continue
  fi

  CURRENT="$(jq -r '.version' "$PKG_JSON")"
  NEW="$(bump_version "$CURRENT" "$LEVEL")"
  echo "✓ $name: $CURRENT → $NEW ($LEVEL)"

  TMP="$(mktemp)"
  jq --arg v "$NEW" '.version = $v' "$PKG_JSON" > "$TMP" && mv "$TMP" "$PKG_JSON"
  git add "$PKG_JSON"

  BUMPED_ANY="Y"
  SUMMARY_ROWS="${SUMMARY_ROWS}| \`${name}\` | ${CURRENT} | ${NEW} |"$'\n'
done

# ── Commit + push back to the current branch ──────────────────────────────────
if [ "$BUMPED_ANY" != "Y" ]; then
  echo "No affected RN packages — nothing to bump."
  echo "No affected RN packages in this change — no version bump." >> "$SUMMARY_FILE"
  exit 0
fi

git config user.name "oneui-ci[bot]"
git config user.email "oneui-ci@noreply.local"

if git diff --cached --quiet; then
  echo "No staged version changes to commit."
  exit 0
fi

export HUSKY=0
git commit -m "chore: bump RN package versions [$LEVEL] [skip ci]"
git push origin "HEAD:${GITHUB_REF_NAME}"

{
  echo "### Native version bump (\`$LEVEL\`)"
  echo ""
  echo "| Package | From | To |"
  echo "| ------- | ---- | -- |"
  printf '%s' "$SUMMARY_ROWS"
} >> "$SUMMARY_FILE"
