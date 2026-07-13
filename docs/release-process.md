# Release Process

How to cut and publish a new `@jds4/*` version to the JIO-DS-ONE-UI Azure Artifacts feed.

## Branch model

- **`dev`** — integration. All PRs land here. Never published.
- **`main`** — release branch. Only updated via release-branch PRs from `dev`. Every commit on `main` corresponds to a published tag.
- **`release/<version>`** — short-lived branch cut from `main`, merges `dev` in, contains the version bump. Deleted after merge.
- **Tags** (`v<version>`) — immutable record of what was published. Pipeline clones from tags.

Mental model:

```
dev  ────●───●───●───●───●───●───●──────────►
          \                       \
           ●(release/alpha.1)      ●(release/alpha.2)
            \                       \
main ────────●───────────────────────●─────►
             │                       │
             tag v0.1.0-alpha.1      tag v0.1.0-alpha.2
```

## Publishable packages

Seven packages bump in lockstep so cross-package workspace deps resolve coherently:

- `packages/ui`
- `packages/icons-jio`
- `packages/init`
- `packages/esbuild-plugin`
- `packages/next-plugin`
- `packages/vite-plugin`
- `packages/webpack-plugin`

## Steps

### 1. Cut the release branch

```bash
git checkout main && git pull origin main
git fetch origin dev
git checkout -b release/0.1.0-alpha.N
git merge origin/dev   # fetch right before merging — dev moves fast
```

### 2. Bump versions

In each of the 7 `package.json` files above, change `"version"` to the new value.

```bash
for f in packages/{esbuild-plugin,icons-jio,init,next-plugin,ui,vite-plugin,webpack-plugin}/package.json; do
  sed -i '' 's/"version": "0.1.0-alpha.PREV"/"version": "0.1.0-alpha.N"/' "$f"
done
git diff --stat   # should show exactly 7 files, 7+/7- lines
```

### 3. Local validation

```bash
pnpm install
pnpm typecheck
pnpm check:literals
pnpm validate:tokens
pnpm test
pnpm pack:all --slug=jio   # mirrors what the pipeline runs
```

### 4. Commit and push

```bash
git commit -am "chore(release): bump publishable packages to 0.1.0-alpha.N"
git push -u origin release/0.1.0-alpha.N
```

### 5. Open PR

- Base: `main` ← Compare: `release/0.1.0-alpha.N`
- Title: `chore(release): 0.1.0-alpha.N`
- Body: list which PRs are included since the previous release
- **Merge with a merge commit, NOT squash** — squashing breaks the back-merge to dev and loses authorship of all the included PRs.

GitHub Actions checks may show as failed (Actions are disabled for this repo); the relevant validation runs locally and in the Azure pipeline.

### 6. Tag the merge commit

```bash
git checkout main && git pull origin main
git tag v0.1.0-alpha.N   # tags HEAD (the merge commit)
git push origin v0.1.0-alpha.N
```

### 7. Dry-run the pipeline

Azure DevOps → `oneui-storybook-pipeline` → `oneui-release-github-azure-artifacts` → **Run pipeline**.

| Field | Value |
| --- | --- |
| Pipeline version | `main` |
| `githubBranch` | `v0.1.0-alpha.N` (the tag) |
| `dryRun` | ✅ checked |
| `brandCssArgs` | `--slug=jio` |

Wait for green. Download the `release-tarballs` artifact, confirm 7 `.tgz` files with the new version in their names.

### 8. Publish

Re-run the same pipeline with `dryRun` unchecked. Everything else stays the same.

Verify in Azure Artifacts (JIO-DS-ONE-UI feed) that `@jds4/oneui-react@0.1.0-alpha.N` (and the other 6) appear under the `alpha` dist-tag.

### 9. Back-merge to dev

```bash
git checkout dev && git pull origin dev
git merge main
git push origin dev
```

This brings the version bump and the release merge commit onto `dev` so future release branches start from the right baseline.

## Hotfixes

When a published version needs an urgent fix:

```bash
git checkout main && git pull
git checkout -b hotfix/<short-desc> v0.1.0-alpha.N
# fix, bump version to 0.1.0-alpha.(N+1)
# PR to main, merge, tag, publish (steps 4–8)
git checkout dev && git pull && git merge main && git push   # back-merge
```

## Rules

- Never commit directly to `main`. Release-branch PRs only.
- Always back-merge `main → dev` after tagging. Otherwise `dev/package.json` versions silently drift behind what's published.
- Don't reuse a release branch. If `alpha.N` needs another commit before publishing, cut a fresh `release/0.1.0-alpha.(N+1)`. Tags are immutable; treat the branches leading to them the same way.
- Always `git fetch origin dev` immediately before merging dev into the release branch — dev moves fast.
- Publish runs are the only irreversible step. Dry-run first, every time.
