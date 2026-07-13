# One UI Studio

> Multi-brand design system platform for Jio (7+ brands, 2 platforms, 1.4B users, 22 languages)

> **Deep references:** [`docs/architecture.md`](docs/architecture.md) · [`docs/surface-context-awareness.md`](docs/surface-context-awareness.md) · [`docs/fouc-prevention.md`](docs/fouc-prevention.md) · [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md) · [`docs/storybook-platform-sync.md`](docs/storybook-platform-sync.md) · [`docs/perf-harness.md`](docs/perf-harness.md)

## Quick Reference

```bash
pnpm install          # Install dependencies
pnpm dev              # Web development server
pnpm dev:native       # React Native (Expo)
pnpm storybook        # Component documentation
pnpm check:literals   # Validate no hard-coded values
pnpm validate:tokens  # Verify token resolution
pnpm test             # Run tests
pnpm build            # Production build
npx convex dev        # Convex backend dev server
```

## Architecture

- **Foundation**: Base UI (headless) + CSS Modules + design tokens
- **Backend**: Convex (real-time database, single source of truth)
- **Documentation**: Storybook 10.2 + Chromatic
- **Registry**: Registry model (copy into project, not npm)
- **Platforms**: React (Web), React Native (Mobile)

### Global Foundation Cascade

```
Brand → Platform → Viewport → Density → Theme → Component reads var(--Token-Name)
```

**CSS Cascade Layers** (declared in `packages/tokens/src/css/layers.css`):

```
@layer base, semantic, theme, density, brand;
```

The `brand` layer is injected at runtime by `useBrandCSS` and wins over all others. Full cascade + token resolution order: [`docs/architecture.md`](docs/architecture.md) § The Cascade and § Token Resolution Chain.

### Key Systems

| System              | How It Works                                                                                                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Color**           | 25-step OkLCH scales, base chroma lock, preset or custom                                                                                                                                                                                                                             |
| **Surfaces**        | 7 surface tokens (`default`/`ghost`/`minimal`/`subtle`/`moderate`/`bold`/`elevated`) resolved relative to parent step × 9 appearance roles. 7 content tokens + 6 state tokens per role. No BG/FG split.                                                                              |
| **Multi-Accent**    | Up to 9 appearance roles (primary/secondary/neutral/sparkle/positive/negative/warning/informative/brand-bg)                                                                                                                                                                          |
| **Typography**      | Relational: 27 sizes across 6 roles (Display/Headline/Title/Body/Label/Code), each aliased to `var(--Dimension-fN)`. Line heights = `var(--Dimension-f{N+offset})`. Brand-customizable Display/Headline f-steps + line height offsets. 4 font slots (primary/secondary/script/code). |
| **F-Scale**         | 25-step modular scale (f-8 to f16), drives all spacing + typography sizing                                                                                                                                                                                                           |
| **Density**         | CSS-only remapping: compact shifts tokens down 1 f-step, open shifts up                                                                                                                                                                                                              |
| **Responsive**      | Discrete per-platform values via `data-Breakpoint` (3 breakpoints)                                                                                                                                                                                                                   |
| **Injection**       | `useBrandCSSNew` → `computeNewStacking` → `generateFullCSS` → `validateBrandCSS` → `wrapCSSForInjection` → `<style>`                                                                                                                                                                 |
| **Surface Context** | CSS-only component adaptation via `[data-surface]` attribute — zero JS runtime                                                                                                                                                                                                       |

### Brand CSS Engine (summary)

Pure-function engine in `@oneui/shared/engine`, thin React wrapper `useBrandCSSNew` in `@oneui/ui`. Two-memo pipeline: Memo 1 (theme-independent) builds palette; Memo 2 (theme-dependent) runs surface stacking + CSS gen + validate + wrap. Injected via `useInsertionEffect` into `<style id="oneui-foundation-tokens">`. The surface algorithm mirrors the reference at `OneUIColourTool/packages/core/src/surfaceLogic.ts` — parent-step-relative resolution, no BG/FG distinction, no pre-computed matrix.

**Theme Scope** (Settings → controls WHICH brand's data feeds injection):

| Theme Scope                   | Surface/Typography source        | Dimensions/Fonts/Overrides       | Use case                            |
| ----------------------------- | -------------------------------- | -------------------------------- | ----------------------------------- |
| **Default Theme** (`preview`) | `platformBrandId` (One UI Theme) | `platformBrandId`                | Platform UI uses One UI Theme       |
| **Brand Theme** (`global`)    | Editing brand                    | `platformBrandId`                | Live preview of configured brand    |

**NEVER set `injectionMode: 'none'`** — brand CSS must always inject, otherwise surface/typography/stroke tokens silently disappear.

**Token boundary allowlist** — brand CSS can only inject these 22 prefix families (enforced by `tokenBoundary.ts`, derived from `tokenManifest.ts`):
`--Surface-*`, `--Text-*`, `--Primary-*`, `--Secondary-*`, `--Neutral-*`, `--Sparkle-*`, `--Brand-Bg-*`, `--Positive-*`, `--Negative-*`, `--Warning-*`, `--Informative-*`, `--Typography-Font-*`, `--Typography-Weight-*`, `--Typography-Size-*`, `--Border-*`, `--Focus-*`, `--Display-*`, `--Headline-*`, `--Title-*`, `--Body-*`, `--Label-*`, `--Code-*`

Full pipeline walkthrough, engine file table, data flows: [`docs/architecture.md`](docs/architecture.md) § CSS Injection Architecture.

### FOUC / Brand Switch Flash Prevention

Six cooperating layers guarantee zero visible flash. Full system: [`docs/fouc-prevention.md`](docs/fouc-prevention.md).

**Invariants you must not break:**

- `useBrandCSS` returns `null` (loading) vs `''` (intentional empty, mode=`none`) — callers use `??` not `||`
- Style element ID `oneui-foundation-tokens` is shared between blocking script and React (in-place update, no DOM gap)
- `data-brand-switching` transition-suppression rule must exist in **both** platform `<head>` inline style AND Storybook `preview.css`
- `<html>` renders with `data-theme="light" data-density="default" suppressHydrationWarning`; blocking script updates before CSS/React hydration

## Critical Rules

### Platform Components (MANDATORY)

**RULE: Platform UI in `apps/platform` MUST use OneUI design-system components for interactive controls and common UI primitives.** Import from `@oneui/ui/components/*` (or the existing platform wrapper when one already exists) for buttons, icon buttons, inputs, selects, toggles, checkboxes, badges, menus, dialogs, popovers, collapsibles/accordions, surfaces, tabs, navigation, loading indicators, and feedback UI.

Use plain HTML elements only for document structure and typography (`div`, `section`, `span`, `p`, headings) or when no OneUI component exists yet. Do not introduce ad hoc custom controls, native form controls, bespoke dropdowns/accordions/modals, or third-party UI widgets inside the platform app. If the design-system component is missing a needed capability, extend the OneUI component first or document the temporary exception in the local code.

### Typography (MANDATORY)

**RULE: Every text element in the platform app MUST use design system typography tokens. No hardcoded font sizes, weights, or line-heights. No legacy `--Typography-Size-*` or `--Typography-Weight-*` tokens in new code.**

**Token reference** (use these exact tokens):

| Role                      | Size token              | Line-height token         | Weight token                |
| ------------------------- | ----------------------- | ------------------------- | --------------------------- |
| Page h1 headline          | `--Headline-L-FontSize` | `--Headline-L-LineHeight` | `--Headline-L-FontWeight`   |
| Section heading           | `--Title-M-FontSize`    | `--Title-M-LineHeight`    | `--Title-M-FontWeight`      |
| Body paragraph (2+ lines) | `--Body-M-FontSize`     | `--Body-M-LineHeight`     | `--Body-FontWeight-Low`     |
| Small body / description  | `--Body-S-FontSize`     | `--Body-S-LineHeight`     | `--Body-FontWeight-Low`     |
| UI label / button text    | `--Label-S-FontSize`    | `--Label-S-LineHeight`    | `--Label-FontWeight-Medium` |
| Micro label / meta text   | `--Label-XS-FontSize`   | `--Label-XS-LineHeight`   | `--Label-FontWeight-Low`    |

**Always include `font-family: var(--Typography-Font-Primary)`** on every text element — it enables brand-level font customisation.

**Always pair a `line-height` token with every `font-size` token** — line-height drives the relational spacing system.

**Never use:**

- `--Typography-Size-*` (legacy) — use role-specific `--Body-M-FontSize`, `--Headline-M-FontSize` etc.
- `--Typography-Weight-*` (legacy) — use `--Body-FontWeight-High/Medium/Low` or `--Label-FontWeight-*`
- Literal numbers for font-size, line-height, or font-weight

**Component library reference:**

- Component stories: `packages/ui/src/components/*/**.stories.tsx`
- Typography tokens: `packages/tokens/src/css/typography/typography.css`
- Run `pnpm storybook` to browse all available components before building new UI

### Surface Context (MANDATORY — CORE OF THE DESIGN SYSTEM)

**RULE: Whenever placing components on a non-default background (dark sections, colored cards, hero areas), ALWAYS use `<Surface mode="...">` as the container. Never set background color manually on a div containing interactive components.**

Surface context is how OneUI matches Figma's variable-mode auto-resolution with zero JS runtime. Components adapt because the brand CSS engine emits `[data-surface="..."] { ... }` remapping blocks inside `@layer brand`. A raw `<div>` with a background is OUTSIDE this cascade by design — tokens inside do not remap, and components render invisible or mis-contrasted.

**The 7 surface tokens (one vocabulary, no BG/FG split):**

| Token      | Resolution                                                                              |
| ---------- | --------------------------------------------------------------------------------------- |
| `default`  | Page surface. 2500 light / 100 dark. Ignores parent.                                    |
| `ghost`    | Same step as parent (still triggers context remapping).                                  |
| `minimal`  | parent + 1 step toward contrasting direction                                             |
| `subtle`   | parent + 2 steps                                                                         |
| `moderate` | parent + 3 steps                                                                         |
| `bold`     | Role `baseStep` (or `darkerBaseStep` if parent is already dark). Falls back to large offset if too close to parent. |
| `elevated` | parent + 1 step toward lighter, always (capped at 2500).                                 |

The same `bold` token is used whether the surface is a hero section background or a primary button's fill. Context-awareness happens automatically because every surface is resolved against its parent step.

**Figma attention levels → Button variants:**

| Figma  | Variant  | Fill                | Text                  |
| ------ | -------- | ------------------- | --------------------- |
| High   | `bold`   | `--{Role}-Bold`     | `--{Role}-Bold-High`  |
| Medium | `subtle` | `--{Role}-Subtle`   | `--{Role}-TintedA11y` |
| Low    | `ghost`  | `transparent`       | `--{Role}-TintedA11y` |

Nested inside `<Surface mode="bold">`, these tokens remap automatically: `--{Role}-Bold` on the inner button resolves at the outer bold container's step, so the inner fill stays distinguishable; `--{Role}-Bold-High` flips to the contrasting extreme of the inner step. No per-component inversion logic, no separate "on-bold" token family at the API boundary.

**Usage:**

```tsx
// CORRECT — Surface triggers [data-surface] token remapping for every child.
<Surface mode="bold">
  <Button variant="bold">Fill stays distinguishable</Button>
  <Button variant="subtle">Tinted fill, readable text</Button>
  <Button variant="ghost">Readable text, no fill</Button>
</Surface>

// Also correct — subtle is just another surface token.
<Surface mode="subtle">
  <Card>Tinted container; content adapts.</Card>
</Surface>

// WRONG — no data-surface attribute means no token remapping for children.
<div style={{ background: 'var(--Primary-Bold)' }}>
  <Button variant="ghost">Text is dark on dark = BROKEN</Button>
</div>
```

**Three things that must happen together whenever you place components on a tinted / colored / dark surface:**

1. **Use `<Surface mode="...">` (or set `data-surface="..."` on a container).** This triggers the CSS token-remapping cascade for every child component. A `<div style={{ background }}>` does NOT work — tokens inside do not remap.
2. **Do not add decorative strokes / borders.** A tinted fill already provides the card boundary. `border: 1px solid var(--Border-Subtle)` on top of a Surface duplicates the cue, fights the fill, and muddies hierarchy. The ONLY time a stroke belongs on a tinted card is when fill contrast is < 1.5:1 against the page (rare).
3. **Use context-aware tokens only.** Inside a Surface, reference generic role tokens like `--Primary-High`, `--Primary-TintedA11y`, `--Text-High`, `--Text-Medium`. The brand CSS engine remaps these for each `[data-surface]` block. Hard-coding surface-specific aliases pins the colour and bypasses context awareness.

**Choosing which role fills the Surface** (e.g. a secondary-tinted card instead of the primary-tinted default subtle):

```tsx
// CORRECT — override --Surface-Fill-Subtle inline so the Surface renders in the
// secondary role while data-surface="subtle" still drives context remapping.
<Surface
  mode="subtle"
  style={{ '--Surface-Fill-Subtle': 'var(--Secondary-Subtle)' }}
>
  <Slider appearance="secondary" />
  <Checkbox appearance="secondary" />
</Surface>
```

Children that should lean on a specific role accept `appearance="secondary"` (or `sparkle`, `positive`, etc.). Combined with the Surface context, their on-colours resolve correctly.

**Legacy V4 mode names** (`'fg-bold'`, `'bg-subtle'`, `'bg-bold'`, `'fg-minimal'`, `'fg-subtle'`, `'bg-minimal'`) are still accepted by `<Surface>` and normalised to the canonical 7 tokens. They are deprecated — prefer the unified names in new code; the normaliser is scheduled for removal.

**Is the system context-aware?** Yes — but ONLY for elements that sit inside a `[data-surface]` container. A raw `<div>` with a background is outside the cascade by design. The rule above is the whole system.

Complete surface model (7 tokens + 7 content + 6 state tokens, remapping rules, editor integration, dark mode, validation, files): [`docs/surface-context-awareness.md`](docs/surface-context-awareness.md). The engine mirrors the reference at `OneUIColourTool/packages/core/src/surfaceLogic.ts`.

### Shape System (MOST IMPORTANT)

Shape t-shirt sizes (`6XS`–`6XL`) **derive from the dimension f-step scale**, exactly like spacing. This makes them responsive to platform and density changes via the dimension cascade. `Shape-Pill` (9999px) is a **standalone constant** — NOT part of the t-shirt scale.

Each component defines its own default shape token, overridable per brand via `--ComponentName-borderRadius`.

| Element Type                                    | Shape         | Jio Default           | Notes                                |
| ----------------------------------------------- | ------------- | --------------------- | ------------------------------------ |
| **Buttons**                                     | Brand-defined | `Shape-Pill` (9999px) | Override via `--Button-borderRadius` |
| **Other interactive** (inputs, chips, selects)  | Subtle radius | `Shape-3XS` (f-4)     | Per-component defaults               |
| **Non-interactive** (cards, containers)         | Token         | `XS`-`6XL`            | Derived from dimension scale         |
| **Circular elements** (avatars, dots, spinners) | Pill          | `9999px`              | Standalone constant                  |

### Zero Tolerance

- **No literals**: Zero hard-coded colors, pixels, or values
- **Token-only**: All styling via `var(--Token-Name)` (web) or `tokens.*` (native)
- **Base UI only**: Never fork primitive behaviors
- **WCAG AA**: Mandatory accessibility compliance

### Role-Explicit Tokens — For New Component Code

When writing or refactoring component CSS in `packages/ui/src/components/`, **always reach for the role-explicit unified tokens first**. The legacy aliases below remain emitted by the engine for backward compatibility, but new code must not introduce them as primary references.

| Use this (unified)         | Not this (legacy/V4)             |
| -------------------------- | -------------------------------- |
| `--Body-M-FontSize`        | `--Typography-Size-M`            |
| `--Body-FontWeight-Medium` | `--Typography-Weight-Medium`     |
| `--Body-M-LineHeight`      | `--Typography-LineHeight-Normal` |
| `--Primary-Bold`           | `--Primary-FG-Bold`, `--Surface-Bold` |
| `--Primary-Subtle`         | `--Primary-BG-Subtle`, `--Surface-Subtle` |
| `--Primary-High`           | `--Primary-Default-High`, `--Text-High` |
| `--Primary-Bold-High`      | `--Primary-FG-Bold-High`, `--Text-OnBold-High` |
| `--Primary-Hover`          | `--Primary-Default-Hover`        |
| `--Primary-Bold-Hover`     | `--Primary-FG-Bold-Hover`        |

Write `var(--Body-M-FontSize)` directly, not `var(--Body-M-FontSize, var(--Typography-Size-M))` — V2 typography tokens are statically defined in `packages/tokens/src/css/typography/typography.css` and always available. For surface tokens, a single fallback to a legacy alias is still acceptable during the cleanup window; the 4-deep fallback chains found in some modules (`Tabs.module.css` in particular) should be rewritten to the unified name first.

### Focus Halo Pattern (interactive components)

Companion rule to **Surface Context**. Interactive components draw a 2-layer focus indicator: an inner gap ring + an outer halo. The inner gap MUST use `--Surface-Halo-Gap` so it adapts to whatever surface the component is sitting on. Never use `--Surface-Main` directly — it's hardcoded to the page background and creates a visible "hole" inside `<Surface>` containers.

```css
.button:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 var(--Stroke-XL) var(--Surface-Halo-Gap, var(--Surface-Main)),
    0 0 0 var(--Focus-Outline-Width) var(--Focus-Outline);
}
```

`--Surface-Halo-Gap` is emitted in `cssGenNew.ts`: defaults to the page background at `:root`, remapped inside every `[data-surface]` block to the matching `--Surface-Fill-{Mode}` token (which is root-only and never remapped). The inline `var(--Surface-Main)` fallback only covers the instant before brand CSS injects on first paint.

### Appearance Type — Shared Canonical

Components with a multi-accent `appearance` prop MUST import the canonical type:

```ts
import type { ComponentAppearance } from '@oneui/shared';

export type ButtonAppearance = ComponentAppearance;
```

Do not redefine the appearance union locally. The shared type covers the full 9 roles + `'auto'`. If your component's CSS only wires a subset of roles (e.g., Input lacks `brand-bg`), keep a narrower local type with a comment explaining which CSS classes are missing — but **never expand the type beyond what the CSS supports**, or you'll create runtime gaps.

## Token Categories

- **Surface**: Per-role, parent-step-relative. 7 surface fills (`--{Role}-Default` / `Ghost` / `Minimal` / `Subtle` / `Moderate` / `Bold` / `Elevated`) + 7 content tokens (`--{Role}-High` / `Medium-Text` / `Low` / `Tinted` / `TintedA11y` / `Stroke-Medium` / `Stroke-Low`) + on-bold content (`--{Role}-Bold-High` / `Bold-Medium` / `Bold-TintedA11y`) + 6 state tokens (`--{Role}-Hover` / `Pressed` / `Bold-Hover` / `Bold-Pressed` / `Subtle-Hover` / `Subtle-Pressed`). Root-only fill tokens (`--{Role}-Fill-{Mode}`, `--Surface-Fill-{Mode}`) are never remapped inside `[data-surface]` blocks so Surface containers can read their own background. Legacy aliases (`--Surface-Bold`, `--Surface-Subtle`, `--{Role}-FG-Bold`, `--{Role}-BG-Subtle`, `--Text-High`, etc.) still emitted for components mid-migration.
- **Text**: `Text-High`, `Text-Medium`, `Text-Low`, `Text-OnBold-High` (legacy aliases from Primary role's Default on-colours)
- **Typography**: 6 roles × sizes as f-step aliases. `--Display-L-FontSize: var(--Dimension-f7)`, `--Body-M-LineHeight: var(--Dimension-f3)`, `--Body-FontWeight-High: 700`. Code font: `--Typography-Font-Code`
- **Spacing**: `Spacing-0`, `Spacing-0-5` through `Spacing-40`, plus `Spacing-Margin` and `Spacing-Gutter`
- **Shape**: `Shape-Pill` (9999px standalone), `Shape-6XS` through `Shape-6XL` (derived from dimension f-steps)
- **Motion**: `Motion-Duration-Discreet-*`, `Motion-Duration-Expressive-*`
- **Elevation**: Levels 0-5 with two-shadow formula

## Quality Gates

Before any component ships:

1. `pnpm check:literals` — Zero violations
2. `pnpm validate:tokens` — 100% resolved
3. `pnpm typecheck` — Zero errors
4. `pnpm test` — 90% coverage minimum
5. `pnpm test:a11y` — Zero critical violations
6. `pnpm check:parity` — Web ↔ Native consistency
7. `pnpm check:layers` — CSS layer order correct
8. `pnpm chromatic` — Visual regression passed

Component build workflow, Storybook 8-story requirement, Convex backend tables, test suite structure: [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md) §§ 9–13.

## Scientific Foundations

- **Typography**: Relational f-step aliases (`--Display-L-FontSize: var(--Dimension-f7)`). DIN 1450 determines f0 (base) in dimension module. 27 sizes × 6 roles. Line height = `var(--Dimension-f{N+offset})`
- **Color**: OkLCH perceptual color space, 25-step scales, base chroma lock
- **Touch targets**: 44x44px mobile, 24x24px desktop minimum
- **Spacing**: Modular f-scale (f-8 to f16, 25 steps), discrete per-platform values

## Brands

Brands are dynamic — created by users in the platform app and stored in Convex. Each brand has:

- `primaryHue` / `primaryChroma` — Brand color identity in OkLCH
- Up to 11 foundation types (color, surfaces, typography, platforms, etc.)
- Multi-accent appearance config with up to 9 roles (primary, secondary, neutral, sparkle, brand-bg, positive, negative, warning, informative)
- `algorithmVersion` field on foundations table — persisted marker (`2`) from the V4 era. Not gating any runtime behaviour today; kept in schema so old records round-trip.

## Do Not

- Use Tailwind (pure CSS Modules only)
- Fork Base UI behaviors
- Hard-code any visual values
- Skip accessibility testing
- Create components without Storybook stories
- Mix platform implementations in same file

## Performance Envelope

| Metric                        | Target    | Mechanism                                               |
| ----------------------------- | --------- | ------------------------------------------------------- |
| Brand CSS pipeline (cached)   | <5ms      | `computeInputHash` memo stabilization                   |
| Brand CSS pipeline (cold)     | <10ms     | Single-theme resolve, binary search contrast, pre-parsed RGB |
| Theme toggle                  | <5ms      | Theme-independent memo skips palette recomputation      |
| CSS size limit                | 50KB soft | `validateBrandCSS` warnings                             |
| Token count limit             | 800 soft  | `validateBrandCSS` warnings                             |
| Convex queries per brand load | 6-8       | Batched preset/ornament/font resolution                 |

Benchmark harness, regression gate, `pnpm bench:pipeline --bless`: [`docs/perf-harness.md`](docs/perf-harness.md).

## Known Exceptions

- `layout.tsx` loading spinner uses inline pixels — acceptable (renders before tokens load)
- `BrandLogo` / `LayoutSkeleton` in layout use inline values — skeleton/loading states
- Experience builder components use motion tokens (`--Duration-XS`, `--Motion-Easing-Transition`) for transitions instead of hardcoded values

## Project Knowledge

- [`docs/native-component-build-playbook.md`](docs/native-component-build-playbook.md) — End-to-end workflow for new `@oneui/ui-native` components (web + Layers parity, `interface.ts`, a11y)
- [`docs/architecture.md`](docs/architecture.md) — Full system architecture, cascade, CSS injection, data flows, file map
- [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md) — Setup, monorepo structure, component build, Storybook, Convex, testing, quality gates, workflows
- [`docs/surface-context-awareness.md`](docs/surface-context-awareness.md) — Complete unified surface system, `[data-surface]` remapping rules, token emission, files
- [`docs/fouc-prevention.md`](docs/fouc-prevention.md) — 6-layer zero-flash defence, regression tests
- [`docs/storybook-platform-sync.md`](docs/storybook-platform-sync.md) — Showcase components, Props & Usage generation, color override caveat
- [`docs/rfcs/0001-slot-naming.md`](docs/rfcs/0001-slot-naming.md) — Canonical slot vocabulary: `start`/`end`, `leading`/`trailing`, `parts`/`partProps`. Enforced by `pnpm check:metadata`
- [`docs/perf-harness.md`](docs/perf-harness.md) — Brand CSS pipeline benchmark + regression gate
- `colour_surfaces.md` — 25-step OkLCH scale, surface emphasis
- `typography.md` — DIN 1450 formula, platform presets
- `spacing.md` — Responsive interpolation
- `shapes.md` — Interactive vs non-interactive rules
- `elevations.md` — Two-shadow formula, dark mode strokes
- `motion.md` — Discreet vs Expressive timing
