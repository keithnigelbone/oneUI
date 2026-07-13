# `design.md` Audit — Integration Brief for the Design Composition Agent

> **Audience:** engineering + design on the DCA team.
> **Date:** 2026-04-24.
> **Scope:** read-only audit. No code changes were made. Proposes a three-phase integration path; only Phase A (this doc) is done.
> **Source:** https://github.com/google-labs-code/design.md (alpha, by Google Labs).

---

## 1. TL;DR

- `design.md` is a new alpha spec from Google Labs: **one markdown file per design system**, with YAML front-matter tokens (colors, typography, spacing, rounded, components) and a canonically-ordered prose body. Shipped with a CLI (`@google/design.md`) for `lint` / `diff` / `export` / `spec`.
- It is **not a replacement for our DCA**. Our Convex-backed rule/skill/reference/feedback model is strictly richer than anything `design.md` can carry.
- It **is** a standards-based handshake format for the *outside* of the DCA — the thing we should emit so Cursor, Claude Code, Figma Make, and Copilot can read our design systems without a custom integration.
- Today the DCA is a closed loop: rules live in Convex → compiled into a private system prompt on the server → never leave the platform. External agents working on Jio apps have zero insight into our system.
- Recommended posture: **adopt the file format as an export layer; extend it with OneUI-specific sections (`## Surfaces`, `## Attention Hierarchy`); borrow three of the seven lint rules; ignore the components section's shallow model**.
- Proposed work, staged so nothing commits us past Phase A:
  - **Phase A** (this doc) — decide direction. *Done.*
  - **Phase B** — minimal exporter + "Export DESIGN.md" button on DCA config page. ~1–2 days, ~300 LOC.
  - **Phase C** — `pnpm lint:designmd` in CI using the Google CLI. ~½ day after B.
  - **Phase D** — prime our `design` executor with the `design.md spec` output so our own agent speaks the format natively. ~½ day after B.
- Five open questions at the end of this doc need team answers before Phase B.

---

## 2. Why now

Every major coding agent converging on shipping in 2026 (Cursor, Claude Code, Figma Make, Copilot Workspace, Replit Agent) needs a way to be told "this is our design system — use it." Today they get one of three things: nothing (generic output), a Tailwind config (colors and a few scales), or a Storybook URL (unreadable at runtime). `design.md` is the first public attempt at a standard that carries *both* tokens *and* rationale in one file.

Our DCA is the most sophisticated version of this idea we've seen — but it only works inside our platform. A Jio team member working on a brand-critical app in Cursor gets none of it. Emitting a `DESIGN.md` per brand closes that gap in the simplest possible way: one file, checked into the consuming repo, read by the agent at session start.

The strategic question is not "should we support this format" — it's "are we building the portable edge now, or waiting until a competing format forces us to?"

---

## 3. `design.md` in one page

### 3.1 File shape

```yaml
---
version: alpha
name: Heritage
description: Architectural minimalism meets journalistic gravitas.
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  tertiary: "#B8422E"
  neutral: "#F7F5F2"
  on-tertiary: "{colors.neutral}"        # cross-reference
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 1.1
  body-md:
    fontFamily: Public Sans
    fontSize: 1rem
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 8px
  md: 16px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.sm}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.tertiary-container}"
---

## Overview
Short prose describing brand voice and when to use what.

## Colors
Rationale for each token: when primary vs. tertiary; why neutral is warm, etc.

## Typography
...
```

### 3.2 Canonical section order (8 sections; each individually optional, order enforced)

1. **Overview** (alias: Brand & Style)
2. **Colors**
3. **Typography**
4. **Layout** (alias: Layout & Spacing)
5. **Elevation & Depth**
6. **Shapes**
7. **Components**
8. **Do's and Don'ts**

Unknown headings inserted between sections are **preserved, not rejected** — this is the key extensibility hook.

### 3.3 Token references

Any string-valued token may reference another via `{namespace.token}` syntax (e.g. `{colors.primary}`). References are validated by the linter (`broken-ref`, severity `error`).

### 3.4 Valid component properties

Only these keys are allowed on a component entry: `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`. Variants (hover, pressed, active) are expressed as separate entries: `button-primary-hover`.

### 3.5 Lint rules (7 total)

| Rule | Severity | Check |
|---|---|---|
| `broken-ref` | error | Token reference doesn't resolve |
| `missing-primary` | warning | No primary color defined |
| `contrast-ratio` | warning | WCAG AA 4.5:1 violated |
| `orphaned-tokens` | warning | Color token defined but unused |
| `section-order` | warning | Sections out of canonical order |
| `missing-typography` | warning | Colors present, typography missing |
| `token-summary` / `missing-sections` | info | Informational counts |

### 3.6 CLI commands

```
npx @google/design.md lint <file>         # JSON findings
npx @google/design.md diff <a> <b>        # semantic diff of two files
npx @google/design.md export <file>       # → Tailwind config or W3C DTCG tokens.json
npx @google/design.md spec                # emit the spec itself (for agent priming)
```

The `spec` command is interesting: it emits the *grammar* of `design.md`, designed to be prepended to an agent's system prompt so the agent speaks the format fluently. We should steal this trick for our own executor.

---

## 4. Side-by-side comparison: `design.md` ↔ OneUI-DCA

| `design.md` concept | OneUI / DCA equivalent | Gap / overlap |
|---|---|---|
| `colors` front-matter | 25-step OkLCH scales per role, emitted via `cssGenNew.ts` → `--{Role}-{Step}` | **Emit gap.** We have richer data (25 steps × 11 roles) but no flat `colors` map. Exporter flattens to a subset: primary, secondary, tertiary, neutral, on-primary, on-tertiary. |
| `typography` front-matter | Typography V2: 27 size tokens × 6 roles, each = `var(--Dimension-f{N})`; per-role line-height offsets; emphasis weights 700/500/400 (body/label/code) + fixed weights (display/headline/title) — see `packages/shared/src/data/typography-roles.ts` | **Lossy map.** We must collapse 27 sizes to ~8 `h1/h2/body-md/body-sm/label/code` entries. The f-step aliasing is untranslatable; we emit computed rem values. |
| `rounded` front-matter | `--Shape-0`..`--Shape-10` (f-step aliased) + `--Shape-Pill` (9999px standalone) — see `packages/tokens/src/css/primitives.css:17-35` | **Direct map** for numeric subset. Pill goes in as-is. |
| `spacing` front-matter | `--Spacing-0`..`--Spacing-40` + `--Spacing-Margin` / `--Spacing-Gutter` | **Direct map** for numeric subset. Margin/Gutter lost unless we extend. |
| `components` front-matter | Full component library with Surface modes, appearance roles, slots, variants, states | **Severe lossy map.** `design.md` only supports `backgroundColor/textColor/rounded/padding/size`. Cannot express `<Surface mode="bold">` wrapping, `appearance="secondary"`, focus halos, `--Surface-Halo-Gap`, context-aware token remapping. Exporter emits only the *static* pieces (button-primary hex-resolved, card-default radius) and moves the rest into prose. |
| Markdown body sections | `compositionSeedRules.ts` — 12 rule sections (layout-structure, spacing-rhythm, typography-hierarchy, attention-flow, surface-application, component-selection, color-role-usage, motion-elevation, accessibility-layout, navigation-patterns, responsive-adaptation, vertical-specifics) | **Structural map.** 12 DCA sections → 8 canonical `design.md` sections, with overflow going into OneUI extension headings. |
| 7 lint rules | `compositionValidator.ts` — 7 P0/P1 checks on the runtime AST | **Different scope.** `design.md` lints the *spec file*; our validator lints the *generated AST*. Complementary, not overlapping. `broken-ref`, `contrast-ratio`, `orphaned-tokens` are worth adding to our spec-file lint pass. |
| Contexts (mobile/web/marketing/social/print/outdoor) | `CompositionContext` union, 6 presets in `compositionCompiler.ts` | **Not in spec.** We must encode as an extension section (`## Contexts`) or emit one file per context. Recommendation: single file, `## Contexts` section lists presets; per-context overrides live in prose. |
| Skills (screen/pattern/flow templates) | `compositionSkills` table; 6 default + 8 vertical-specific | **Not in spec.** Extension section `## Skills` (optional); probably skip on v1 export — external agents rarely need skill templates. |
| Reference screens | `referenceScreens` + RAG retrieval in the agent executor | **Not exportable.** Images don't belong in a markdown spec. Link to platform URLs in extension section if at all. |
| Feedback / eval scenarios | `compositionFeedback` + `compositionEvalScenarios` | **Internal only.** Never exported. |
| Attention hierarchy (5/10/25/60%) | `attention-flow` rule in DCA seed rules | **Not in spec.** Extension section `## Attention Hierarchy`. Critical — external agents most often get attention pyramids wrong. |
| Surface context + `[data-surface]` remapping | The *core* of our design system — see `docs/surface-context-awareness.md` | **Completely absent from spec.** Needs a dedicated `## Surfaces` and `## Surface Context` extension section, with a warning to agents that `<div style={{ background }}>` breaks everything. |
| Brand scope inheritance (base ↔ brand rules) | `scope: 'base' \| 'brand'` on every DCA rule | **Irrelevant to export.** The exporter resolves inheritance and emits a single flattened view per brand. |

---

## 5. Worked example — Jio as a `DESIGN.md`

Hand-written illustration, not generated by a real exporter. Uses Jio's seeded `primaryHue: 220` (see `packages/convex/convex/brands.ts:472`) with hexes derived via the OkLCH engine for steps 700/500/300/100. Typography pulled from `DEFAULT_FSTEP_ASSIGNMENTS` in `packages/shared/src/data/typography-roles.ts:55-62`.

```yaml
---
version: alpha
name: Jio
description: >
  Jio — India's digital life platform. Simple, confident, scale-first.
  Hue 220 (blue) with full OkLCH 25-step scales; Public Sans display, system body.
colors:
  # Flattened from 25-step OkLCH scales at primaryHue=220
  primary: "#0F3CC9"              # Primary-500 approx (Jio Blue)
  primary-bold: "#0F3CC9"         # alias of primary-500 for Bold surface fills
  primary-subtle: "#DBE3FA"       # Primary-200 — Subtle surface fills
  on-primary-bold: "#FFFFFF"      # text on bold surfaces
  on-primary-subtle: "#0F3CC9"    # tinted-a11y text on subtle surfaces
  secondary: "#6B6F78"            # Neutral-500
  tertiary: "#E04A2F"             # secondary accent (illustrative)
  neutral-page: "#FFFFFF"         # Surface-Default (step 2500 light)
  neutral-bold: "#0A0B0D"         # Surface-Bold default in dark rendering
  positive: "#2EA56C"
  negative: "#D93A3A"
  warning: "#E0A82F"
  informative: "#2F88D9"
  text-high: "#0A0B0D"
  text-medium: "#3F4249"
  text-low: "#6B6F78"
  text-on-bold-high: "{colors.on-primary-bold}"

typography:
  # Derived from f-steps: display.L=f7, headline.L=f4, title.M=f0, body.M=f0, label.S=f-1
  # line-height offsets: display=0, headline=0, title=+1, body=+3, label=0, code=+2
  display-l:
    fontFamily: Public Sans
    fontSize: 4rem
    fontWeight: 900
    lineHeight: 1.0
  display-m:
    fontFamily: Public Sans
    fontSize: 3rem
    fontWeight: 900
    lineHeight: 1.05
  headline-l:
    fontFamily: Public Sans
    fontSize: 2.25rem
    fontWeight: 900
    lineHeight: 1.15
  headline-m:
    fontFamily: Public Sans
    fontSize: 1.75rem
    fontWeight: 900
    lineHeight: 1.2
  title-m:
    fontFamily: Public Sans
    fontSize: 1.25rem
    fontWeight: 800
    lineHeight: 1.3
  body-m:
    fontFamily: Public Sans
    fontSize: 1rem
    fontWeight: 400           # emphasis: low
    lineHeight: 1.5           # +3 offset → f3
  body-s:
    fontFamily: Public Sans
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.45
  label-m:
    fontFamily: Public Sans
    fontSize: 1rem
    fontWeight: 500           # emphasis: medium
    lineHeight: 1.2
  label-s:
    fontFamily: Public Sans
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.15
  code-m:
    fontFamily: JetBrains Mono
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.4

rounded:
  none: 0px
  sm: 4px                     # Shape-1 ≈ f-6
  md: 8px                     # Shape-2 ≈ f-4
  lg: 16px                    # Shape-4 ≈ f0
  xl: 24px                    # Shape-6 ≈ f2
  pill: 9999px                # Shape-Pill (standalone)

spacing:
  xs: 4px                     # Spacing-1
  sm: 8px                     # Spacing-2
  md: 16px                    # Spacing-4
  lg: 24px                    # Spacing-6
  xl: 32px                    # Spacing-8
  2xl: 48px                   # Spacing-12
  gutter: 24px                # Spacing-Gutter
  margin: 16px                # Spacing-Margin

components:
  button-bold:                # variant="bold" (Jio attention-high)
    backgroundColor: "{colors.primary-bold}"
    textColor: "{colors.on-primary-bold}"
    rounded: "{rounded.pill}" # Jio buttons are Pill by default
    padding: 12px
    typography: "{typography.label-m}"
  button-bold-hover:
    backgroundColor: "#0A30A3" # Primary-Bold-Hover — one step darker
  button-subtle:              # variant="subtle" (attention-medium)
    backgroundColor: "{colors.primary-subtle}"
    textColor: "{colors.on-primary-subtle}"
    rounded: "{rounded.pill}"
    padding: 12px
    typography: "{typography.label-m}"
  button-ghost:               # variant="ghost" (attention-low)
    backgroundColor: "transparent"
    textColor: "{colors.on-primary-subtle}"
    rounded: "{rounded.pill}"
    padding: 12px
  card-default:
    backgroundColor: "{colors.neutral-page}"
    rounded: "{rounded.lg}"
    padding: 16px
---

## Overview

Jio is a scale-first digital life platform. Design with confidence, not decoration.
The page is the hero; colour is the accent. Keep 80–90% of every surface at the
default page colour. Use Jio Blue as an event, not a default.

## Colors

Primary (`#0F3CC9`, Jio Blue) is the single interaction driver. Reach for
`primary-bold` only on the top attention element on the page. `primary-subtle`
(light blue tint, `#DBE3FA`) is the second-most-used fill — lists, selected
states, medium-attention cards. `secondary` (warm grey) is content chrome, not
decoration. Positive / negative / warning / informative are reserved for status
only — never as brand colours.

## Typography

Public Sans carries the full hierarchy. Weights follow the emphasis system:
display/headline/title are always bold or heavier; body defaults to low-emphasis
(400) and uses medium (500) only for labels and UI chrome. Line heights are
relational — body at 1.5, title at 1.3, display at 1.0 — generated from
dimension f-steps so density and platform can shift the whole scale at once.

## Layout

Mobile-first on 4/8/16/24/32/48 px scale. Touch targets ≥ 44×44 on mobile,
24×24 on desktop. One margin on mobile, 12-column grid on desktop with
24 px gutters. Avoid nested containers more than three deep.

## Elevation & Depth

Elevation is a two-shadow formula; dark mode uses a 1 px stroke instead of a
shadow. Levels 0 (flush) through 5 (modal). Prefer elevation 0 for content
cards — surface tint conveys grouping already.

## Shapes

Buttons are pill-shaped (`rounded.pill`). Inputs, chips, selects use `rounded.sm`
(4 px). Cards use `rounded.lg` (16 px). Avatars are fully circular. Never mix
shape scales on a single screen.

## Components

Buttons come in three attention levels mapped directly to surface modes:
`bold` (high), `subtle` (medium), `ghost` (low). Inside a dark hero the same
three tokens automatically remap; never swap colours manually.

## Do's and Don'ts

**Do:** use `<Surface mode="bold">` around branded hero sections. Let buttons
inside inherit. Stay on the token scale — hex literals are a bug.

**Don't:** set `background` on a raw `<div>` and expect child colours to adapt.
Don't add decorative strokes to tinted cards — the fill is the boundary. Don't
skip typography tokens for "just one" micro-copy; brand font-family cascade
will silently drop.

## Surfaces

*(OneUI extension — not part of the canonical `design.md` spec; preserved by the
linter.)*

Seven surface tokens, resolved relative to the parent's step:

- `default` — page surface; step 2500 light / 100 dark.
- `ghost` — same step as parent (still triggers context remapping).
- `minimal` — parent + 1 step toward contrast.
- `subtle` — parent + 2 steps.
- `moderate` — parent + 3 steps.
- `bold` — role's baseStep; dramatic.
- `elevated` — parent + 1 step toward lighter; for floating panels.

Use `<Surface mode="...">` as the container for any non-default background. A
raw `<div>` with `background:` is outside the cascade and child components will
render invisible.

## Attention Hierarchy

*(OneUI extension.)*

Per viewport, aim for: **5 %** high-attention (one bold element), **10 %**
medium-attention (2–3 subtle tints), **25 %** low-attention (chrome, links),
**60 %** no-attention (page, body copy, whitespace). If two elements compete
for "high," the page is already broken — demote one.
```

**What this buys you:**

- Drop this file into a Cursor session on a scratch repo, ask "build me a landing page," and the output will use Jio Blue (`#0F3CC9`), pill buttons, Public Sans, and the correct attention pyramid — without us writing a single integration.
- `npx @google/design.md lint ./Jio.DESIGN.md` gives you a contrast audit + orphaned-token report for free.
- `npx @google/design.md diff` between two exports (pre- and post-palette-tweak) shows exactly what changed semantically.

---

## 6. What we adopt

1. **The file format itself.** Single-file output per brand, emitted on demand.
2. **Token references (`{ns.token}`)** in YAML — already consistent with how our V2 typography tokens alias into f-steps; maps cleanly.
3. **Extension sections.** `## Surfaces`, `## Surface Context`, `## Attention Hierarchy`, optionally `## Contexts` and `## Skills`. The spec explicitly preserves unknown headings — free real estate.
4. **Three lint rules** worth porting into a *spec-file* pass (distinct from our AST validator): `broken-ref` (trivial; run on every export), `contrast-ratio` (WCAG AA on every color pair; we already do this inside OkLCH but not on flattened hex output), `orphaned-tokens` (catches dead colors, useful for Configuration UI clean-up).
5. **`spec`-prompt priming.** Capture `npx @google/design.md spec` output once, check it into `docs/`, prepend it to our `design` executor's system prompt when consuming an external `DESIGN.md`.

---

## 7. What we don't adopt

1. **The Convex rule/skill model stays.** The DCA's 12 rule sections × 6 contexts × base/brand scope × feedback loop cannot be squeezed into `design.md` without losing 80 % of the value.
2. **No fork of `@google/design.md`.** Consume the CLI as-is.
3. **No replacement of our token emission pipeline.** `cssGenNew.ts`, `tokenBoundary.ts`, `useBrandCSSNew` all stay unchanged. The exporter reads from the *output* of that pipeline.
4. **The shallow components model in `design.md` is not our target.** We emit the static pieces (radius, padding, one background, one text colour) and *move everything context-aware into prose*.

---

## 8. Gap analysis — five things `design.md` can't express

1. **Surface modes + the `[data-surface]` cascade.** Covered by `## Surfaces` + `## Surface Context` extension sections. Must include the warning: "raw `<div>` with `background:` breaks adaptation."
2. **Appearance roles (primary/secondary/tertiary/.../informative).** We emit a flat `colors` map but explain the role system in `## Colors` prose. Components section includes one variant per key role (`button-bold`, `button-bold-secondary` if needed).
3. **Density / platform cascade.** Not emittable. Prose note in `## Typography`: "line heights are relational and shift with density and platform — do not pin pixel values in implementation."
4. **Focus halos (`--Surface-Halo-Gap`, 2-layer box-shadow).** Out-of-band for `design.md`. Prose note in `## Do's and Don'ts`.
5. **Motion tokens + discreet/expressive timing.** Skip on v1 export. Canonical section "Elevation & Depth" covers elevation but not motion; `design.md` has no motion slot.

The pattern is consistent: **emit the static values, move the context-aware stuff into extension-section prose**. Agents that read prose (all modern ones do) pick up the guardrails.

---

## 9. Proposed next phases — sizing, files, reversal cost

**All three phases below are out of scope for this audit.** They are listed so the team can size them before approving Phase B.

### Phase B — minimal exporter (~1–2 days, ~300 LOC)

| File | Action | LOC |
|---|---|---|
| `packages/shared/src/engine/compositionDesignMdExporter.ts` | **New.** Pure function `serializeBrandToDesignMd({ brand, palette, typographyV2, rules, skills }): string`. | ~220 |
| `apps/platform/src/app/api/composition/export/designmd/route.ts` | **New.** GET `?brandId=...` → `text/markdown` response; reuses the brand-fetch pattern from `/api/composition/compile/route.ts`. | ~60 |
| `apps/platform/src/app/(platform)/(studio)/agents/design-composition/page.tsx` | **Edit.** Add "Export DESIGN.md" button that hits the new route and downloads the file. | ~20 |

Reversal cost: trivial. Delete three files, drop a button. No migrations, no Convex changes.

### Phase C — CI lint (~½ day)

- Add `@google/design.md` to root `devDependencies`.
- New script: `scripts/lint-designmd.mjs` that calls the exporter for every active brand, writes to `/tmp/*.DESIGN.md`, runs `design.md lint --format json` on each, fails on `error` severity.
- Wire into `pnpm validate:tokens` or its own `pnpm lint:designmd`.
- Document in `CLAUDE.md` § Quality Gates.

Reversal cost: trivial. Remove the dep + script.

### Phase D — agent-side priming (~½ day)

- Run `npx @google/design.md spec --format markdown` once, commit output to `docs/design-md-spec-v<version>.md`.
- In `apps/platform/src/app/api/agent/executors/design.ts`: when inbound request includes a `DESIGN.md` payload (or a URL/reference to one), prepend the stored spec prompt to the system prompt. Gate behind a feature flag.

Reversal cost: revert one executor diff + delete one doc file.

**Total budget across all three: 2.5–3 engineering days.**

---

## 10. Open questions — need team decisions before Phase B

Each is a concrete yes/no or pick-one; no vague "think about" items.

1. **First brand target.** Jio (flagship) or one of the smaller brands (less risk if the export is imperfect on round one)?
2. **One file per brand, or per brand × vertical?** Verticals (finance / commerce / media / etc.) drive different tone and component mixes. Emitting one file per vertical-of-a-brand may be clearer to consuming agents, but multiplies the surface. **Recommendation:** one file per brand for v1; revisit after feedback.
3. **Check exports into the repo, or generate on demand?** Checking in (under `docs/exports/<brand>.DESIGN.md`) makes diffs visible in PRs and gives a snapshot to point external agents at. Generating on demand keeps things fresh but adds a deploy surface. **Recommendation:** commit them, regenerate in a nightly job.
4. **Include DCA skills in the `## Skills` extension section, or leave skills out of the v1 export entirely?** Skills are internally useful templates; external agents rarely need them. **Recommendation:** omit from v1; add later if a consumer asks.
5. **Do we version the emitted file?** `design.md` has a `version: alpha` field. We could additionally add `oneui-version: <semver>` in an extension key. Affects how `diff` behaves when both the spec and our schema evolve. **Recommendation:** yes, add `oneui-version` and bump it whenever the exporter's output changes shape.

---

## 11. Sources

- `design.md` README: fetched from https://github.com/google-labs-code/design.md (cached in this session).
- DCA engine types: `packages/shared/src/engine/compositionTypes.ts`.
- DCA seed rules: `packages/shared/src/engine/compositionSeedRules.ts`.
- DCA compiler: `packages/shared/src/engine/compositionCompiler.ts`.
- DCA validator: `packages/shared/src/engine/compositionValidator.ts`.
- DCA API routes: `apps/platform/src/app/api/composition/{compile,generate,verify,eval}/`.
- DCA agent executor: `apps/platform/src/app/api/agent/executors/design.ts`.
- DCA UI surfaces: `apps/platform/src/app/(platform)/(studio)/agents/design-composition/`.
- Convex DCA schema: `packages/convex/convex/schema.ts`.
- Jio brand seed: `packages/convex/convex/brands.ts:472` (`primaryHue: 220`).
- Typography V2 roles: `packages/shared/src/data/typography-roles.ts`.
- Shape / Spacing tokens: `packages/tokens/src/css/primitives.css:17-80`.
- Token manifest (24 prefix families): `packages/shared/src/tokenManifest.ts`.
- Surface context system: `docs/surface-context-awareness.md`.

---

**End of audit.** Next action: team reads this, answers the five open questions above, then we commit to Phase B or revise.
