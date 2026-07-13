# Surface Logic Refactor — Handoff

> Status of the surface-logic refactor and the follow-up work still needed on the component side. This document is the single source of truth for the engineering team picking up the remaining work after the author steps away. Read it in full before starting.

## TL;DR for reviewers

- Reference implementation (Jio design engineering's `OneUIColourTool`) defines the canonical surface algorithm.
- Current engine was already close to the reference before this refactor began (V4 → unified migration happened ~12 days before it started).
- This refactor closes the remaining gaps: docs drift, 2 numeric parity bugs, focus ring source, V4 alias retirement, editor migration, sub-brand × theme-scope docs, and a net-new transparent-material system.
- 2 commits are **merged to `main`** (docs + engine parity).
- 4 **open PRs** complete the rest: #21, #22, #23, #24. Merge in that order.
- **Known remaining gap after all 4 PRs merge:** 3 components (`Select`, `Menu`, `Popover`) still hard-code `--Primary-Bold` for their focus box-shadow instead of `--Focus-Outline`. Trivial fix, ~15 minutes.

## Reference material

| Artifact | Location |
| --- | --- |
| Spec document | `~/Downloads/Surface Logics.md` (shared out-of-band by design engineering) |
| Reference implementation | `/Users/nunomarcelino/Documents/Code/OneUIColourTool 2/packages/core/src/surfaceLogic.ts` |
| Figma plugin consumer | `/Users/nunomarcelino/Documents/Code/OneUIColourTool 2/packages/figma-plugin-v2/src/apply.ts` |
| Internal docs (this repo) | `docs/surface-context-awareness.md`, `docs/surface-reference.md`, `docs/sub-brand-theme-scope.md` |
| Refactor plan | `~/.claude/plans/partitioned-scribbling-widget.md` |

## What was shipped — by track

The plan had 7 tracks labelled A–F + E. Here is the final state of each.

### Track A — Docs realignment ✅ merged to `main`

Commit `5909141 docs(surface): rewrite to unified 7-token model, retire V4 narrative`.

- `CLAUDE.md` — rewrote the Surface Context section around the 7 canonical tokens (`default`/`ghost`/`minimal`/`subtle`/`moderate`/`bold`/`elevated`). Dropped the BG/FG decision tree and brand-bold-inversion narrative — both described a V4 system that no longer exists.
- `docs/surface-context-awareness.md` — full rewrite (636 → 120 lines). Matches the reference spec structure and references the actual engine files.
- `docs/surface-reference.md` (new) — points at the canonical spec + reference implementation, lists current known numeric deviations (closed by Track B).

### Track B — Engine parity ✅ merged to `main`

Commit `dbc830f fix(surface): align engine with reference spec (bold fallback, state deltas, focus outline)`.

Closed the 2 numeric drifts between `packages/shared/src/engine/surfaceNew.ts` and `OneUIColourTool/packages/core/src/surfaceLogic.ts`:

- **Bold fallback offset**: was `parent + dir * 1000` with a `> 2500 / < 400` flip. Now `parent − 700` (always darker), flip to `parent + 700` when `< 500`. Bold fallback no longer depends on the parent's contrasting direction (by design — matches reference).
- **Bold state deltas**: was ±1/±2 for every token. Now `boldHover = boldStep ± 3`, `boldPressed = boldStep ± 5`. Other tokens stay ±1/±2. Matches reference's `STATE_DELTAS`.
- Added `BOLD_STATE_HOVER_OFFSET` / `BOLD_STATE_PRESSED_OFFSET` constants.
- 8 new boundary-case tests. 1 parameterised test across 4 parent steps pins the "state tokens move with parent's `contrastDir`" invariant.

### Track D — Focus ring from informative ✅ merged to `main`

Same commit as Track B (`dbc830f`).

- `cssGenNew.ts:generateMultiRoleRootCSS` emits `--Focus-Outline` from `informative.content.tintedA11y` at `:root`. Falls back to primary → neutral if informative is unconfigured.
- `cssGenNew.ts:generateSurfaceContextCSS` re-emits `--Focus-Outline` inside every `[data-surface]` block via `resolveContextTokenSet`, so the outline walks informative's base against the current container surface.
- `tokenManifest.ts` — new `--Focus-` prefix family + `'focus'` category. Allowlist count 31 → 32.
- `packages/tokens/src/css/semantic.css` — fallback chain changed from `var(--Text-High)` to `var(--Informative-TintedA11y, var(--Text-High))`.

### Track F (verify) ✅ done in-session

Three multi-brand platform bugs noted in a 12-day-old memo. Audited against current `main`:

1. **Brand Overview stale data** — FIXED on main (uses `useSurfaceTokenVarsNew` now).
2. **Theme-scope mismatch** — FIXED on main (fallback added in commit `3973570`, 2026-04-17).
3. **Sub-brand accent override only in global scope** — NOT a bug, **intentional design**. Documented in PR #23.

### Track C — V4 token retirement 🟦 PR #21 + PR #22 (open)

**PR #21** `refactor(surface): retire V4 token names, unify on 7-token surface vocabulary` — 2 commits, 232 files, 3042 ins / 3042 del:

- Engine adds `--{Role}-Subtle-High/Medium/TintedA11y` to canonical emission.
- Mechanical `perl -i` sweep of V4 token literals across component CSS, `.tokens.ts`, stories, showcases, previews, platform CSS, apps. Key mappings:
  - `--{Role}-FG-Bold` / `--{Role}-BG-Bold` → `--{Role}-Bold`
  - `--{Role}-FG-Subtle` → `--{Role}-Subtle`, `--{Role}-BG-Subtle` → `--{Role}-Subtle`
  - `--{Role}-FG-Minimal` / `--{Role}-BG-Minimal` → `--{Role}-Minimal`
  - `--{Role}-FG-Bold-High/Hover/Pressed` → `--{Role}-Bold-High/Hover/Pressed`
  - `--{Role}-BG-Subtle-High/Hover/Pressed` → `--{Role}-Subtle-High/Hover/Pressed`
  - `--{Role}-Default-High/Medium-Text/Low-Text/…` → `--{Role}-High/Medium-Text/Low/…`
- Deletes `generateV4RoleAliases()` in `cssGenNew.ts` and the V4 `--Surface-FG/BG-*` rows in `generateBackwardCompatAliases`. Saves ~225 declarations per brand CSS (~30% payload reduction).
- Updates `componentTokens.ts` editor metadata (renamed constants/functions, dropped `V4_` prefix).
- Updates validator rules from `--Primary-FG-Bold` → `--Primary-Bold`.

**PR #22** `refactor(surface): retire SurfaceModeNameV4 + tighten Surface API` — 1 commit, 54 files, stacked on #21:

- Deletes the `SurfaceModeNameV4` type and the `normalizeSurfaceMode()` runtime function in `Surface.tsx`. The `<Surface>` API now accepts only the 7 canonical tokens.
- Migrates ~119 editor call sites from V4 mode names (`'bg-bold'`, `'fg-subtle'`, …) to unified names (`'bold'`, `'moderate'`, …). The editor surface preview grid collapses from 8 cells to 6.
- Renames `artboardSurfaces.ts` constants `V4_BRAND_BG_MODES` / `V4_FG_SURFACE_MODES` to `BRAND_BG_SURFACE_MODES` / `ROLE_SURFACE_MODES`.
- `ContainerShape.tsx` keeps its local `normalizeSurfaceModeForCanvas()` helper (reads legacy values from saved tldraw data; works on plain `string`).

### Track F3 — Sub-brand × theme-scope docs 🟦 PR #23 (open)

`docs(foundation): document sub-brand accent × theme-scope asymmetry` — 2 files, stacked on #22.

**Verdict after code audit: the gate in `FoundationStyleProvider.tsx:158` is intentional, not a bug.** See `docs/sub-brand-theme-scope.md` (new) for the design rationale:

- **`foundationData`** path drives global `<style>` injection. Sub-brand accents applied only in Brand Theme (`themeScope === 'global'`). In Default Theme the platform brand's appearance is preserved for tool chrome.
- **`contextData`** path (exposed via `useFoundationData()`) always has sub-brand accents applied. Showcase pages use this + `useSurfaceTokenVarsNew` to render previews — inline vars cascade to preview descendants without touching platform chrome.

The "bug" in the old memo was actually a missing docstring. PR rewrites the two memo comments in `FoundationStyleProvider.tsx` with a "do NOT fix this" warning at the top + cross-references, and adds `docs/sub-brand-theme-scope.md` with a 3-step diagnostic for "sub-brand not showing up in showcase page" (answer: it's always a showcase-page wrapping bug, never a `FoundationStyleProvider` bug).

### Track E — Transparent material system 🟦 PR #24 (open)

`feat(surface): transparent material system (media overlays)` — 4 commits, stacked on #23. Net-new feature, additive; existing solid-surface behaviour unchanged.

**Commit 1 `9094ab2` (E1–E3)** — Engine + CSS emission:

- `packages/shared/src/engine/surfaceNew.ts`:
  - Types: `MediaContext` (`'dynamic' | 'dark' | 'light'`), `MaterialVariant`, `MediaInteractionState`, `TransparentMaterial`, `MediaInteractionOverlay`, `MediaFocusRingResult`.
  - Lookup tables copied verbatim from reference: `MEDIA_SURFACE` (3 contexts × 7 tokens), `MEDIA_CONTENT_OPACITY` (7 content tokens), `MEDIA_INTERACTION` (3 × 7 × 2 states).
  - Resolvers: `resolveMediaSurface`, `resolveMediaContent`, `resolveMediaInteraction`, `resolveMediaFocusRing`.
  - Helpers: `opacityFromStep(step)`, `getTransparentBaseHex(variant, palette)`.
- `packages/shared/src/engine/cssGenNew.ts`:
  - `generateTransparentMaterialCSS(themeConfig, darkMode)` — emits three `[data-material="transparent"][data-media="<ctx>"]` blocks.
  - `generateFullCSS` extended with `transparentCSS` + `transparentTokenCount` in its return shape.
- Tests: +27 engine tests, +2 CSS emit assertions.

**Commit 2 `ada17a7` (E4–E5)** — Surface component API + Storybook:

- `packages/ui/src/components/Surface/Surface.tsx` — discriminated-union props:
  - `material?: 'solid' | 'transparent'` (default `'solid'`).
  - `mediaContext?: 'dynamic' | 'dark' | 'light'` (required by TS iff `material='transparent'`).
- DOM: transparent mode adds `data-material="transparent"` + `data-media={mediaContext}` alongside the existing `data-surface`.
- +6 Surface component tests.
- New "Transparent Material" Storybook story under `Components/Containers/Surface`.

**Commit 3 `b21eb33` (E6)** — Platform injection + foundations preview:

- `packages/ui/src/engine/computeNewStacking.ts` — new `generateNewTransparentCSS(paletteData, theme)`.
- `packages/ui/src/hooks/useBrandCSS.ts` — composes transparent CSS into `additionalBlocks` → wrapped + injected into live `<style id="oneui-foundation-tokens">`.
- `packages/shared/src/engine/index.ts` — exports `generateTransparentMaterialCSS` from the shared engine barrel.
- `packages/shared/src/engine/tokenManifest.ts` — `--Surface-Transparent-*` already falls under the `--Surface-` allowlist; description updated.
- `apps/platform/src/app/(platform)/(studio)/foundations/surfaces/SurfacesContent.tsx` — new collapsible "Transparent Material" `FoundationCard` showing 3 rows (media contexts) × 6 surface modes, live against the current brand.

**Commit 4 `c7849c7` (E7–E9)** — Render wiring fix (important — prior commits didn't actually render):

- Rewrote `generateTransparentMaterialCSS` to **remap existing role + legacy tokens** inside each `[data-material="transparent"][data-media="<ctx>"]` block, instead of minting namespaced `--Surface-Transparent-*` tokens nobody read.
- Each transparent block now reassigns:
  - `--Surface-Fill-{Mode}` (what `Surface.module.css` reads).
  - Legacy `--Surface-{Mode}`, `--Text-High/Medium/Low/OnBold-High`.
  - Per-role `--{Role}-{Mode}` for 11 roles × 6 modes.
  - Per-role content tokens (`High` / `Medium-Text` / `Low` / `Tinted` / `TintedA11y` / `Stroke-Medium` / `Stroke-Low`).
  - Per-role on-bold + on-subtle content triplets.
  - Per-role hover/pressed (default + bold + subtle variants).
  - `--Focus-Outline` (solid informative colour, no opacity).
- All role prefixes collapse to the same rgba values — transparent material is role-agnostic per spec. Locked in by a test.
- `Surface.module.css` — explicit pass-through rule for `[data-material="transparent"][data-surface="default"]` as a safety net.
- +12 new CSS emit tests; negative assertion confirms `--Surface-Transparent-*` dead namespace is NOT emitted.
- Specificity: 2-attribute selector `[data-material][data-media]` (0,2,0) wins over solid `[data-surface]` (0,1,0). Nested transparent-inside-solid works correctly.

## Verification status (at time of handoff)

| Check | Result |
| --- | --- |
| `pnpm -r typecheck` | ✅ All 7 packages pass on every open PR |
| `pnpm --filter @oneui/shared test --run` | ✅ 1019 pass on PR #24 (was 979 pre-refactor) |
| `pnpm --filter @oneui/ui test --run` | 992 pass / 14 pre-existing failures (baseline unchanged) |
| Visual — Storybook solid surfaces | Identical pre/post refactor (Chromatic not run locally) |
| Visual — Storybook Transparent Material story | Renders correctly after Commit 4 wiring fix |
| Visual — Platform foundations → Surfaces → Transparent Material | Renders correctly against current brand after Commit 4 |

### Pre-existing UI test failures (not caused by this refactor)

These 14 fail on `main` before any of the refactor work. Inherited — **not new regressions**. Triage separately:

- `Checkbox.test.tsx` — 4 failures (readOnly, appearance resolution, data-accent). Unrelated.
- `Switch.test.tsx` — 2 failures (appearance resolution). Unrelated.
- `Spinner.test.tsx` — 1 failure (pathLength normalisation). Unrelated.
- `ModeNav.test.tsx` — 5 failures (rendering, aria-current, onChange). Unrelated.
- `fouc-prevention.test.ts` — 2 failures (theme-scope cache, V4 token fallback chains). The V4 fallback-chain test will eventually pass after all four PRs merge + a final component-CSS fallback cleanup sweep, but isn't in current scope.

## Merge order

Merge in this order. Each PR rebases cleanly once the parent lands.

```
main
 │
 ├─ dbc830f  ← already on main (engine parity + focus outline)
 ├─ 5909141  ← already on main (docs rewrite)
 │
 ├─ PR #21  refactor(surface): retire V4 token names, unify on 7-token surface vocabulary
 │          (2 commits, 232 files; sweeps consumers + deletes engine aliases)
 │
 ├─ PR #22  refactor(surface): retire SurfaceModeNameV4 + tighten Surface API
 │          (1 commit, 54 files; stacked on #21; editor migration + API tightening)
 │
 ├─ PR #23  docs(foundation): document sub-brand accent × theme-scope asymmetry
 │          (1 commit, 2 files; stacked on #22; docs only)
 │
 └─ PR #24  feat(surface): transparent material system (media overlays)
            (4 commits; stacked on #23; engine + API + injection + foundations preview + render wiring)
```

## Outstanding gaps — what still needs to be done

Listed in priority order. Each item is independently reviewable and small.

### 1. [HIGH] Focus outline — 3 components still hardcode `--Primary-Bold`

`Select`, `Menu`, `Popover` use `box-shadow: 0 0 0 var(--Stroke-M) var(--Primary-Bold)` for their focus ring instead of the Track-D-emitted `--Focus-Outline`. This violates the reference spec's "focus ring is always informative scale" rule. **Pre-existing drift, not caused by the refactor — but Track D was supposed to close exactly this kind of gap and missed these three.**

Fix is a one-line swap per file:

```css
/* before */
box-shadow: 0 0 0 var(--Stroke-M) var(--Primary-Bold);
/* after */
box-shadow: 0 0 0 var(--Stroke-M) var(--Focus-Outline);
```

Files:
- `packages/ui/src/components/Select/Select.module.css`
- `packages/ui/src/components/Menu/Menu.module.css`
- `packages/ui/src/components/Popover/Popover.module.css`

Effort: ~15 min including Chromatic sanity check. Open as a tiny PR on `main` (not stacked on the surface PRs — independent).

Intentional non-fixes (documented, no change needed):

- `Input`, `NumberField`, `ChatComposer`, `ChatSurface` — highlight focus via border-color change on their own stroke, not an outline. Standard pattern for text fields; adding `--Focus-Outline` on top would double the cue.
- `SliderValueTooltip` — tooltips are not keyboard-targetable on their own.

### 2. [MEDIUM] FOUC Test 8 — component CSS fallback chains

`packages/ui/src/engine/__tests__/fouc-prevention.test.ts > Test 8: V4 token fallback chains in component CSS` fails because some component CSS variables don't have a literal fallback value in their `var()` chain. PR #21 sweeps the token names but doesn't add fallbacks — the test policy is stricter than the actual render path requires (brand CSS is always injected, so missing fallbacks don't cause visible breakage).

Options:

1. **Relax the test** to "any fallback OR a known-always-emitted token name is acceptable". More lenient, matches production reality.
2. **Add literal fallbacks** to every `var()` chain in component CSS. More work (~50 files), but makes the test meaningful as a pre-brand-CSS FOUC guard.

Recommend option 1 — the test was written against a stricter policy than the engine actually enforces, and the policy change should be explicit.

Effort: ~1 hour for option 1, ~1 day for option 2.

### 3. [LOW] Transparent material — components that override tokens instead of reading via cascade

The transparent-material render wiring (PR #24 commit 4) works because components read generic tokens like `var(--Primary-Bold)` that get remapped inside `[data-material="transparent"]`. But a handful of components bypass the cascade by computing inline styles from `useSurfaceTokenVars` / `useFoundationData()` — these won't adapt to transparent material.

Audit targets (high-probability bypass):

- `apps/platform/src/app/(platform)/(studio)/components/[component]/editor/EditorContent.tsx` — the inspect preview sets inline vars computed from foundation data, bypassing the CSS cascade.
- Components that render with hex values piped from `tokenSets?.roles?.{role}` — same pattern.

Effort: ~2 hours to audit, ~4 hours to fix any genuine bypasses by switching from inline-hex to inline-CSS-var references (so the transparent block's remap still wins).

Out of scope for PR #24 — those previews are editor-internal, not production component rendering.

### 4. [LOW] Storybook theming of the Transparent Material story

The Storybook story uses a synthetic gradient (`linear-gradient(135deg, var(--Primary-Bold), …)`) as a stand-in for a media background. A real photo makes the transparent material effect more convincing in Chromatic diffs. A stock image URL added as an inline `backgroundImage` in the story would do it.

Effort: 10 min.

### 5. [BACKLOG] Component-level transparent-material parity tests

Once PR #24 merges, add a Chromatic snapshot for each interactive component inside `<Surface material="transparent" mediaContext="dynamic">` over a photo backdrop. Catches any component whose focus state or state layer doesn't composite correctly on a transparent surface.

Effort: 1 day to author stories; ongoing Chromatic maintenance.

### 6. [ARCHITECTURAL, NOT NOW] Scoped editing-brand injection

`docs/sub-brand-theme-scope.md` calls out the optional evolution: emit editing-brand CSS inside a `[data-brand-scope="editing"]` selector so showcase pages opt in *without* computing inline vars. Would eliminate the "wrap your preview with useSurfaceTokenVarsNew" step. Not urgent — existing pattern works — but nice-to-have if the team ever revisits multi-brand editor architecture.

Effort: 1–2 days.

## File map — where the surface logic lives now

| Area | File | Role |
| --- | --- | --- |
| Core algorithm | `packages/shared/src/engine/surfaceNew.ts` | All resolvers (`resolveSurface`, `resolveContent`, `resolveState`, `resolveTokenSet`, `resolveContextTokenSet`, `resolveMedia*`), lookup tables, types. |
| CSS emission | `packages/shared/src/engine/cssGenNew.ts` | `generateRoleCSS`, `generateMultiRoleRootCSS`, `generateSurfaceContextCSS`, `generateTransparentMaterialCSS`, `generateFullCSS`. |
| Token allowlist | `packages/shared/src/engine/tokenManifest.ts` + `tokenBoundary.ts` | Prefix families (25) that brand CSS is allowed to inject. |
| Validation | `packages/shared/src/engine/validateBrandCSS.ts` | Required tokens, interdependencies, value format. |
| Platform bridge | `packages/ui/src/engine/computeNewStacking.ts` | Convex data → `ThemeConfig` → CSS strings (filtered + formatted for injection). |
| React hook | `packages/ui/src/hooks/useBrandCSS.ts` | Two-memo pipeline → injected into `<style id="oneui-foundation-tokens">`. |
| `<Surface>` component | `packages/ui/src/components/Surface/Surface.tsx` + `.module.css` | DOM attribute emission (`data-surface`, `data-material`, `data-media`). |
| Foundations UI | `apps/platform/src/app/(platform)/(studio)/foundations/surfaces/SurfacesContent.tsx` | Live preview per role + transparent material preview. |
| Internal docs | `docs/surface-context-awareness.md` | Full surface model (how-to guide). |
| External reference | `docs/surface-reference.md` | Pointers to OneUIColourTool + spec doc + current deviations. |
| Sub-brand behaviour | `docs/sub-brand-theme-scope.md` | Why the gate is intentional + diagnostic for showcase bugs. |

## Testing the full stack after merge

Once all 4 PRs land, run this sequence to confirm end-to-end:

```bash
pnpm install
pnpm -r --parallel typecheck                    # expect all 7 packages green
pnpm --filter @oneui/shared test -- --run       # expect 1019 green
pnpm --filter @oneui/ui test -- --run           # expect 992 green + 14 pre-existing failures
```

Visual regression:

1. `pnpm storybook` → Components → Containers → Surface. Every story should render without hex-literal regressions. The "Transparent Material" story should show translucent surfaces over the gradient backdrop with properly composited Button groups.
2. `pnpm dev` → log into platform → pick a brand → Foundations → Surfaces. The collapsible "Transparent Material" card should render 18 cells (3 rows × 6 modes) against gradient backdrops, reflecting the currently selected brand's neutral palette. Toggle Light/Dark at the top — focus outline updates across all cells. Switch brands — cells re-composite.
3. End-to-end smoke on a real brand page: drop `<Surface material="transparent" mediaContext="dynamic">` wrapping a `<Button variant="bold">` somewhere visible, verify readability against a real photo background.

## Migration guidance for component authors

After this refactor, the rules for new components are:

1. **Never hard-code V4 names** — no `--Primary-FG-Bold`, `--Primary-Default-High`, etc. Use `--Primary-Bold`, `--Primary-High`, `--Primary-Bold-High`, `--Primary-TintedA11y` directly.
2. **Focus outlines use `--Focus-Outline`** — never `--Primary-Bold` or a literal. Width is `--Focus-Outline-Width`.
3. **`<Surface>` is always the entry point** for any element that hosts other components on a non-default background. Never `<div style={{ background: 'var(--Primary-Bold)' }}>` — that bypasses the `[data-surface]` cascade.
4. **Transparent-material support is free** — if your component reads `var(--Primary-Bold)`, `var(--Text-High)`, `var(--Focus-Outline)`, etc. via the cascade, it automatically adapts inside `<Surface material="transparent">`. Don't write transparent-specific CSS.
5. **Focus halo pattern** — interactive components that draw a 2-layer focus halo should use `var(--Surface-Halo-Gap)` for the inner ring (not `--Surface-Main` — that's hardcoded to page background and breaks nested halos). Pattern:

```css
.interactive:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 var(--Stroke-XL) var(--Surface-Halo-Gap, var(--Surface-Main)),
    0 0 0 var(--Focus-Outline-Width) var(--Focus-Outline);
}
```

## Contact / handoff notes

- Refactor driver: session-long AI assistant, source material at `~/.claude/plans/partitioned-scribbling-widget.md`.
- All PRs include detailed bodies with verification steps + test plans — read those before merging.
- The pre-session 14 UI test failures are inherited from `main` and predate this work. They should NOT be treated as regression signal during review.

If the reference spec updates in future:

1. Read `/Users/nunomarcelino/Documents/Code/OneUIColourTool 2/packages/core/src/surfaceLogic.ts` + any updated `Surface Logics.md`.
2. Mirror changes in `packages/shared/src/engine/surfaceNew.ts`.
3. Update tests + docs (`surface-context-awareness.md`, `surface-reference.md`).
4. If the public API changes (token names, `<Surface>` props), add a migration note to `CLAUDE.md`.
