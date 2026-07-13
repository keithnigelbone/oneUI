# Storybook ↔ Platform Documentation Sync

> How component documentation stays in sync between Storybook and the platform without duplication.

## Problem

Platform `PageContent` files (component showcase pages) and Storybook stories both need to display the same component variants — attention levels, sizes, states, slots, appearances, surface context. Maintaining two copies means:

- Double QA effort on every change
- Inevitable visual drift between Storybook and platform
- 500–800 lines of hand-crafted JSX per component, duplicated

## Why Iframes / Storybook API Don't Work

| Approach | Why It Fails |
|----------|-------------|
| **Storybook iframe embed** | CSS custom properties (`var(--Token-Name)`) are document-scoped — they don't cross iframe boundaries. Brand CSS injected in the platform is invisible inside an iframe. |
| **Static Storybook build** | Same CSS isolation. Also: doesn't respond to live brand switches, requires separate build pipeline, goes stale. |
| **Storybook Data API (`index.json`)** | Gives metadata only. Rendering still requires iframes — same problem. |
| **`composeStories` (Portable Stories)** | Adds `@storybook/react-vite` runtime to Next.js. Story decorators (brand CSS, Convex, icons) conflict with the platform's own providers. |

## Solution: Co-located Showcase Components

Every component gets a `Component.showcase.tsx` file co-located in the UI package. It contains pure React display functions — zero Storybook dependencies, zero platform dependencies.

```
packages/ui/src/components/Button/
├── Button.tsx                 ← component implementation
├── Button.module.css          ← styles
├── Button.showcase.tsx        ← shared variant displays (single source of truth)
├── Button.stories.tsx         ← thin: imports showcase + adds Storybook meta
├── Button.meta.ts             ← component metadata
├── Button.tokens.ts           ← token manifest
├── Button.recipe.ts           ← recipe definition
└── index.ts                   ← exports showcase functions
```

### Showcase File Rules

1. **No Storybook imports** — no `@storybook/*` dependencies
2. **No platform imports** — no `@/contexts`, `@/components`, Convex hooks
3. **All styling via CSS tokens** — inline styles use `var(--Spacing-*)`, `var(--Typography-*)`, etc.
4. **Named exports** — one function per variant display (`ButtonAttentionLevels`, `ButtonSizes`, etc.)
5. **Correct appearance role** — components must use their default appearance (e.g., `appearance="secondary"` for Chip, Checkbox, Radio, Switch, Stepper)

### Example: `Button.showcase.tsx`

```tsx
import React from 'react';
import { Button } from './Button';

const row: React.CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: 'var(--Spacing-3-5)', alignItems: 'center',
};

export function ButtonAttentionLevels() {
  return (
    <div style={row}>
      <Button attention="high">High</Button>
      <Button attention="medium">Medium</Button>
      <Button attention="low">Low</Button>
    </div>
  );
}

export function ButtonSizes() { /* ... */ }
export function ButtonStates() { /* ... */ }
export function ButtonWithSlots() { /* ... */ }
export function ButtonAppearances() { /* ... */ }
export function ButtonFullWidth() { /* ... */ }
export function ButtonSurfaceContext() { /* ... */ }
```

---

## How Stories Consume Showcase

Stories become thin wrappers — they import showcase functions and add Storybook metadata (controls, play functions, viewport tests):

```tsx
// Button.stories.tsx
import { ButtonAttentionLevels, ButtonSizes, ButtonStates } from './Button.showcase';

export const AttentionLevels: Story = {
  name: 'Attention Levels',
  render: () => <ButtonAttentionLevels />,
};

export const Sizes: Story = {
  name: 'Sizes',
  render: () => <ButtonSizes />,
};

// Storybook-only stories (not shared):
// - Default (with argType controls)
// - Interactive (play functions)
// - Responsive (viewport tests)
// - Density (density comparison cards)
```

---

## How Platform Pages Consume Showcase

Platform `PageContent` files import the same functions, wrapping them in `FoundationCard` with brand-aware surface variables:

```tsx
// ButtonPageContent.tsx
import {
  ButtonAttentionLevels, ButtonSizes, ButtonStates,
  ButtonWithSlots, ButtonAppearances, ButtonFullWidth,
} from '@oneui/ui/components/Button';

<FoundationCard title="Attention Levels">
  <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStylesNoColors }}>
    <ButtonAttentionLevels />
  </div>
</FoundationCard>
```

### What Stays Platform-Only

| Content | Why |
|---------|-----|
| Surface preview (unified stacking modes) | Requires live Convex stacking data per brand |
| Appearance Roles grid | Uses `configuredRoles` from brand foundation data |
| `bold` surface row | Needs computed hex from the surface engine |
| Token editor (PropertyPanel) | Platform-only feature |
| Props & Usage (ComponentDocumentation) | Platform-only feature |

### What Stays Storybook-Only

| Content | Why |
|---------|-----|
| Default story (with argType controls) | Storybook controls panel |
| Interactive (play functions) | Storybook testing framework |
| Responsive (viewport tests) | Storybook viewport addon |
| Density comparison cards | Uses `computeResponsiveDensityOverrides` |

---

## Surface Ladder: one shared "Variants on Surfaces" section

Every interactive component should document how it adapts across the surface
ladder (`default → minimal → subtle → moderate → bold → elevated`). Rather than
each page hand-rolling that grid (they used to — and drifted, using legacy
typography tokens and inconsistent labels), there is one shared primitive:

```tsx
// packages/ui/src/showcase/SurfaceLadder.tsx  (imported via @oneui/ui/showcase)
<SurfaceLadder>
  <Button attention="high">Bold</Button>
  <Button attention="medium">Subtle</Button>
  <Button attention="low">Ghost</Button>
</SurfaceLadder>
```

Each row is a real `<Surface mode>`, so the tokens inside remap through the
`[data-surface]` cascade exactly as they do in the app. A component exposes its
ladder as a `<Name>SurfaceShowcase` in its `*.showcase.tsx` (e.g.
`ButtonSurfaceShowcase`), which is consumed by **both** the Storybook `Surfaces`
story and the platform docs — so they can't drift.

```tsx
// Button.stories.tsx — thin story
export const Surfaces: Story = { render: () => <ButtonSurfaceShowcase /> };
```

### Registry `docShowcase` contract → the generic doc page

`ComponentRegistryEntry.docShowcase` (in `packages/ui/src/registry/componentRegistry.ts`)
declares the standardized doc sections:

```ts
docShowcase?: {
  variants?: ComponentType; // attention levels / hero variants
  sizes?: ComponentType;    // size ramp
  surfaces?: ComponentType; // built on SurfaceLadder
}
```

`GenericComponentPageContent` renders these in order (Variants → Sizes →
Variants on Surfaces → Props & Usage). When `surfaces` is absent it falls back
to wrapping the real component in a `SurfaceLadder`, so **every** documented
component shows surface adaptation for free. Bespoke `*PageContent.tsx` pages
still win via Next.js static-segment precedence; migrate one by moving its
unique content into the showcase, registering `docShowcase`, then deleting the
bespoke page.

### Theme application — one global source

Component-theme CSS (`--Button-borderRadius`, `--Button-paddingHorizontal`, …)
is injected **once, globally at `:root`** by `FoundationStyleProvider`
(`#oneui-component-overrides`). The `/components` layout does **not** inject a
second scoped copy — doing so caused docs previews to drift from the platform
chrome. Docs previews and chrome therefore always reflect the same saved
`theme < recipe < manual` merge.

---

## Color Override Caveat: `previewTokenStylesNoColors`

Token manifests define default values using Primary role tokens (e.g., `--Chip-textColor-bold: var(--Primary-Default-Accent-A11y)`). When `buildComponentPreviewStyles()` bakes these into inline CSS variables on the showcase wrapper, they propagate via CSS custom property inheritance and **override the component's appearance class**.

This causes components with `appearance="secondary"` to display Primary role colors in their resting state, while hover/interaction states (which don't have `--Component-*` overrides) correctly resolve through the secondary appearance class.

**Fix**: All showcase sections that render components with non-primary appearance must use `previewTokenStylesNoColors` (filters out `--Component-backgroundColor-*`, `--Component-textColor-*`, `--Component-borderColor-*`):

```tsx
// WRONG — forces Primary colors via inline CSS vars
<div style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
  <ChipAttentionLevels /> {/* Chips use appearance="secondary" */}
</div>

// CORRECT — lets CSS appearance class resolve naturally
<div style={{ ...allRoleSurfaceVars, ...previewTokenStylesNoColors }}>
  <ChipAttentionLevels />
</div>
```

The full `previewTokenStyles` (with colors) should only be used in the PropertyPanel preview, where the user is explicitly customizing `--Component-*` token values.

---

## Props & Usage: Machine-Generated Documentation

Each component page includes a **Props & Usage** section powered by machine-generated `docs.json` files.

### Generation Pipeline

```
scripts/generate-machine-docs.ts
  ├── Reads: Component.shared.ts   → parses TypeScript interface for props
  ├── Reads: Component.tokens.ts   → extracts slot definitions
  ├── Reads: Component.recipe.ts   → extracts recipe decisions
  └── Writes: apps/platform/src/generated/component-docs/{component}.docs.json
```

Run with:
```bash
pnpm docs:machine
```

### Spec Structure (`ComponentDocumentationSpec`)

```typescript
{
  schemaVersion: '1.0.0',
  componentName: 'Chip',
  props: [
    { name: 'attention', type: "'high' | 'medium' | 'low'", required: false, description: '...' },
    // ...
  ],
  slots: [{ name: 'start', types: ['icon', 'avatar'], tokens: ['iconSize'] }],
  codeSnippets: [{ id: 'basic', title: 'Basic Usage', language: 'tsx', code: '...' }],
  intentAndPurpose: { /* ... */ },
  variantLogic: { rules: [/* ... */] },
  // ...
}
```

### Platform Integration

```tsx
import { ComponentDocumentation } from '@/components/machine-docs';
import type { ComponentDocumentationSpec } from '@oneui/shared';
import chipDocsJson from '@/generated/component-docs/chip.docs.json';

const chipDocs = chipDocsJson as ComponentDocumentationSpec;

<FoundationCard title="Props & Usage" collapsible>
  <ComponentDocumentation
    componentName="Chip"
    tokenManifest={CHIP_TOKEN_MANIFEST}
    recipeDefinition={CHIP_RECIPE_DEFINITION}
    baselineSpec={chipDocs}
    minimal
  />
</FoundationCard>
```

Without `baselineSpec`, `ComponentDocumentation` calls `createEmptySpec()` — resulting in an empty props table.

---

## No Dark Mode Sections

Component pages do **not** include light/dark theme comparison rows. Dark mode is toggled globally via the platform's theme setting (Settings → Theme Scope). This avoids:

- Duplicated rendering per theme (Storybook has a toolbar theme toggle instead)
- Incorrect token resolution (brand V4 tokens like `--Primary-Default-Low-Stroke` are NOT in `dark.css` — only semantic tokens like `--Surface-Main` are remapped, so `data-mode="dark"` on a nested div produces incorrect results)

---

## Default Appearance Roles per Component

When rendering showcase components, use the correct default appearance:

| Component | Default Appearance | Resolved From |
|-----------|--------------------|---------------|
| **Button** | `primary` | `useButtonState` — no appearance → primary |
| **Chip** | `secondary` | `useChipState` — auto/unset → secondary |
| **Checkbox** | `neutral` (borders) + `secondary` (fill via accent) | `useCheckboxState` — auto → neutral + accent secondary |
| **Radio** | `neutral` (borders) + `secondary` (fill via accent) | `useRadioState` — auto → neutral + accent secondary |
| **Switch** | `secondary` | `useSwitchState` — auto → secondary |
| **Stepper** | `secondary` (page root) | `useStepperState` — auto/omit → `useSurfaceAppearance()` ?? `secondary` |
| **LinkButton** | `primary` | `useLinkButtonState` — auto → primary |
| **Divider** | `neutral` | `useDividerState` — auto → neutral |
| **Avatar** | `primary` | `useAvatarState` — auto → primary |

---

## Checklist: Adding a New Component

1. **Create `Component.showcase.tsx`** in `packages/ui/src/components/Component/`
   - Export named functions for each variant display
   - Use correct default appearance role
   - Inline styles with CSS tokens only

2. **Export from `index.ts`** — add showcase functions to the component's barrel export

3. **Update `Component.stories.tsx`** — import showcase functions, replace inline renders

4. **Add to `generate-machine-docs.ts`**:
   - Import token manifest and recipe definition
   - Add `buildComponentSpec()` function
   - Add to `main()` specs array
   - Run `pnpm docs:machine`

5. **Update `ComponentPageContent.tsx`**:
   - Import showcase functions from `@oneui/ui/components/Component`
   - Import `ComponentDocumentation`, `ComponentDocumentationSpec`, and docs.json
   - Replace hand-crafted variant grids with showcase components
   - Use `previewTokenStylesNoColors` on showcase wrappers (not `previewTokenStyles`)
   - Add Props & Usage FoundationCard with `baselineSpec`
   - No dark mode comparison sections

6. **Verify**:
   - `pnpm typecheck` — zero new errors
   - `pnpm storybook` — stories render correctly
   - `pnpm dev` — platform page renders correctly with brand switching
   - Visual comparison: Storybook ↔ platform should be identical for shared variants

---

## File Map

| File | Role |
|------|------|
| `packages/ui/src/components/*/Component.showcase.tsx` | Single source of truth for variant displays (incl. `<Name>SurfaceShowcase`) |
| `packages/ui/src/showcase/SurfaceLadder.tsx` | Shared surface-ladder primitive (`@oneui/ui/showcase`) |
| `packages/ui/src/registry/componentRegistry.ts` | `docShowcase` contract wiring showcase sections into the generic doc page |
| `packages/ui/src/components/*/Component.stories.tsx` | Storybook: imports showcase + adds meta/controls (incl. `Surfaces` story) |
| `packages/ui/src/components/*/index.ts` | Exports showcase functions |
| `apps/platform/src/app/(platform)/(studio)/components/lib/GenericComponentPageContent.tsx` | Registry-driven standardized doc page (Variants → Sizes → Surfaces → Props) |
| `apps/platform/src/app/(platform)/(studio)/components/*/PageContent.tsx` | Bespoke platform pages: import showcase + wrap in FoundationCards |
| `scripts/generate-machine-docs.ts` | Generates props/slots/snippets from source |
| `apps/platform/src/generated/component-docs/*.docs.json` | Generated props documentation |
| `apps/platform/src/components/machine-docs/` | `ComponentDocumentation` React component |
