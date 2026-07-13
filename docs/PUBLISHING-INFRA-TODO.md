# Publishing Infra — Remaining Work

This is the **stitch-it-together** checklist for going from "code is on `main`" to "tarballs land in JioDS". Everything below is one-time infra setup that happens outside the repo (Azure portal, GitHub Settings, local machine).

Reference: `docs/PUBLISHING.md` for the workflow / Changesets mechanics.

---

## Status

| Phase | Status | Where |
|---|---|---|
| A. Library readiness (`'use client'`, FOUC, bare-install) | ✅ done | branch `feat/publish-prep-phase-a` |
| B. Staging + rename + ancillary packages (icons, plugins, init) | ✅ done | same branch |
| **C. Azure DevOps + GitHub Actions stitching** | ⬜ this doc | Azure portal + GitHub Settings |
| D. Consumer docs / readmes | 🟡 partial | `packages/ui/README.md` done; `init`/plugins still TODO |
| E. First publish (1.0.0) | ⬜ pending Phase C | via the new workflow |

---

## Phase C — step by step

Each step lists the **owner** (who clicks the buttons) and a **verification** check that proves the step landed.

### C-1. Confirm `@jds4` scope is permitted on the JioDS feed

- **Owner**: Azure DevOps admin (likely the same person who provisioned `@jds/*`).
- **Why this matters first**: existing packages on the feed use the `@jds/*` scope. `@jds4` is a different scope and the feed may have a per-scope allowlist. Without this, all subsequent steps work, but `npm publish` will return a 401/403 at the end.
- **Verification**: ask the admin to confirm in writing, or do a dry publish from your laptop after C-3 / C-4.

If admin pushes back on adding `@jds4`, fallback options (require code change, **not** preferred):
- Reuse `@jds/*` (collides with their existing names).
- Pick another scope they already allow.

If we have to change scope, update `cdn-release-full-pipeline/build/publishConfig.ts` `NAME_MAP` (single source of truth) and re-pack.

### C-2. Create a Personal Access Token

- **Owner**: Anushka (or whoever runs the first publish + owns CI secrets).
- **Where**: https://dev.azure.com/JioSOI/_usersSettings/tokens → **New Token**.
- **Settings**:
  - Name: `oneui-jds4-publish` (any descriptive name)
  - Organization: `JioSOI`
  - Expiration: 1 year max (Azure DevOps cap). Diary a calendar reminder to rotate it ~50 weeks out.
  - Scopes: **Custom defined** → **Packaging** → check `Read, write, & manage`. Uncheck everything else.
- **Copy the token immediately** — Azure DevOps shows it once and never again.
- **Verification**: paste into a scratch file temporarily; you'll use it in C-3 and C-4.

### C-3. Add the PAT to GitHub Actions secrets

- **Owner**: GitHub repo admin.
- **Where**: GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
- **Name**: `AZURE_DEVOPS_PAT`
- **Value**: the **raw** PAT from C-2 (no base64 — the workflow encodes at runtime).
- **Verification**: secret appears in the list. (GitHub never lets you re-view the value.)

### C-4. Set up local `~/.npmrc` (so you can publish from your laptop if needed)

- **Owner**: Anyone who needs local publish access.

```bash
PAT='paste-your-PAT-here'   # do not commit; do not echo to .zsh_history if you can avoid it
B64=$(printf '%s' "$PAT" | base64)

cat > ~/.npmrc <<EOF
@jds4:registry=https://pkgs.dev.azure.com/JioSOI/LayersAI/_packaging/JioDS/npm/registry/
always-auth=true
//pkgs.dev.azure.com/JioSOI/LayersAI/_packaging/JioDS/npm/registry/:username=JioSOI
//pkgs.dev.azure.com/JioSOI/LayersAI/_packaging/JioDS/npm/registry/:_password=$B64
//pkgs.dev.azure.com/JioSOI/LayersAI/_packaging/JioDS/npm/registry/:email=you@ril.com
//pkgs.dev.azure.com/JioSOI/LayersAI/_packaging/JioDS/npm/:username=JioSOI
//pkgs.dev.azure.com/JioSOI/LayersAI/_packaging/JioDS/npm/:_password=$B64
//pkgs.dev.azure.com/JioSOI/LayersAI/_packaging/JioDS/npm/:email=you@ril.com
EOF

chmod 600 ~/.npmrc
```

- **Verification**:

```bash
npm whoami --registry https://pkgs.dev.azure.com/JioSOI/LayersAI/_packaging/JioDS/npm/registry/
# Should print: JioSOI  (or your AD identity).
# If it prints an HTTP 401, the PAT is wrong / not encoded; redo C-2 / C-4.
```

### C-5. Smoke-test the CI workflow in dry-run mode

- **Owner**: Anushka.
- **Where**: GitHub repo → **Actions** → **Release** → **Run workflow**.
- **Inputs**: check **Pack only — do not publish to Azure** (the dry-run toggle).
- **Expected**: workflow runs ~5 min. Final step "Manual publish — dry-run note" prints `ls -la release/tarballs/*.tgz` showing 6 tarballs. Workflow finishes green.
- **Verification**:
  - Workflow status = green.
  - "Artifacts" section of the run page contains `release-tarballs.zip` with the 6 tgz files inside.
  - **No npm publish actually happened** — confirm by browsing the JioDS feed; no `@jds4/*` packages should appear yet.

If C-5 fails:
  - `AZURE_DEVOPS_PAT is empty` error → C-3 wasn't applied. Re-add the secret.
  - `pnpm install` errors → check `pnpm-lock.yaml` is committed (it is).
  - `pack:release` errors → re-run locally with `pnpm pack:release` to repro.

### C-6. Cut the first release (1.0.0) via the Changesets flow

This is the **canonical** path. It exercises the bot end-to-end.

```bash
# 1. On a branch off main (after this PR merges into dev, then dev into main).
git checkout -b chore/first-release main
git pull

# 2. Write a single changeset bumping every publishable package to 1.0.0.
pnpm changeset
#   - Pick: @oneui/ui, @oneui/icons-jio, @oneui/vite-plugin,
#           @oneui/webpack-plugin, @oneui/next-plugin, @oneui/init
#   - Bump each: major
#   - Summary: "Initial public release on JioDS."

git add .changeset
git commit -m "chore: bump to 1.0.0 for first JioDS publish"
git push -u origin chore/first-release
```

- Open a PR `chore/first-release → main`. Review, merge.
- The push to main triggers `release.yml`. The Changesets bot opens a second PR titled **"chore: release packages"** that bumps all six `package.json` files to `1.0.0` and writes `CHANGELOG.md`.
- Review the bot's PR, merge.
- The push to main triggers `release.yml` again. This time `.changeset/*.md` is empty, so the bot runs the publish step which packs and uploads the six 1.0.0 tarballs to JioDS.

- **Verification** (in JioDS feed UI):
  - `@jds4/oneui-react` 1.0.0 visible
  - `@jds4/oneui-icons-jio` 1.0.0 visible
  - `@jds4/oneui-vite-plugin` 1.0.0 visible
  - `@jds4/oneui-webpack-plugin` 1.0.0 visible
  - `@jds4/oneui-next-plugin` 1.0.0 visible
  - `@jds4/oneui-esbuild-plugin` 1.0.0 visible
  - `@jds4/oneui-init` 1.0.0 visible

### C-7. End-to-end consumer install verification

After C-6, do one final smoke test from a **fresh sample app outside this repo** to confirm consumers can install:

```bash
# In a fresh ~/scratch/oneui-consumer dir:
npm init -y
npm config set @jds4:registry https://pkgs.dev.azure.com/JioSOI/LayersAI/_packaging/JioDS/npm/registry/
# Auth comes from your ~/.npmrc (set up in C-4).

npx @jds4/oneui-init  # full happy path
# Pick the framework / set cdnUrl when prompted.
# Confirm install completes; oneui.brands.json is written.
```

If `@jds4/oneui-init` resolves and runs, **the publish pipeline works**.

---

## Phase D — Documentation polish

Largely deferred. The bits still owed to consumers:

- [ ] `packages/init/README.md` — quick "what does `npx @jds4/oneui-init` do" — becomes the init package's npm README.
- [ ] `packages/vite-plugin/README.md`, `packages/webpack-plugin/README.md`, `packages/next-plugin/README.md` — one paragraph + a usage snippet each.
- [ ] `packages/icons-jio/README.md` — "just import for side effects" line.

These aren't blocking. The main `@jds4/oneui-react` README (`packages/ui/README.md`) already covers the full setup including plugin configuration, so a first-time user installing only the main package still has a working path. The per-plugin READMEs are polish that show up on the Azure feed package pages.

---

## Phase E — Known follow-ups (non-blocking)

Things that came up during Phase A/B that we deliberately deferred:

- **`apps/platform/public/jio-icons-data.json` ↔ `packages/icons-jio/src/data.json` duplication.** Same 813 KB JSON in two places. Clean fix: have apps/platform import from the new package and remove the public copy. Worth doing before icons-jio gets too entrenched, but functionally irrelevant.

- **`init`'s `dist/index.mjs` carries a shebang from tsup's banner.** Harmless (JS treats `#!/usr/bin/env node` as a comment) but messy. Split `tsup.config.ts` into two entries so the shebang only lands on `bin.mjs`.

- **Turbopack support for the Next.js plugin.** Currently documented as unsupported because Turbopack doesn't expose Webpack's `beforeCompile` hook. Most prod Next still uses webpack for `next build`, so this only affects `next dev --turbo`. If/when Next exposes a stable bundler-agnostic plugin API, we add a path.

- **First-publish version policy.** Currently planned: jump straight `0.1.0-alpha.0 → 1.0.0` (a major). Alternative: publish as `0.1.0` first (a minor), then `1.0.0` when API has been validated in production. C-6 assumes the major; switch to minor by picking "minor" instead of "major" during `pnpm changeset` if that's preferred.

---

## Rollback / kill switch

If a 1.0.0 publish goes wrong:

- **Single-package unpublish** (Azure DevOps Artifacts only allows unpublish within 72 hours of push):
  ```bash
  npm unpublish @jds4/oneui-react@1.0.0 \
    --registry=https://pkgs.dev.azure.com/JioSOI/LayersAI/_packaging/JioDS/npm/registry/
  ```
- **Beyond 72 hours**: deprecate instead:
  ```bash
  npm deprecate @jds4/oneui-react@1.0.0 "Buggy build — use 1.0.1 instead" \
    --registry=...
  ```
- **Hotfix instead**: bump the patch via `pnpm changeset` (patch), merge through, let the bot publish 1.0.1.

The CDN data is independent — a bad npm publish doesn't affect the CDN brand assets, and vice versa.
