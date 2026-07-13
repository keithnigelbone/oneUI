---
name: oneui-multi-brand
visibility: internal
description: >
  Architecture guardrails and component configuration system for OneUI Studio,
  a multi-brand design system platform. Use when building, editing, or reviewing
  any code that touches brand theming, CSS token injection, component recipes,
  surface stacking, foundation data, Convex schema for brands, or the Storybook
  brand preview. Also use when user says "brand", "multi-brand", "theme scope",
  "recipe", "component customization", "token override", "foundation style",
  "surface stacking", "brand CSS", or asks to add/edit a component's brand
  configuration. Do NOT use for general React/Next.js questions unrelated to
  branding, or for design system token authoring at the primitive level.
metadata:
  author: OneUI Studio
  version: 1.0.0
  category: design-system
---

# OneUI Multi-Brand Design System Skill

This skill enforces architecture, data flow, and component configuration
guardrails for OneUI Studio — a multi-brand design system platform built with
Next.js, Convex, and CSS custom properties.

## When to Load References

- Working on brand CSS injection or `useBrandCSS` → read `references/css-injection-architecture.md`
- Working on component configuration UI or recipes → read `references/component-recipe-system.md`
- Working on Convex schema or brand data → read `references/convex-schema-rules.md`
- Working on Storybook brand preview → read `references/css-injection-architecture.md` (Storybook section)

---

## Critical Architecture Rules

### 1. Three-Tier Customization Model

All component customization MUST follow this hierarchy. Never bypass it.

**Tier 1 — Brand Foundations (fully configurable)**
Color palettes, accent/role assignments, type scale, spacing density, corner
radius strategy. Configured once per brand, flows through everything.

**Tier 2 — Component Recipes (constrained choices)**
Per-component design decisions. Maximum 6 decisions per component, maximum
4 options per decision. Each option maps to semantic tokens. This is the
PRIMARY customization surface for brand teams.

**Tier 3 — Raw Overrides (escape hatch, hidden by default)**
Direct token overrides. Requires written justification and a review date.
Should cover less than 5% of brand configurations. Flagged visibly in UI.

**NEVER** create a component configuration UI that exposes raw CSS properties
(hex colors, pixel values, raw token names) as the primary editing surface.
Always use recipe decisions first.

### 2. CSS Injection Safety

The `injectionMode` parameter prevents brand CSS from
destroying the platform app's own UI.

| injectionMode | Effect                                                  |
|---------------|---------------------------------------------------------|
| `none`        | Brand CSS computed but never injected. App is safe.     |
| `scoped`      | Brand CSS injected under `[data-brand-scope]` selector. |
| `global`      | Brand CSS at `:root`, overrides entire app. Storybook only. |

**Rules:**
- Platform app defaults to `preview`. Never change this default.
- Storybook hardcodes `global`. There is no toggle.
- The `scoped` mode is for brand-themed previews inside the platform app
  without affecting the app chrome.
- The injected `<style>` tag is ALWAYS last in the CSS cascade.

### 3. Token Resolution Order

CSS tokens must be imported in this exact order. Violating this breaks the cascade.

1. `dimensions/scale.css` — per-platform f-step values
2. `motion/motion.css` — animation tokens
3. `typography/typography.css` — type tokens
4. `primitives.css` — clamp() fallbacks and raw values
5. `semantic.css` — contextual mappings
6. `light.css` / `dark.css` — theme surface overrides
7. `density/compact.css` etc — density remapping
8. `<style id="oneui-foundation-tokens">` — brand CSS injection (highest precedence)

### 4. Convex Data Rules

- **One subscription per consumer.** `FoundationStyleProvider` subscribes to
  `getBrandOverviewData`. All children read from `FoundationDataContext`.
  Never create duplicate subscriptions.
- **Recipe selections get their own table.** Use `componentRecipeSelections`
  (not `componentTokenOverrides`) to store recipe decisions. Store the
  decision key-value pairs, not the resolved token output. Resolution
  happens at runtime so foundation changes propagate automatically.
- **Brand overview query returns everything.** Color scales, surfaces config,
  typography, presetSelection, appearanceConfig, availablePlatforms — all
  in one query. Do not split into multiple queries.

### 5. useBrandCSS Pipeline

The `useBrandCSS` hook in `packages/ui/src/hooks/useBrandCSS.ts` is shared
by both platform and Storybook. V4-only pipeline — no legacy branches.

Two-memo architecture:

**Memo 1 (theme-independent):** Builds color scales + V4 palette data.
Dependencies: `[paletteHash]` (stable hash of colorConfig + presetSelection + appearanceConfig).
Does NOT recompute on light↔dark toggle.

**Memo 2 (theme-dependent):** Single-theme V4 surface computation → CSS
generation → validation → wrapping.
Dependencies: `[paletteData, typographyHash, decorationsHash, theme, resolvedMode]`.
Uses `computeV4StackingForTheme` to compute only the active theme (halves cost).

Final output is gated by `injectionMode`:
   - `none` → returns `{ cssContent: '' }`
   - `scoped` → returns `{ cssContent: '[data-brand-scope] { ... }' }`
   - `global` → returns `{ cssContent: ':root { ... }' }`

**Validation before injection:** Before any CSS touches the DOM, validate
that critical tokens exist (surface tokens, text tokens). If validation
fails, fall back to empty string and log the error.

Hash-based stability: `computeInputHash` from `@oneui/shared/engine` creates
stable cache keys. When Convex returns a new object reference but identical
data (e.g., user edited motion/spacing), the memos skip recomputation.

### 6. Component Recipe Rules

When creating or modifying a component recipe:

- **Maximum 6 decisions per component.** If you need more, the component is
  too complex or the decisions are too granular.
- **Maximum 4 options per decision.** More means the decision space is too open.
- **Every option maps to semantic tokens.** Never reference raw values.
- **Include a rationale for every decision.** If you cannot explain why a brand
  team would care, it should not be a recipe decision.
- **Frame decisions as questions.** "What color should the Bold button use?"
  not "boldFillStrategy".
- **Default options produce the most neutral result.** A brand accepting all
  defaults gets a clean, professional component.

See `references/component-recipe-system.md` for the full recipe schema and
all component recipes.

### 7. State Persistence

| Key                        | Storage      | Values                          | Default   |
|----------------------------|--------------|---------------------------------|-----------|
| `oneui-studio:theme`       | localStorage | `light` or `dark`               | `light`   |
| `oneui-studio:theme-scope` | localStorage | `preview`, `scoped`, or `global`| `preview` |
| `oneui-studio:density`     | localStorage | `compact`, `default`, or `open` | `default` |

All values hydrate after mount via a single `useEffect` to avoid SSR/client
hydration mismatches. Use a blocking `<script>` in `<head>` for theme to
prevent flash of wrong theme on hard navigation.

### 8. Error Resilience

Every path that generates or injects CSS must handle these failure cases:

- **Convex query returns partial data:** Fall back to base tokens (empty
  cssContent). Never inject partial brand CSS.
- **Convex query fails entirely:** Same as above. Log error, do not break UI.
- **Generated CSS missing critical tokens:** Validation layer catches this
  before injection. Fall back to empty.
- **Stale subscription data:** Convex subscriptions are reactive. If data is
  stale, the subscription will update. Do not add manual polling.

### 9. Storybook-Specific Rules

- `injectionMode` is hardcoded `'global'`. No settings toggle.
- Brand selector lives in the manager toolbar (esbuild-bundled).
- Brand ID passes to preview iframe via `context.globals.brand` (postMessage).
- Preview iframe uses the same `useBrandCSS` hook with `injectionMode: 'global'`.
- The `BrandStyleDecorator` component injects via `useStyleInjection`.
- Watch for timing issues: preview iframe may render before brand global
  propagates. Add a loading state or skeleton until foundationData resolves.

---

## Code Review Checklist

When reviewing any PR that touches multi-brand functionality, verify:

- [ ] No duplicate Convex subscriptions to `getBrandOverviewData`
- [ ] Recipe decisions stored as key-value pairs, not resolved tokens
- [ ] No raw CSS values in component recipe options (hex, px, font names)
- [ ] CSS injection gated by `injectionMode` (never unconditional)
- [ ] No new conditional branches added directly to `useBrandCSS`
- [ ] Token import order preserved if CSS files modified
- [ ] Error handling for partial/failed Convex data
- [ ] localStorage keys use `oneui-studio:` prefix
- [ ] Storybook decorator does not add a theme-scope toggle
- [ ] Component recipe has 6 or fewer decisions
- [ ] All recipe options map to semantic tokens
- [ ] Tier 3 overrides have justification and review date

---

## Common Mistakes

**Mistake: Exposing raw token dropdowns to brand teams**
The granular editor (showing "FG Minimal", "9XL (52px)") leaks implementation
details. Use recipe decisions with human-readable questions instead.

**Mistake: Storing resolved CSS as the recipe output**
If you store `{ backgroundColor: "var(--Surface-Bold)" }` instead of
`{ boldFillStrategy: "accent" }`, you lose the intent. When foundations
change, the recipe cannot re-resolve.

**Mistake: Adding `:root` injection in the platform app without the safety gate**
All CSS injection in the platform must go through `useBrandCSS` with the
`injectionMode` parameter. Direct `<style>` injection at `:root` bypasses
the safety mechanism.

**Mistake: Creating component-specific Convex queries**
Do not create `getButtonConfig`, `getCardConfig`, etc. All foundation data
comes from `getBrandOverviewData`. Component recipes read from
`componentRecipeSelections` and resolve against the shared foundation data.

**Mistake: Duplicating stacking logic outside useBrandCSS**
All surface stacking computation lives in `useBrandCSS` and its strategy
functions. Do not recompute stacking in component-level code.
