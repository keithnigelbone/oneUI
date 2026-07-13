# Badge API vs component source — validation report

Generated from `packages/ui/src/components/Badge/Badge.shared.ts`, `Badge.tsx`, and `Badge.stories.tsx`, cross-checked against the Figma-aligned API table supplied for this task.

## Summary

| Property (API) | In `BadgeProps` | Type / values vs Figma | Extra vs Figma | Default vs Figma | Status |
|----------------|-----------------|-------------------------|----------------|------------------|--------|
| `size` | Yes (`size`) | Figma: XS,S,M,L,XL — code: `xs`,`s`,`m`,`l`,`xl` (case differs; values align) | None | Default `m` ↔ Figma **M** | **PASS** (naming) |
| `attention` | Yes | `high` \| `medium` \| `low` | None | Unset → resolves to **high** (bold) per `useBadgeState` | **PASS** |
| `appearance` | Yes | Figma 9 + `auto` listed; code uses `ComponentAppearance` (`auto` + 11 roles) | **tertiary**, **quaternary**, **brand-bg** in code, not in supplied Figma 9 table | `auto` → **primary** when unset or `auto` | **WARN** (extra roles) |
| `start` | Yes (`start?: ReactNode`) | Figma: symbolic slot modes; code accepts any `ReactNode` (Icon, Avatar, CounterBadge, IndicatorBadge), not string enums | API-as-strings not in TS; behaviour matches Storybook mappings | — | **PASS** (model differs) |
| `end` | Yes (`end?: ReactNode`) | Same as `start` | Same | — | **PASS** (model differs) |
| `accent` | **No** | N/A | — | — | **MISSING** — use `appearance` |
| `content` | **No** | N/A | — | — | **MISSING** — use `children` for label text |

## Detail

### Implemented props (not in the 7-row Figma list)

- **`variant`**: `bold` \| `subtle` \| `ghost` — direct mapping to CSS; Figma table uses `attention` instead. `variant` overrides `attention` when both set.
- **`className`**, **`style`**, **`aria-label`**, **`data-testid`** (web QA): present for integration tests and layout.

### `appearance` extra values (code vs supplied Figma 9)

`ComponentAppearance` includes **`tertiary`**, **`quaternary`**, and **`brand-bg`**. They are implemented in `Badge.module.css` / `appearanceClassMap`. The supplied Figma table lists nine named roles plus `auto`; treat the three above as **code extensions**.

### `start` / `end` typing

The API table describes discrete slot kinds (`none`, `Icon`, …). The component API is **`ReactNode`**: you pass real elements (e.g. `<Icon icon="heart" />`), not the string `"Icon"`. Storybook uses a **control mapping** from string keys to nodes (`Badge.stories.tsx` `argTypes.start.mapping`).

### Defaults (`useBadgeState` / `Badge.tsx`)

- **`size`**: default `'m'` on the component.
- **`attention`**: unset → `resolvedVariant` `'bold'` (high).
- **`appearance`**: unset or `'auto'` → resolved **`primary`**.

### Storybook story coverage (high level)

| Story | Covers |
|-------|--------|
| `Default` | children, attention, size, aria-label |
| `Variants` | attention → bold/subtle/ghost |
| `Sizes` | size xs–xl |
| `WithSlots` | start/end: Icon, IndicatorBadge, CounterBadge, Avatar; combined rows |
| `SizesWithSlots` | size × slot type matrices |
| `Appearances` | appearance × attention for **11** concrete roles (not limited to Figma 9) |
| `Interactive` | play: role=status |
| `Responsive` | sizes in mobile viewport |
| `Themes` / `InsideBoldSurface` / `InsideSubtleSurface` / `SurfaceContext` | Surface + Badge |
| `SlotAdaptation` | slots × attention |
| `FigmaParity` / `FigmaSlotMatrix` | geometry / slot regression |

**Gaps vs this task’s playground:** the dedicated QA page (`apps/qa-playground/src/components/badge/BadgeQaShowcase.tsx`) now adds stable **`data-testid`** anchors and explicit **Figma 9 appearance** strip; Storybook already covered broader roles and matrices.

## Playground

See `BadgeQaShowcase` in the QA app (`/c/badge` → Test Scenarios tab). This file: `apps/qa-playground/public/qa-reports/prop-validation-report.md`.
