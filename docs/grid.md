# Grid System

OneUI's grid is a thin layer over CSS Grid that reads the same per-platform token cascade as everything else in the system. Column count, gutter, margin, and max-width all switch automatically with the `data-Breakpoint` + `data-6-Density` attributes — no JS, no media queries in application code.

## Tokens

Four primitives drive the grid. Three come from `packages/tokens/src/css/dimensions/grid.css` + `scale.css`, derived per platform:

| Token | Scope | Purpose |
|---|---|---|
| `--Grid-Columns` | per-platform | Number of columns. Defaults: 4 (S), 8 (M), 12 (L) |
| `--Grid-Margin` | per-platform × density | Horizontal padding applied by `<Container>` (fluid + fixed variants) |
| `--Grid-Gutter` | per-platform × density | Gap between columns |
| `--Grid-MaxWidth` | per-platform | Cap for the `fixed` container variant. `none` at S/M, 1440px at L |

Brand CSS may override these via the `--Grid-*` token family in `@layer brand` (registered in `tokenManifest.ts`). Platform-level cascade always wins over the fallback `:root`.

## Components

```tsx
import { Container, Grid, Column } from '@oneui/ui';

<Container variant="fluid">
  <Grid>
    <Column span={{ S: 4, M: 4, L: 6 }}>Left</Column>
    <Column span={{ S: 4, M: 4, L: 6 }}>Right</Column>
  </Grid>
</Container>
```

### `<Container>`

Applies outer horizontal margin and (optionally) a max-width cap.

| `variant` | Behavior | When to use |
|---|---|---|
| `fluid` *(default)* | Fills the viewport, applies `--Grid-Margin`. No upper bound — works at any viewport, including > 1920px. | Dashboards, apps, software tools, any experience that should scale with the screen. |
| `fixed` | Capped at `--Grid-MaxWidth` (or the `maxWidth` prop). Centered via `margin-inline: auto`. | Marketing pages, reading content, forms — anything where line lengths should stop growing past a desktop breakpoint. |
| `full-bleed` | No margin, no cap. Edge-to-edge. | Hero sections, media strips, banner imagery. |

**Rule of thumb:** if the question is *"should the content stop at 1920?"* → `fixed`. *"Should it keep going forever?"* → `fluid`. *"Should it ignore the grid entirely for one section?"* → `full-bleed`.

You can override the cap per-container: `<Container variant="fixed" maxWidth="960px">`.

### `<Grid>`

Defines a CSS Grid track. Defaults to `repeat(var(--Grid-Columns), 1fr)` with `gap: var(--Grid-Gutter)`. Override per-breakpoint:

```tsx
<Grid columns={{ S: 4, L: 16 }}>…</Grid>   // Carbon-style 16-col desktop
<Grid columns={6} gap="var(--Spacing-4-5)">…</Grid>
```

### `<Column>`

Spans N columns within a `<Grid>`. Supports a fixed span or a per-breakpoint object with **mobile-first inheritance** — omitted breakpoints inherit from the next smaller one.

```tsx
<Column span={6} />                                 // 6 cols everywhere
<Column span={{ S: 4, M: 4, L: 6 }} />              // reflows per breakpoint
<Column start={3} span={4} />                       // offset: begin at col 3
```

**Breakpoint keys:** `S`, `M`, `L`.

## Grid Overlay (dev tool)

Import and mount once near the root of your app during development:

```tsx
import { GridOverlay } from '@oneui/ui';

<GridOverlay />   // toggle via Cmd/Ctrl+G or ?grid=1 in the URL
```

Reads the live grid tokens, so switching platform / density / brand in the editor updates the overlay automatically.

## Brand customization

**Editor:** `/foundations/grid` — configure column count, max-width (with an "Uncapped" toggle for software tools that should fill any viewport), and the default container variant per brand. Live preview reflows the grid per platform.

**Storage:** `foundations` Convex table with `type: 'grid'`. Config shape:

```ts
interface BrandGridConfig {
  platforms: Partial<Record<BreakpointId, {
    columns: number;
    maxWidth: number | null; // null = unbounded at that breakpoint
  }>>;
  defaultVariant?: 'fluid' | 'fixed' | 'full-bleed';
}
```

**CSS emission:** the `useBrandCSS` hook calls `generateGridCSS(config)` on every render; output is emitted inside `@layer brand` as:

```css
[data-Breakpoint="L"] {
  --Grid-Columns: 16;
  --Grid-MaxWidth: none;
}
```

Token-family allowlist (`--Grid-*`) is registered in `tokenManifest.ts` so brand overrides pass the validation boundary.

## Picking the right variant

```
┌──────────────────────────────────────────────────────────────┐
│ Are you building…                                            │
├──────────────────────────────────────────────────────────────┤
│ A dashboard, admin tool, Figma-like app?   →  fluid          │
│ A marketing page, blog, landing?           →  fixed          │
│ A long-form article or form?               →  fixed          │
│ A hero with edge-to-edge imagery?          →  full-bleed     │
│ A data table with >1920 usable content?    →  fluid          │
└──────────────────────────────────────────────────────────────┘
```

## Relationship to existing tokens

- Grid spacing (`--Grid-Margin`, `--Grid-Gutter`) is *derived from* the f-step scale (margin = f0, gutter = f0 × 0.5), so it shifts with `density` just like every other dimension.
- Column count is deliberately **not** density-scaled. Density changes feel (tighter/looser spacing); column count is a layout contract that shouldn't shift beneath a designer's feet.
- `Spacing-Margin` and `Spacing-Gutter` aliases in `componentTokens.ts` are available if you need the grid values as plain spacing tokens inside a non-grid component.

## Verification

- `pnpm --filter @oneui/shared test -- --run tokenManifest` — asserts the `--Grid-` family is registered.
- `pnpm --filter @oneui/ui test -- --run Grid` — component unit tests.
- `pnpm storybook` → Layout → Grid / Container — visual verification.
- `pnpm check:literals` — no hard-coded layout values.
