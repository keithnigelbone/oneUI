# HeaderNative

## Overview

The `HeaderNative` compound component implements the Figma **HeaderNative** micropattern for React Native. It is **not** the web `WebHeader` API — props and layout follow the native Figma component set (`homeBar`, `contextBar`, `searchBar`).

Structure:

```
HeaderNative
├── PrimaryNav     — chrome row (logo, back, search, actions) — no HeaderItem children
└── SecondaryNav   — tab row (HeaderItem children; requires secondaryNav=true)
    └── HeaderItem
```

**Composition rule:** `HeaderItem` belongs in `SecondaryNav` only. `PrimaryNav` does not accept or render nav tabs — unlike web `WebHeader`, where `HeaderItem` can sit in the primary row middle section. This matches the native Figma micropattern.

Native implementation: `HeaderNative.native.tsx` · `HeaderItem.native.tsx` · contract: `interface.ts` · showcase: `HeaderNative.showcase.native.tsx`

**Figma:** OneUI Micropatterns — `HeaderNative` (2134:15129), `HeaderNative.PrimaryNav` (2134:13491), `HeaderNative.SecondaryNav` (2134:14646)

## Import

```typescript
import {
  HeaderNative,
  PrimaryNav,
  SecondaryNav,
  HeaderItem,
  resolvePrimaryNavLayout,
} from '@oneui/ui-native';
```

Wrap the app in `OneUIBrandProvider` so surface, typography, and brand tokens resolve correctly.

## HeaderNative props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `expanded` | `boolean` | `false` | Two-row layout when combined with `PrimaryNav.titleContent` |
| `secondaryNav` | `boolean` | `false` | Show the `SecondaryNav` row |
| `divider` | `boolean` | `false` | Horizontal divider below the header |
| `children` | `ReactNode` | — | `PrimaryNav` and optional `SecondaryNav` |
| `aria-label` | `string` | — | Landmark label (`accessibilityRole="header"`) |
| `style` | `ViewStyle` | — | Root container styles |
| `testID` | `string` | — | Test identifier |

## PrimaryNav props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `type` | `'homeBar' \| 'contextBar' \| 'searchBar'` | `'homeBar'` | Bar layout variant |
| `expanded` | `boolean` | `false` | Same expanded rule as `HeaderNative.expanded` (either can drive layout) |
| `start` | `boolean` | `true` | Show start slot |
| `end` | `boolean` | `true` | Show end slot |
| `avatar` | `boolean` | `false` | Show `avatarSlot` in the end area |
| `secondaryText` | `boolean` | `false` | **contextBar collapsed** — show secondary line in TitleWrapper |
| `searchInput` | `boolean` | `false` | **homeBar** — inline search pill in the middle |
| `startSlot` | `ReactNode` | — | Logo, back button, menu, etc. |
| `endSlot` | `ReactNode` | — | IconButtons / actions |
| `avatarSlot` | `ReactNode` | — | Avatar when `avatar={true}` |
| `titleContent` | `string` | — | **contextBar collapsed:** Title/M inline · **expanded (any type):** Headline/L row 2 |
| `secondaryTextContent` | `string` | — | **contextBar collapsed** — Label/XS under title |
| `searchPlaceholder` | `string` | `'Search'` | **searchBar** placeholder |
| `searchValue` | `string` | — | Controlled search value |
| `onSearchChange` | `(value: string) => void` | — | Search text change |
| `onSearchSubmit` | `(value: string) => void` | — | Search submit |
| `searchAriaLabel` | `string` | `'Site search'` | Input accessibility label |
| `searchEndSlot` | `ReactNode` | mic `IconButton` | Trailing slot inside search `Input` |
| `endActions` | `'Button' \| 'IconButton'` | — | Figma instance-swap hint (content via `endSlot`) |
| `aria-label` | `string` | `'Primary navigation'` | Nav region label |

`PrimaryNav` has **no `children` prop** — do not place `HeaderItem` here. Use `SecondaryNav` for tabs.

## SecondaryNav props

Rendered only when `HeaderNative.secondaryNav={true}`. Pass `HeaderItem` children as **direct** children (or a flat array) — wrapper components are not flattened.

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `children` | `ReactNode` | — | `HeaderItem` elements |
| `aria-label` | `string` | `'Secondary navigation'` | Nav region label |

## HeaderItem props

Figma source: **Header.Item** (`3342:59395`) · API table node `4473:114128`

| Prop | Type | Default | Figma API | Description |
| ---- | ---- | ------- | --------- | ----------- |
| `value` | `string` | — | — | **Required** — tab value |
| `children` | `ReactNode` | — | — | **Required** — label text |
| `active` | `boolean` | `false` | `active` | Selected state |
| `attention` | `'low' \| 'medium' \| 'high'` | `'low'` | `attention` | Active visual: `high`=pill, `medium`=underline, `low`=text |
| `start` / `end` | `ReactNode` | — | — | Slot content (Icon, IndicatorBadge, etc.) |
| `startSize` / `endSize` | `'none' \| 'S' \| 'M'` | — | `start` / `end` | Slot visibility + size (`S`=badge, `M`=16px icon) |
| `visuallyAlignToStart` | `boolean` | `false` | `visuallyAlignToStart` | Remove start padding — use on **first item only** |
| `onPress` | `(event) => void` | — | — | Press handler |
| `disabled` | `boolean` | `false` | — | Disables interaction |
| `aria-label` | `string` | — | — | Overrides label from `children` |

`interactionState` (idle / hover / pressed / focus) is handled internally via `Pressable` — not a public prop.

### Design tokens (Header.Item)

| Element | Token |
| ------- | ----- |
| Row height | `Spacing-14` (56px) |
| Item min height | `Spacing-6` |
| Label typography | `Label-S-FontSize` / `Label-S-LineHeight` / `Label-FontWeight-Medium` |
| Idle label (all attentions) | `Neutral-Low` (`colour/content/low`) |
| Active label (low) | `Neutral-High` (`colour/content/high`) |
| Active label (medium/high) | `Primary-TintedA11y` |
| High active pill fill | `Primary-Subtle` → `Primary-Pressed` on press |
| Medium active underline | `Primary-Tinted`, height `Spacing-0-5` |
| State layer radius | `Shape-2` (8px) |
| Pill radius | `Shape-Pill` |
| Pill height | `Spacing-6` |
| State layer vertical padding | `0` (all variants) |
| Content gap (slot ↔ label) | `Spacing-1` |
| Label-only outer padding | `Spacing-2.5` both sides (`0` start when `visuallyAlignToStart`) |
| Icon slot (M) outer inset | `Spacing-1.5` on the slot side |
| Badge slot (S) outer inset | `Spacing-2` on the slot side |
| Nav item gap | `Spacing-1` |
| Slot M size | `Spacing-4` (16px) |

## Unified expanded layout

One rule applies to **all** `type` values:

```
(expanded on HeaderNative OR PrimaryNav) AND titleContent
  → Row 1: type-specific chrome
  → Row 2: Headline/L title
```

| Type | Row 1 when expanded | Row 2 |
| ---- | ------------------- | ----- |
| `homeBar` | Logo (+ optional middle search) + end actions | Headline/L |
| `contextBar` | Back only + end actions (no inline title) | Headline/L |
| `searchBar` | Back + inline search + filter | Headline/L |

**contextBar collapsed:** back + inline Title/M (+ optional secondary text) in the start area.

Use `resolvePrimaryNavLayout()` when you need the same flags outside the component:

```typescript
const layout = resolvePrimaryNavLayout(
  usePrimaryNavState(props),
  headerCtx.expanded,
  titleContent,
);
// layout.showExpandedLayout
// layout.showContextBarInlineTitle
// layout.showContextBarStartOnly
```

## Usage examples

### Composed header with secondary tabs

```tsx
import React, { useState } from 'react';
import { HeaderNative, PrimaryNav, SecondaryNav, HeaderItem } from '@oneui/ui-native';
import { IconButton, Logo, Avatar } from '@oneui/ui-native';

function AppHeader() {
  const [active, setActive] = useState('overview');

  return (
    <HeaderNative secondaryNav divider aria-label="App header">
      <PrimaryNav
        type="homeBar"
        avatar
        startSlot={<Logo svgContent={logoSvg} alt="Brand" size="xl" variant="mark" />}
        endSlot={
          <>
            <IconButton icon="search" aria-label="Search" attention="low" size={8} condensed />
            <IconButton icon="hellojio" aria-label="Ask HelloJio" attention="low" size={8} condensed />
          </>
        }
        avatarSlot={<Avatar alt="User" size="xl" content="icon" />}
      />
      <SecondaryNav aria-label="Section tabs">
        {['overview', 'features', 'pricing'].map((tab) => (
          <HeaderItem
            key={tab}
            value={tab}
            attention="medium"
            active={active === tab}
            onPress={() => setActive(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </HeaderItem>
        ))}
      </SecondaryNav>
    </HeaderNative>
  );
}
```

### homeBar — collapsed and expanded

```tsx
// Collapsed — single row
<HeaderNative divider aria-label="Home">
  <PrimaryNav
    type="homeBar"
    avatar
    titleContent={undefined}
    startSlot={<Logo svgContent={logoSvg} alt="Brand" size="xl" variant="mark" />}
    endSlot={<EndActions />}
    avatarSlot={<UserAvatar />}
  />
</HeaderNative>

// Expanded — logo row + large title (Figma 1:35678)
<HeaderNative expanded aria-label="Home expanded">
  <PrimaryNav
    type="homeBar"
    expanded
    titleContent="Title"
    avatar
    startSlot={<Logo svgContent={logoSvg} alt="Brand" size="xl" variant="mark" />}
    endSlot={<EndActions />}
    avatarSlot={<UserAvatar />}
  />
</HeaderNative>
```

### contextBar — collapsed and expanded

```tsx
// Collapsed — back + inline title + secondary (Figma 1:35661)
<HeaderNative divider aria-label="Context">
  <PrimaryNav
    type="contextBar"
    secondaryText
    titleContent="Title"
    secondaryTextContent="Secondary text"
    avatar
    startSlot={<IconButton icon="back" aria-label="Go back" attention="low" size={8} condensed />}
    endSlot={<EndActions />}
    avatarSlot={<UserAvatar />}
  />
</HeaderNative>

// Expanded — back + actions, title on row 2 (Figma 1:35689)
<HeaderNative expanded aria-label="Context expanded">
  <PrimaryNav
    type="contextBar"
    expanded
    titleContent="Title"
    avatar
    startSlot={<IconButton icon="back" aria-label="Go back" attention="low" size={8} condensed />}
    endSlot={<EndActions />}
    avatarSlot={<UserAvatar />}
  />
</HeaderNative>
```

### searchBar — collapsed and expanded

```tsx
// Collapsed — back + search pill + filter (Figma 1:35670)
<HeaderNative aria-label="Search">
  <PrimaryNav
    type="searchBar"
    searchPlaceholder="Search"
    startSlot={<IconButton icon="back" aria-label="Go back" attention="low" size={8} condensed />}
    endSlot={<IconButton icon="filter" aria-label="Filter" attention="low" size={8} condensed />}
  />
</HeaderNative>

// Expanded — same row 1 + Headline/L title (Figma 1:35700)
<HeaderNative expanded aria-label="Search expanded">
  <PrimaryNav
    type="searchBar"
    expanded
    titleContent="Title"
    searchPlaceholder="Search"
    startSlot={<IconButton icon="back" aria-label="Go back" attention="low" size={8} condensed />}
    endSlot={<IconButton icon="filter" aria-label="Filter" attention="low" size={8} condensed />}
  />
</HeaderNative>
```

### homeBar with inline search (middle row)

```tsx
<HeaderNative divider aria-label="Home with search">
  <PrimaryNav
    type="homeBar"
    searchInput
    searchPlaceholder="Search"
    avatar
    startSlot={
      <>
        <IconButton icon="menu" aria-label="Open menu" attention="low" size={8} condensed />
        <Logo svgContent={logoSvg} alt="Brand" size="xl" variant="mark" />
      </>
    }
    endSlot={<EndActions showSearch />}
    avatarSlot={<UserAvatar />}
  />
</HeaderNative>
```

## Slot guidance

| Slot | Typical content | Size token |
| ---- | --------------- | ---------- |
| `startSlot` | `Logo`, back `IconButton`, menu `IconButton` | IconButton `size={8}` condensed |
| `endSlot` | Search, HelloJio, filter `IconButton`s | gap `Spacing-1-5` inside end slot |
| `avatarSlot` | `Avatar` `size="xl"` | 32px (Figma size8) |
| `searchEndSlot` | Mic `IconButton` `size={4}` condensed | Inside `Input` end slot |

Pass `HeaderItem` as **direct** children of `SecondaryNav`. A wrapper like `<NavItems />` will not render unless it returns a flat list of `HeaderItem` elements.

## Accessibility

- Set `aria-label` on `HeaderNative`, `PrimaryNav`, and `SecondaryNav` for landmark regions.
- `HeaderItem` uses `accessibilityRole="button"` and `accessibilityState.selected` when `active`.
- Label resolution order: `aria-label` → string/number `children` → humanized `value` (with a dev warning when `children` is non-text JSX).
- Context bar / expanded `titleContent` uses nested `accessibilityRole="header"` inside the root landmark.
- Pair `start`/`end` slot content with `startSize`/`endSize` (`'S'` or `'M'`) — dev warning if mismatched.
- `SecondaryNav` logs a dev warning when children are provided but no valid `HeaderItem` elements are collected.
- Search `Input` requires `searchAriaLabel` (defaults to `"Site search"`).
- Icon-only controls in slots must each have their own `aria-label`.

## Related

- Showcase matrices: `@oneui/ui-native/showcase/HeaderNative`
- Sample app: `apps/native-components-sample` → HeaderNative screen
- Web counterpart (different API): `packages/ui/src/components/WebHeader`
