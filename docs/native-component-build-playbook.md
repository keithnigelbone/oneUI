# Native component build playbook

End-to-end workflow for adding or updating a component in `@oneui/ui-native` with **parity to `packages/ui` (web)**, cross-checked against **Layers React V4** and **Layers React Native**, including **accessibility**.

**Companion docs:**

- [Component folder inventory](./component-inventory.md) — which components exist per library
- [Component interface inventory](./component-interface-inventory.md) — prop-level matrix (refreshable)
- [Web ↔ native parity index](./parity/README.md) — behavioural parity guides per component

---

## 0. Reference map

| Source | Path | What to extract |
| ------ | ---- | ----------------- |
| **OneUI Web (primary)** | `packages/ui/src/components/<Name>/` | Behaviour, tokens, stories |
| **Web contract** | `packages/ui/src/components/<Name>/<Name>.shared.ts` | Props, types, `use*State` |
| **OneUI Native (target)** | `packages/ui-native/src/components/<Name>/` | Implementation |
| **Native contract** | `packages/ui-native/src/components/<Name>/interface.ts` | Owned API (no `@oneui/ui` import) |
| **Layers React** | `layers-web/libs/react-4/layers-ui/src/lib/componentsV4/jds<name>-4/generated/interface.ts` | Figma/codegen props, slots |
| **Layers RN** | `layers-web/libs/react-native/layers-ui/src/lib/componentsV4/jds<name>/generated/interface.ts` | RN (`testID`, Pressable) |

Default Layers root (adjust if your clone differs):

`/Users/ayusht/Documents/Projects/Jds/layers-web`

Refresh the prop matrix:

```bash
node scripts/generate-interface-inventory.mjs
# LAYERS_ROOT=/path/to/layers-web node scripts/generate-interface-inventory.mjs
```

---

## 1. Research phase (before code)

### 1.1 Confirm scope

- [ ] Component exists under `packages/ui/src/components/<Name>/` (web is **product API** source of truth).
- [ ] Note Layers `jds*` folder (aliases: Logo → `productlogo`, Progress → `linearprogressindicator`, LinkButton → `link`, PaginationDots → `carouselindicator`). See [component-inventory.md](./component-inventory.md).
- [ ] OneUI-only components (no Layers family): CounterBadge, IndicatorBadge, Separator — implement from web `.shared.ts` only.

### 1.2 Read web implementation

| File | Purpose |
| ---- | ------- |
| `<Name>.shared.ts` | Props, unions, `use*State`, attention→variant |
| `<Name>.tsx` | Render tree, Base UI, delegation (e.g. Button → LinkButton) |
| `<Name>.module.css` | Token-driven size, paint, motion |
| `<Name>.meta.ts` / recipe | Brand overrides (`cornerRadius`, density) |
| `<Name>.stories.tsx` | Story matrix (8 types per DEVELOPER_GUIDE) |

Draft a parity table for `docs/parity/<name>-web-native-parity.md`:

| Topic | Web | Native plan |
| ----- | --- | ----------- |
| Variants / attention | | `useSurfaceTokens` + inline paint |
| Sizes | | `tokens.spacing['N']` in styles |
| States | | disabled, loading, … |
| Slots | | `ReactNode` (string icon names often unsupported) |
| Surface nesting | `[data-surface]` | `<Surface mode>` parent |
| A11y | DOM roles / aria-* | RN helpers in `interface.ts` |

### 1.3 Read Layers React + RN interfaces

Record:

- **Naming**: Layers `ariaLabel` vs OneUI `aria-label` — native `interface.ts` should support **web parity** plus RN passthrough where needed.
- **Slots**: Layers typed elements (`content`, `start`, `end`); OneUI `ReactNode` / semantic icon strings on web.
- **Unified button**: Layers `JDSButtonProps.variant` = `button | iconButton | singleText`; OneUI splits Button, IconButton, LinkButton.
- **RN-only**: `testID` on Layers RN — add on native props.

### 1.4 Token mapping (web CSS → native)

| Web | Native |
| --- | ------ |
| `var(--Spacing-4)` | `tokens.spacing['4']` |
| `var(--Label-S-FontSize)` | `useTypographyTokens('label', 'S', { emphasis })` |
| `var(--Primary-Bold)` | `useSurfaceTokens('primary').surfaces.bold` |
| `var(--Shape-Pill)` | `tokens.shape.Pill` or `resolveRecipeBorderRadius` |
| `var(--Motion-…)` | `useMotion()` |

**Do not** use `tokens.dimension.f*` or legacy t-shirt spacing (`M`, `5XS`) in native styles. For theme builders only: `packages/ui-native/src/utils/spacingKeys.ts` (not exported from `@oneui/shared`).

---

## 2. Folder scaffold (Layers-style)

```text
packages/ui-native/src/components/<Name>/
  interface.ts                 # Props + types + use*State + a11y (single file)
  <Name>.native.tsx            # Render + dynamic brand paint
  <Name>.styles.native.ts      # Static StyleSheet (geometry only)
  <Name>.showcase.native.tsx   # Gallery / sample sections
  index.ts                     # Barrel
  <name>A11y.test.ts           # Vitest for a11y helpers (recommended)
  __tests__/                   # Layout tests if needed
```

**Mandatory conventions:**

- **Do not** import from `@oneui/ui/components/.../shared`.
- **Do not** add a separate `*A11y.ts` — merge accessibility into `interface.ts`.
- Button-family components reuse `packages/ui-native/src/utils/buttonStateBase.ts`.

---

## 3. Author `interface.ts`

Native peer of Layers `generated/interface.ts` + web `*.shared.ts`.

### 3.1 Copy from web `.shared.ts`

1. Export types: `*Appearance`, `*Attention`, `*Variant`, `*Size`, …
2. `appearance` → `ComponentAppearance` from `@oneui/shared` (never redefine locally).
3. Copy `use*State` logic (attention→variant, `auto` → `primary`, etc.).
4. Button / IconButton / LinkButton: use `buttonStateBase.ts`.

### 3.2 Adapt for React Native

| Web-only | Native |
| -------- | ------ |
| `style?: CSSProperties` | `style?: ViewStyle` |
| `className` | omit |
| `onClick` | keep optional; implement `onPress` |
| `type?: 'button' \| 'submit'` | omit on non-form controls |
| `as?: ElementType` | omit |

### 3.3 Accessibility (in same file)

```ts
export interface MyComponentProps {
  // … web-aligned props …
  accessibilityHint?: string;
  testID?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'dialog' | 'grid' | 'listbox' | 'menu' | 'tree';
  'aria-controls'?: string;
  'aria-hidden'?: boolean;
}

export function getMyComponentAccessibilityProps(/* … */): {
  accessible: boolean;
  accessibilityRole: /* … */;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: { disabled?: boolean; busy?: boolean };
} { /* … */ }
```

| Pattern | Guidance |
| ------- | -------- |
| Interactive | `Pressable` + `accessibilityRole="button"` (or appropriate role) |
| Decorative subnodes | `accessible={false}`, `importantForAccessibility: 'no-hide-descendants'` (see Divider, Logo) |
| Live updates | `accessibilityLiveRegion: 'polite'` (Badge, CounterBadge) |
| Required name | `'aria-label': string` on icon-only controls |

### 3.4 Layers ↔ OneUI mapping (document in parity MD)

Example (Button family):

| Concept | OneUI | Layers `JDSButtonProps` |
| ------- | ----- | ------------------------ |
| Emphasis | `variant` / `attention` | `attention` only |
| Size | f-steps `6\|8\|10\|12` + aliases | `2XS`…`XL` |
| Label | `children` | `content` element |
| Icon-only | `<IconButton>` | `variant="iconButton"` |

---

## 4. Static styles — `<Name>.styles.native.ts`

- `StyleSheet.create` for layout geometry only (padding, gap, minHeight, minWidth).
- Per-size maps: `CONTAINER`, `SLOT_LEFT`, etc. keyed by size union from `./interface`.
- **Zero literals** for color, px, font sizes (`pnpm check:literals`).
- **No brand colors** in StyleSheet — paint is inline in `.native.tsx` via `useSurfaceTokens`.

```ts
import { tokens } from '@oneui/tokens';
import type { MySize } from './interface';

export const CONTAINER: Record<MySize, ViewStyle> = {
  m: {
    paddingHorizontal: tokens.spacing['3-5'],
    paddingVertical: tokens.spacing['1'],
    gap: tokens.spacing['2'],
  },
};
```

---

## 5. Implementation — `<Name>.native.tsx`

### 5.1 Render pipeline

1. `use*State(props)` from `./interface`
2. `useSurfaceTokens(resolvedAppearance)`
3. `get*AccessibilityProps(props, state)`
4. Optional: `useComponentRecipe('<slug>')`, `resolveRecipeBorderRadius`
5. Optional: `useTypographyTokens` + `typographyToTextStyle`
6. Optional: `useMotion` / `useReduceMotion` for press or loading

```tsx
export function MyComponent(props: MyComponentProps): React.ReactElement {
  const state = useMyComponentState(props);
  const role = useSurfaceTokens(state.resolvedAppearance);
  const a11y = getMyComponentAccessibilityProps(props, state);

  return (
    <Pressable
      {...a11y}
      testID={props.testID}
      onPress={props.onPress ?? props.onClick}
      style={({ pressed }) => [
        styles.root,
        { backgroundColor: paint.bg },
        pressed && { backgroundColor: paint.pressedBg },
        props.style,
      ]}
    >
      {/* label, slots */}
    </Pressable>
  );
}

export type { MyComponentProps } from './interface';
```

### 5.2 Paint model

Mirror web CSS variant → token mapping with `NativeRoleTokens`:

- **bold** → `surfaces.bold`, `onBoldContent.high`
- **subtle** → `surfaces.subtle`, `onSubtleContent.tintedA11y`
- **ghost** → transparent + `content.tintedA11y` + optional hairline border

### 5.3 Surface context

On non-default backgrounds, wrap with `<Surface mode="…">` — never hard-code hero/card fills on a raw `View`. See [surface-context-awareness.md](./surface-context-awareness.md).

### 5.4 Web delegation parity

| Web | Native |
| --- | ------ |
| `Button` `contained={false}` → `LinkButton` | Same branch in `Button.native.tsx` |
| Icon-only | `IconButton.native`, not `Button` |

### 5.5 Known gaps (document, do not fake)

- `SemanticIconName` string slots — dev warning; use `ReactNode` / `Icon`.
- Web `decoration` ornaments — optional / future SvgXml.
- Web-only `type` on Button — ignored on native.
- LinkButton hover underline — native uses `showUnderline` prop.

---

## 6. Showcase — `<Name>.showcase.native.tsx`

Mirror web showcase / stories:

- Variant × size grids
- All `COMPONENT_APPEARANCE_ROLES` where applicable
- `<Surface mode="bold">` sections
- Disabled / loading
- Slots via `Icon` + showcase glyphs (see Button)

Wire in `package.json` exports if needed:

```json
"./showcase/<Name>": "./src/components/<Name>/<Name>.showcase.native.tsx"
```

---

## 7. Exports

**`index.ts`:**

```ts
export { MyComponent } from './MyComponent.native';
export type { MyComponentProps } from './interface';
export { useMyComponentState, getMyComponentAccessibilityProps } from './interface';
```

**`packages/ui-native/src/index.ts`:** re-export component + main props type.

---

## 8. Parity documentation

1. Add `docs/parity/<name>-web-native-parity.md` (use [button](./parity/button-web-native-parity.md) or [badges](./parity/badges-web-native-parity.md) as templates).
2. Update [parity/README.md](./parity/README.md).
3. Re-run `node scripts/generate-interface-inventory.mjs` if props changed.

---

## 9. Quality gates

```bash
pnpm --filter @oneui/ui-native typecheck
pnpm test --filter @oneui/ui-native
pnpm check:literals
pnpm validate:tokens
pnpm check:parity
```

Manual QA:

- `apps/native-components-sample` (or `pnpm dev:native`)
- Default surface + `<Surface mode="bold">`
- VoiceOver / TalkBack: name, hint, disabled, busy

---

## 10. Which reference wins?

```
packages/ui (*.shared.ts)  ← Product API & behaviour (PRIMARY)
        │
        ├── interface.ts (native owned contract + RN a11y)
        ├── Layers React interface (Figma enums, slot element types)
        └── Layers RN interface (testID, Pressable types)
```

- **Public API** follows **web**.
- **Layers** informs naming and QA expectations; do not copy layout-only Container props into OneUI Container.

---

## 11. Per-component checklist

| Step | Done |
| ---- | ---- |
| Read web `.shared.ts`, `.tsx`, `.module.css`, stories | ☐ |
| Read Layers React + RN `interface.ts` | ☐ |
| Review row in `component-interface-inventory.md` | ☐ |
| `interface.ts` (types, state, a11y) | ☐ |
| `*.styles.native.ts` | ☐ |
| `*.native.tsx` | ☐ |
| `*.showcase.native.tsx` | ☐ |
| `index.ts` + package export | ☐ |
| `*A11y.test.ts` | ☐ |
| `docs/parity/<name>-web-native-parity.md` | ☐ |
| Quality gates + a11y smoke test | ☐ |

---

## 12. `interface.ts` starter template

```ts
/**
 * <Name> interface (native)
 * Semantic source: packages/ui/.../<Name>.shared.ts
 * Cross-check: Layers jds<name>-4 + jds<name>/generated/interface.ts
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';

export type MyAppearance = ComponentAppearance;

export interface MyComponentProps {
  appearance?: MyAppearance;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityHint?: string;
  'aria-label'?: string;
  children?: ReactNode;
}

export function useMyComponentState(props: MyComponentProps) {
  const resolvedAppearance =
    props.appearance === 'auto' || !props.appearance ? 'primary' : props.appearance;
  return { resolvedAppearance };
}

export function getMyComponentAccessibilityProps(
  props: Pick<MyComponentProps, 'aria-label' | 'accessibilityHint'>,
): {
  accessible: boolean;
  accessibilityRole: 'text';
  accessibilityLabel?: string;
  accessibilityHint?: string;
} {
  return {
    accessible: Boolean(props['aria-label']),
    accessibilityRole: 'text',
    accessibilityLabel: props['aria-label'],
    accessibilityHint: props.accessibilityHint,
  };
}
```

---

## Related

- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) — web component build, Storybook, gates
- [ui-native README](../packages/ui-native/README.md) — theme, Surface, spacing
- [AGENTS.md](../AGENTS.md) — surface context, typography, zero literals
