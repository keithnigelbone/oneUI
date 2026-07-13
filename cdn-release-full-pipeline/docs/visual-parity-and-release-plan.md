# Plan: Storybook ↔ CDN consumer visual parity + CDN layout + single tarball

This document maps **your three goals** to **what is already done**, **what is still pending**, and **which scripts to run**. It is the checklist for “no drift” between Storybook and an app that installs **`@oneui/ui` tarball** + pulls **brand artefacts from the CDN**.

---

## Goal 1 — No visual drift (Storybook vs tarball + CDN)

**Definition of “parity”** (practical, not magical):

- Same **brand revision** (same Convex snapshot baked into `cdn-dist` / uploaded CDN).
- Same **foundation + component CSS** path as the consumer: `import '@oneui/ui/styles'` (tarball `dist/ui.css` includes prepended `foundation.css` after `pack:release`).
- Same **brand CSS** file the plugin cached for that slug (selector-scoped `[data-brand][data-theme]`).
- Same **runtime shells** where Storybook has them: `BrandProvider` (+ sidecars), `IconProvider`, `data-theme` / density / `data-Breakpoint` on `<html>` when you expect dimension tokens to match.
- Same **component usage** (variants, `Surface` wrappers, etc.).

**Already in place (high level)**

- CDN path: CSS + `decorations.json` + `themeConfig.json` + `branding.json` + optional `fonts.json` (see Goal 2).
- `BrandProvider` wires foundation, logo context, fonts hook, decorations, dimension sync.
- A **local/out-of-repo Vite consumer** (same `oneui.brands.json` contract as `oneui.brands.json.example`) as an optional parity lab vs Storybook.
- `@oneui/vite-plugin` resilient to missing CDN (warn, don’t crash Vite).

### Pending (Goal 1)

| Priority | Item | Why it matters |
|----------|------|----------------|
| P0 | **Pin or document “same bake”** | Storybook can use **live Convex**; CDN is a **point-in-time bake**. Drift is guaranteed if Convex moves and CDN does not. **Policy:** tag bake with git SHA + Convex deploy time in `manifest.json` or release notes; consumer `oneui.brands.json` uses a **pinned version** when you care about pixel-stable releases. |
| P0 | **Automated parity gate (minimal)** | Manual eyeballing does not scale. **Next step:** one Playwright (or Chromatic) job that renders the **same component matrix** twice: (A) Storybook URL or static build, (B) a tarball+CDN consumer app (same slug / bake) — same viewport, theme, density. Fail on perceptual diff above threshold *or* on token snapshot mismatch. |
| P1 | **Shared `generateBrandCSS` path** | Today `useBrandCSS` (runtime) and `build-brand-css.ts` (Node) **duplicate composition order**. Any future edit risks **subtle drift**. **Next step:** extract one pure `generateBrandCSS(...)` used by both (see follow-ups in [`PLAN-v3-clean.md`](./PLAN-v3-clean.md)). |
| P1 | **“Parity matrix” doc** | Table: component × Storybook-only deps (Convex decorators, custom loaders, etc.) × CDN requirement. Reduces surprises (e.g. live-only data). |
| P2 | **Chromatic / design review** | Optional second line of defence for marketing-critical components. |

**Exit criterion for Goal 1:** CI job green on the parity suite + documented bake pinning policy.

---

## Goal 2 — `build-brand-css` output = exactly what goes on the CDN

**Contract (per slug directory on the CDN)**

Each `brands/<slug>/` should contain (as produced today by `cdn-release-full-pipeline/build/build-brand-css.ts`):

| File | Required | Purpose |
|------|----------|---------|
| `<version>.css` + `latest.css` | Yes | Scoped brand + overrides (+ ornaments as CSS where emitted). |
| `decorations.json` | Yes (may be `[]`) | `DecorationProvider` / Button ornaments. |
| `themeConfig.json` | Yes (may be `null`) | `BrandFoundationProvider` / Surface step bridge. |
| `branding.json` | Yes | `BrandLogoContext` / `Logo`. |
| `fonts.json` | Optional | `useBrandFonts` when uploads / non-import fonts exist. |
| `manifest.json` | Yes | Ops metadata (`*Url`, `*Bytes`, hash, etc.). |

Top-level `cdn-dist/brands/manifest.json` indexes slugs for ops.

### Pending (Goal 2)

| Priority | Item | Why it matters |
|----------|------|----------------|
| P0 | **`pnpm validate:cdn-dist` (or extend `validate:tokens`)** | Script that **walks `cdn-dist/brands/*/``** and asserts: required files exist, JSON parses, `themeConfig` has `appearances` when non-null, CSS size & token sanity soft limits. **Fails CI** if folder is incomplete (prevents bad uploads). |
| P0 | **Upload checklist in runbook** | Single markdown for S3/static host: “upload entire `brands/<slug>/` folder, preserve paths, gzip optional, cache headers.” |
| P1 | **Diff harness: Storybook export vs `latest.css`** | Not byte-identical (Storybook injects differently), but **token-level** or **scoped-block** subset diff catches missing slices (e.g. missing component overrides). |
| P1 | **Synth / real brand matrix in CI** | Run `build-brand-css --real-only` (or subset) on schedule to catch Convex schema drift. |
| P2 | **Hash attestation** | Plugin already computes hash; extend manifest + plugin verify optional. |

**Exit criterion for Goal 2:** validator green on artefact folder; runbook signed off by whoever owns the CDN bucket.

---

## Goal 3 — One script that produces the **tarball(s)**

**Today (already in repo)**

| Script | What it does |
|--------|----------------|
| **`pnpm pack:release`** | Runs `cdn-release-full-pipeline/build/pack-release.ts`: builds `@oneui/ui` + `@oneui/vite-plugin`, **prepends `foundation.css` → `dist/ui.css`**, then **`pnpm pack`** → **`release/*.tgz`**. **Does not** build brand CSS or `cdn-dist`. |
| **`pnpm pack:all`** | Runs `cdn-release-full-pipeline/build/build-all.ts`: **foundation** → **brand-css (`cdn-dist`)** → **bake-jio-fallback** → **`pack:release`**. This is the **full “CDN + tarballs”** orchestrator from one command. |

So:

- **“Only tarballs”** → use **`pnpm pack:release`** (after `foundation.css` exists — error message tells you to run foundation or `pack:all`).
- **“Tarballs + everything that feeds CDN + jio bootstrap”** → use **`pnpm pack:all`** (already the single orchestrator).

### Pending (Goal 3)

| Priority | Item | Why it matters |
|----------|------|----------------|
| P1 | **Rename / alias for clarity** | Many people hear “one script” and expect **one npm name**. Optional: add `pnpm release:tarballs` → `pack:release` and `pnpm release:full` → `pack:all` in root `package.json` (docs-only if you prefer no alias). |
| P1 | **Optional: merge validator into `pack:all`** | After `build-brand-css`, run **`validate:cdn-dist`** so broken folders never ship with a green pack. |
| P2 | **Changesets / version bump** | Tarballs need version bumps for consumers; orthogonal to build scripts but part of “release”. |

**Exit criterion for Goal 3:** Documented “golden command” for your team (`pack:all` vs `pack:release`) + optional validator hook.

---

## Suggested order of execution

1. **Goal 2 — Validator** on `cdn-dist` (fast, prevents bad CDN drops).
2. **Goal 2 — Runbook** for upload layout (unblocks ops).
3. **Goal 3 — Document** `pack:all` vs `pack:release`; add validator to `pack:all` if desired.
4. **Goal 1 — Parity test** (smallest Playwright or snapshot suite on a consumer app vs Storybook).
5. **Goal 1 — Dedupe `generateBrandCSS`** (larger refactor; reduces long-term drift risk).

---

## Cross-links

- CDN v3 plan: [`PLAN-v3-clean.md`](./PLAN-v3-clean.md) — folder index: [`README.md`](./README.md)
- Pack pipeline source: `cdn-release-full-pipeline/build/build-all.ts`, `cdn-release-full-pipeline/build/pack-release.ts`
- Parity lab: maintain a minimal consumer outside the monorepo; use `oneui.brands.json.example` as the config template.

When this plan is done, **Goal 1** should be enforceable in CI, **Goal 2** should be machine-validated before upload, and **Goal 3** should be a single documented command (`pack:all` today, optionally renamed + validator wired in).
