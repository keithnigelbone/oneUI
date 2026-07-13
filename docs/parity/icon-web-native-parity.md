# Icon (resolver): Web (`@oneui/ui`) vs Native (`@oneui/ui-native`) — Parity Guide

This document compares the **universal `<Icon>` resolver** on web and native —
the low-level glyph shell that other DS components (Button start/end,
IconButton, IconContained, Avatar, Badge, etc.) wrap when they need a single
glyph. It is **not** the higher-level Figma-spec `Components/Media/Icon`
component documented at the bottom of this file.

**Primary sources**

| Area | Web | Native |
|------|-----|--------|
| Resolver | `packages/ui/src/icons/Icon.tsx` | `packages/ui-native/src/icons/Icon.native.tsx` |
| Public types | `packages/shared/src/types/icons.ts` (`IconProps`, `IconComponent`, `SemanticIconName`, `IconSize`, `IconSizeValues`) | same — re-exported via `@oneui/shared` |
| Brand resolution | `packages/ui/src/icons/IconContext.tsx` + `IconRegistry.ts` + `iconLoaders.ts` + `semanticMappings/*` | n/a — caller supplies the component (`@jds/core-icons--react-native`) |
| A11y helper | implicit DOM (`role="img"` + `aria-label`) | `getIconShellAccessibilityProps` in `packages/ui-native/src/icons/interface.ts` |
| Slot inheritance | DOM `currentColor` + parent `font-size` cascade | `ComponentSlotIconContext` (`packages/ui-native/src/slots/ComponentSlotIconContext.native.tsx`) |
| Showcases | n/a (resolver has no Storybook of its own) | `packages/ui-native/src/components/Icon/Icon.showcase.native.tsx` — 8 sections matching `packages/ui/src/components/Icon/Icon.stories.tsx` (`IconDefault`, `IconSizes`, `IconEmphasisLevels`, `IconAppearances`, `IconWithIcons`, `IconInteractive`, `IconSurfaceContext`, `IconInContext`) — built on the design-system `<Icon>` (see [§ 6](#6-design-system-icon-componentsmediaicon-status)). |

> The Figma-spec **`Components/Media/Icon`** (`packages/ui/src/components/Icon`)
> sits one layer above the resolver — see [§ 6](#6-design-system-icon-componentsmediaicon-status).

---

## 1. Executive summary

| Topic | Status | Notes |
|-------|--------|--------|
| **Prop contract** | **Aligned** | Both accept `icon`, `name`, `size`, `color`, `strokeWidth`, `aria-label`, `aria-hidden`. Web additionally accepts `className`; native additionally accepts `style`. |
| **`icon={Component}` slot** | **Aligned** | Both render the supplied `IconComponent` directly with `size`/`color`/`strokeWidth` forwarded; web uses `currentColor` default, native pulls `color` from `ComponentSlotIconContext` when no explicit value is given. |
| **`name` (semantic) slot** | **Aligned for Jio** | Both resolve `name` via `IconContext` → `SemanticMappings[iconSet]` → registered loader. Web ships dynamic loaders for 6 icon sets (Jio + 5 third-party); native only ships a Jio loader (registered by the host via `initJdsJioIcons` from `@oneui/ui-native/icons`) — non-Jio sets are no-ops because RN cannot dynamically import arbitrary npm packages. |
| **Default size** | **Aligned** | `'md'` (20 px) on both. Web reads `IconContextValue.defaultSize`; native uses `IconSizeValues['md']` directly when no slot context is present. |
| **`size` presets** | **Aligned** | `'xs' | 'sm' | 'md' | 'lg' | 'xl'` → `12 / 16 / 20 / 24 / 32`. Source of truth is `IconSizeValues` in `@oneui/shared`. Both also accept a literal pixel `number`. |
| **Slot context inheritance** | **Aligned in intent** | Web: `currentColor` cascades from the parent's CSS `color`, and the parent's font-size sets the icon box for `1em` SVGs. Native: parent components wrap children in `<ComponentSlotIconContext.Provider value={{ sizePx, color }}>`; `<Icon>` reads it via `useComponentSlotIconContext()`. |
| **Brand icon-set selection** | **Aligned for Jio; partial otherwise** | Both expose `<IconProvider iconSet="…">`. Web supports 6 sets (`jio | lucide | tabler | hugeicons | phosphor | remix`); native ships a Jio loader bridge (`initJdsJioIcons` over `@jds/core-icons--react-native`) and treats other sets as a no-op until a host-provided loader is registered. |
| **Async loading** | **Aligned** | Both use a `LazyIcon` shell with `loadedIconsCache` + `pendingIconLoads` dedup + retry loop for the Jio set. Native renders the same dimension-locked placeholder during load so layout never shifts. |
| **Missing-icon UX** | **Web richer** | Web renders a dashed neutral square (`Border-Subtle`, `Shape-3`, `0.4` opacity) with the failed name in `title` + `aria-label`. Native renders a transparent placeholder of the resolved size and emits a dev-mode `console.warn`. |
| **A11y root role** | **Aligned** | `role="img"` (web) ↔ `accessibilityRole: 'image'` (native). Both make labelling decorative-by-default until `aria-label` is supplied. |
| **`aria-hidden` semantics** | **Aligned, native richer** | Both honour `aria-hidden`. Native additionally collapses the subtree on Android via `accessibilityElementsHidden: true` + `importantForAccessibility: 'no-hide-descendants'`. |
| **`strokeWidth`** | **Aligned** | Both forward `strokeWidth` to the resolved icon component. Web also reads `IconContextValue.strokeWidth` as a fallback. |
| **Disabled / hover / focus / motion** | **n/a** | Decorative element on both platforms — no states, no transitions. |

---

## 2. Prop contract

### 2.1 Shared shape (`@oneui/shared/types/icons`)

```ts
export interface IconProps {
  name?: SemanticIconName;
  icon?: IconComponent;
  size?: IconSize | number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}
```

### 2.2 Native extensions

```ts
// packages/ui-native/src/icons/interface.ts
export interface IconNativeA11yProps {
  style?: ViewStyle;
}
export type IconNativeProps = IconProps & IconNativeA11yProps;
```

| Prop | Web | Native |
|------|-----|--------|
| `icon` | rendered directly | rendered directly (also wrapped in size-locked `<View>`) |
| `name` | resolved via `IconContext` + dynamic import | dev warn, returns `null` |
| `size` | preset → `IconSizeValues[preset]`, or pixel number | preset → `IconSizeValues[preset]`, or pixel number |
| `color` | forwarded as `color` prop; default `currentColor` | forwarded as `color` **and** `fill`; default = slot context's `color` |
| `strokeWidth` | prop wins; falls back to `IconContextValue.strokeWidth` | prop only (no native context fallback yet) |
| `className` | passed to glyph | not supported (no className on RN primitives) |
| `style` | not on the resolver (delegated to glyph component) | applied to the outer `<View>` shell |
| `aria-label` | sets `aria-label` on glyph; toggles `aria-hidden` heuristically | drives `accessibilityLabel` + `accessible` via `getIconShellAccessibilityProps` |
| `aria-hidden` | passed through to glyph | maps to `accessibilityElementsHidden` + Android-safe descendant hiding |

---

## 3. Behaviour and implementation differences

### 3.1 Brand icon-set resolution

```
WEB
<IconProvider iconSet="jio">
  └── <Icon name="heart" />
       └── IconContext.iconSet = 'jio'
       └── SemanticMappings.jio.heart = 'IcHeart'
       └── getJioIconLoader()('IcHeart') → IconComponent (lazy)
       └── <LazyIcon> renders <IconComponent width=size height=size color="currentColor" />
```

```
NATIVE
<Icon icon={IcHeart} size="md" color={role.content.tinted} />
  └── (no IconProvider; caller imports the glyph directly)
  └── <View style={size}><View accessible=false>
        <IcHeart width="100%" height="100%" color={tint} fill={tint} />
      </View></View>
```

**Why the gap:** the native ecosystem does not yet have the per-icon dynamic
import + brand-driven semantic resolver. Every native consumer (Button start,
Avatar icon, IconContained, Badge) accepts an `IconComponent` directly.

### 3.2 Size resolution

| Source | Web | Native |
|--------|-----|--------|
| Pixel number | passes through unchanged | passes through unchanged |
| Preset (`xs|sm|md|lg|xl`) | `IconSizeValues[preset]` (defaults via `useIconSet().defaultSize`) | `IconSizeValues[preset]` |
| No `size` prop | `defaultSize` from `IconContext` (default `'md'`) | `slot.sizePx` from `ComponentSlotIconContext`, falls back to `IconSizeValues['md']` |

Both resolve to the same pixel set:

| Preset | Pixels |
|--------|--------|
| `xs` | 12 |
| `sm` | 16 |
| `md` | 20 (default) |
| `lg` | 24 |
| `xl` | 32 |

> Web's CSS-module shell has its own larger 20-step **spacing-index** size
> table (`'2'…'40'` → `Spacing-2…Spacing-40`). That belongs to the
> design-system `Components/Media/Icon` shell, not the resolver — see [§ 6](#6-design-system-icon-componentsmediaicon-status).

### 3.3 Colour propagation

| Mechanism | Web | Native |
|-----------|-----|--------|
| Default tint | `currentColor` — inherits parent's CSS `color` (cascading from `<Surface>`, `<Button>`, etc.) | `slot.color` from `ComponentSlotIconContext` (Button/Avatar/IconContained set it explicitly) |
| Explicit prop | `color="var(--Primary-High)"` | `color={role.content.tinted}` (resolved via `useSurfaceTokens`) |
| SVG attributes touched | `color` (and the icon library decides whether to use it on `fill`/`stroke`) | both `color` **and** `fill` are forwarded so JDS glyphs paint correctly without depending on `currentColor` semantics RN does not implement |

This is the **biggest practical difference**: on native, parents must
explicitly pass `color` (or wrap children in `ComponentSlotIconContext`),
because RN has no `currentColor` cascade.

### 3.4 Async loading + caches (web only)

`packages/ui/src/icons/Icon.tsx` operates in three modes:

1. **Direct** — `icon={LucidePlus}` renders synchronously.
2. **Jio bridge** — `name="heart"` + `iconSet === 'jio'` calls
   `getJioIconLoader()` (registered by the platform bootstrap) and waits for
   the named glyph.
3. **Per-icon dynamic import** — for `lucide`, `tabler`, etc. the resolver
   calls `loadSingleIcon(iconSet, iconName)` so only the requested icon's
   chunk is shipped.

State stored at module scope:
- `loadedIconsCache: Record<string, IconComponent>` (key `${iconSet}:${iconName}`)
- `pendingIconLoads: Record<string, Promise<IconComponent | null>>` for
  request dedup
- Jio retries up to 3 times at 100ms intervals if the loader is not yet
  registered (handles platform-bootstrap race).

Native has no equivalent and does not need one — it renders the supplied
component immediately.

### 3.5 Missing / unresolved icons

| Case | Web | Native |
|------|-----|--------|
| Semantic `name` not in mapping | `console.warn` + returns `null` | n/a (no semantic resolver) |
| Loader returns `null` after retries | renders dashed neutral placeholder (`Border-Subtle`, `Shape-3`, `0.4` opacity, `title` + `aria-label` show the missing name) so LLM-generated UI mistakes surface visibly | n/a |
| `icon` undefined and `name` undefined | n/a (web requires one) | dev warn (`process.env.NODE_ENV !== 'production'`) and returns `null` |
| `name` provided to native | n/a | dev warn (“Native Icon: use `icon={YourSvgComponent}` …”) and returns `null` |

### 3.6 Accessibility differences

| Item | Web | Native |
|------|-----|--------|
| Role | `role="img"` only when `aria-label` is provided | `accessibilityRole: 'image'` always; `accessible` only when not hidden and a label exists |
| Default hidden | When `aria-label` is omitted, `aria-hidden` defaults to `true` | When `aria-label` is omitted, `accessible` is `false` and `accessibilityElementsHidden` is `true` |
| Android subtree | n/a | `importantForAccessibility: 'no-hide-descendants'` on the inner `<View>` so child glyphs do not leak through TalkBack |
| Label derivation | none — caller supplies `aria-label` verbatim | `getIconShellAccessibilityProps` can derive a label from `catalogIconName` (`IcAdd → 'add icon'`) or `semanticName` (`'add' → 'add'`) when `aria-label` is omitted; tested in `iconA11y.test.ts` |
| `aria-hidden` semantics | passed straight through to the SVG element | maps to `accessibilityElementsHidden: true` and unsets the `accessibilityLabel` |

### 3.7 DOM / RN tree

| Layer | Web | Native |
|-------|-----|--------|
| Outer | the resolved `<svg>` itself (Lucide/Tabler/etc. emit it) or the JDS-loaded SVG component | `<View style={{ width, height }, style]}>` with a11y props |
| Inner | n/a | `<View accessible={false} importantForAccessibility="no-hide-descendants">` |
| Glyph | the icon component (e.g. `<IcHeart width={size} height={size}>`) | the same component, but always wrapped in `<View style={{ width, height }}>` so artwork with optical padding scales correctly (mirrors web's CSS rule `.root > * { width: 100%; height: 100% }`) |

### 3.8 What is _not_ on the resolver

Both platforms keep the resolver intentionally minimal — these belong to the
wrapping component:

- Border radius, surface fills, hover/press/focus
- Touch targets (added by `IconButton`, not `Icon`)
- `appearance` / `emphasis` (those live on the design-system `Components/Media/Icon`)

---

## 4. Slot context interplay

The native slot context is the single mechanism that lets nested `<Icon>`s
adopt their parent's size and tint without prop drilling. Components opt in by
wrapping children:

```tsx
// IconContained.native.tsx (excerpt)
<ComponentSlotIconContext.Provider value={{ sizePx, color: iconColor }}>
  {iconNode}
</ComponentSlotIconContext.Provider>
```

```tsx
// child consumer — no explicit color/size required
<Icon icon={IcHeart} aria-hidden />
```

The web equivalent is the **CSS cascade** — `IconContained.module.css`
sets `color: var(--_ic-…)` on `.icon`, and the SVG inherits via
`currentColor`. There is no React context at all.

---

## 5. Showcases & tests

### 5.1 Native showcases
`packages/ui-native/src/components/Icon/Icon.showcase.native.tsx` — 8 sections matching the web Storybook for `Components/Media/Icon` one-for-one. Built on the design-system `<Icon>`, so every section passes `appearance` + `emphasis` (never a literal hex color):

| Section | What it demonstrates |
|---------|----------------------|
| `IconDefault` | Default args (`icon='heart'`, `size='5'`, `appearance='neutral'`, `emphasis='high'`). |
| `IconSizes` | All 20 spacing-index sizes (`'2'` → `'40'`). |
| `IconEmphasisLevels` | Primary role × 5 emphasis levels (`high / medium / low / tinted / tintedA11y`). |
| `IconAppearances` | 8 roles × 3 emphasis rows — exercises the full appearance-token grid. |
| `IconWithIcons` | Two subsections: semantic-name gallery (resolved through the registered loader) + direct-component path using two inline SVGs (so the showcase keeps working with no host wiring). |
| `IconInteractive` | Static preview of the Storybook `Interactive` args. |
| `IconSurfaceContext` | Same icon row repeated inside all 6 surface modes — verifies `[data-surface]` token remap. |
| `IconInContext` | Icons inline with body text (favourited / search / verified). |

### 5.2 Tests

| Test | Location | Asserts |
|------|----------|---------|
| `formatIconName` | `packages/ui-native/src/icons/iconA11y.test.ts` | JDS catalog → human label parity (`IcChevronDown → 'chevron down icon'`, `ic_star → 'star icon'`, fallbacks for kebab/camel). |
| `getIconShellAccessibilityProps` | same file | Label fallback chain (`ariaLabel > catalogIconName > semanticName`), decorative-mode flags. |
| `designIconSizePx` | `packages/ui-native/src/icons/__tests__/designIconSizing.test.ts` | Index-based size mapping (`'5' → spacing['5']`, `'3.5' → spacing['3-5']`, etc.) — used by the design-system Icon shell, not the resolver itself. |

The web resolver does not have a direct unit test — it is exercised
indirectly through every component story that renders an icon.

---

## 6. Design-system `Icon` (`Components/Media/Icon`) — status

The Figma-spec `Icon` shell at `packages/ui/src/components/Icon` is a thin
wrapper around the resolver. It adds:

- 20 **spacing-index** sizes (`'2'…'40'`) that map to `--Spacing-N` on web.
- 8 **appearance roles** (`neutral|primary|secondary|sparkle|negative|positive|warning|informative`) — neutral is the default, others remap intermediate `--_icon-*` vars.
- 5 **emphasis levels** (`high|medium|low|tinted|tintedA11y`) — consume the role's on-colour tokens.
- `useSlotParentAppearance` — when no `appearance` is passed and the parent component sets a slot role (e.g. `Button appearance="negative"`), the icon picks it up automatically.

| Aspect | Web | Native |
|--------|-----|--------|
| Implementation | `packages/ui/src/components/Icon/Icon.tsx` + `Icon.module.css` | `packages/ui-native/src/components/Icon/Icon.native.tsx`. Resolves `appearance` × `emphasis` to a colour via `useSurfaceTokens(appearance).content[emphasis]` and `size` to a pixel via `designIconSizePx(size, theme.spacing)`, then delegates to the resolver `<Icon>` from `@oneui/ui-native/icons`. |
| Public import | `import { Icon } from '@oneui/ui/components/Icon'` | `import { Icon } from '@oneui/ui-native/components/Icon'` |
| Prop contract | `icon: SemanticIconName \| ReactElement`, `size`, `appearance`, `emphasis`, `className`, `style`, `aria-*` | `icon: SemanticIconName \| ReactElement \| IconComponent` (the `IconComponent` form is a native-only ergonomic escape hatch; web parity is the JSX form), `size`, `appearance`, `emphasis`, `style`, `aria-*` |
| Slot parent appearance | `useSlotParentAppearance` (web context) | `useSlotParentAppearance` (native peer at `packages/ui-native/src/slots/SlotParentAppearanceContext.native.tsx`) — same fallback chain `props.appearance ?? slotParent ?? 'neutral'`. `'brand-bg'` collapses to `'primary'` on both platforms because Icon has no `brand-bg` glyph scale. |
| Stories | `packages/ui/src/components/Icon/Icon.stories.tsx` (8 stories) | `packages/ui-native/src/components/Icon/Icon.showcase.native.tsx` (8 matching sections, see [§ 5.1](#51-native-showcases)) |

---

## 7. Quality gate verification

```bash
pnpm --filter @oneui/ui-native typecheck
pnpm test --filter @oneui/ui-native
pnpm check:literals
pnpm check:parity
```

The native `icons/` directory satisfies `scripts/check-parity.ts` file
presence. It is **not** subject to the shared-import enforcement because the
resolver is owned by the shared package (`@oneui/shared`) and re-exported
unchanged on both platforms.

---

## 8. Quick mental model

```text
WEB
<IconProvider iconSet="jio">
└── <Icon name="heart" />
    └── IconContext → SemanticMappings.jio.heart → 'IcHeart'
    └── LazyIcon → loader('IcHeart') → IconComponent (cached)
    └── <IconComponent width=size height=size color="currentColor" />
        ↑ the parent's CSS color cascades in via currentColor
```

```text
NATIVE
<ComponentSlotIconContext.Provider value={{ sizePx, color }}>
  └── <Icon icon={IcHeart} aria-hidden />
      └── slot.sizePx → 20 (or explicit size prop)
      └── slot.color → role.content.tinted (or explicit color prop)
      └── <View {...a11y} style={{ width, height }}>
            <View accessible={false} importantForAccessibility="no-hide-descendants">
              <IcHeart width="100%" height="100%" color={tint} fill={tint} />
```

**Same prop shape (`@oneui/shared`), different resolution paths:** the web
resolver does **icon-set selection + dynamic import + currentColor cascade**;
the native resolver is a **layout + a11y shell** that trusts the caller for
the glyph and reads the slot context for size/colour.
