# Tabs — Web ↔ Native parity

| Area | Web | React Native |
|------|-----|--------------|
| Component | `Tabs.tsx`, `TabGroup.tsx` | `Tabs.native.tsx` |
| Contract | `Tabs.shared.ts` | `interface.ts` |

## Functional API

| Prop / behavior | Web | RN |
|-----------------|-----|-----|
| Compound API (`Tabs.Root` / `List` / `Item` / `Panel` / `Indicator`) | ✓ Base UI | ✓ Pressable + layout-measured indicator |
| Flat API (`TabGroup`, `TabItem`, `TabPanel`) | ✓ | ✓ |
| `size` `s` / `m` / `l` | ✓ | ✓ `Tabs.styles.native.ts` |
| `orientation` horizontal / vertical | ✓ | ✓ |
| `appearance` (9 roles + `auto` → `primary`) | ✓ | ✓ `useSurfaceTokens` |
| `value` / `defaultValue` / `onValueChange` | ✓ | ✓ |
| `start` / `end` slots (`icon` / `badge` legacy) | ✓ | ✓ |
| `disabled` | ✓ | ✓ + `DISABLED_OPACITY` |
| `showIndicator` on `TabGroup` | ✓ | ✓ default `true` |
| `activateOnFocus` / `loopFocus` | ✓ Base UI | Accepted, no-op (no roving keyboard focus) |
| `data-force-state="focus"` | ✓ focus halo | Border cue for showcase QA only |
| Surface context remapping | `[data-surface]` CSS | `<Surface mode>` parent |
| `className` | ✓ | — |
| `style` | `CSSProperties` | `ViewStyle` |
| `testID` | — | ✓ |

## Paint model

| State | Web token | RN |
|-------|-----------|-----|
| Idle unselected label | `--Primary-High` | `role.content.high` |
| Hover unselected | `--Text-Low` | `neutral.content.low` |
| Selected label | `--{Role}-TintedA11y` | `role.content.tintedA11y` |
| Disabled label | `--{Role}-Low` + opacity | `role.content.low` + `0.38` |
| Indicator | `--{Role}-Tinted` | `role.content.tinted` |

## Accessibility

| Prop / behavior | Web | RN |
|-----------------|-----|-----|
| Tab list landmark | implicit `tablist` | `accessibilityRole="tablist"` when `aria-label` set |
| Tab item | `role="tab"` + `aria-selected` | `accessibilityRole="tab"` + `accessibilityState.selected` |
| Icon-only tab name | `aria-label` required | Same + dev warning |
| Hidden panels | `hidden` attribute | Unmounted when inactive; `importantForAccessibility` when visible |
| Focus halo | `:focus-visible` double ring | No persistent focus ring (touch); `data-force-state` border for QA |

Helpers: `getTabsAccessibilityProps`, `getTabItemAccessibilityProps`, `getTabPanelAccessibilityProps` in `interface.ts`.

## Storybook ↔ native showcase

| Web story | Native showcase export |
|-----------|------------------------|
| Default | `TabsDefault` |
| Variants | `TabsVariants` |
| Sizes | `TabsSizes` |
| States | `TabsStates` |
| WithIcons | `TabsWithIcons` |
| Interactive | `TabsInteractive` |
| Themes | `TabsThemes` |
| Adoption Matrix | `TabsAdoptionMatrix` |
| Compound API | `TabsCompoundAPI` |
| Focus state | — (no keyboard focus ring on touch) |
| Hover state | Hover via `onHoverIn` on web pointer devices only |

## Known gaps

- **Keyboard navigation** — Web uses Base UI roving tabindex + arrow keys; native relies on OS accessibility traversal.
- **Focus halo** — Web `--Surface-Halo-Gap` double ring; native has no equivalent on touch targets.
- **`activateOnFocus` / `loopFocus`** — Documented no-ops on native.
- **Indicator animation** — Web uses CSS `translate` on Base UI vars; native uses `Animated` + `measureLayout` on content wrapper.
- **State-layer corner radius** — Aligned as of 2026-07-08, confirmed against Figma `F7KEYdO8R8Nbe2N4gI8dIU`. `s`/`l` → `Shape-2` (8px), `m` → `Shape-1-5` (6px), both orientations (web's `.tab[data-orientation='vertical'] .stateLayer` only changes `justify-content`, not radius). The focus and hover state-layer nodes (`2564:1264`, `2564:1272`, both Label-S = size `m`) bind `Dimensions/Shape/1,5` = 6px directly; the TabGroup component set (`1:55590`) uses only Shape 0, 0.5, 1.5 and 2 — **`Shape/1` (4px) appears nowhere in the frame**, which is what native was rendering on five of six size×orientation cells. `m:horizontal` additionally reached for a *spacing* token (`tokens.spacing['1-5']`) to express a radius, because the old px-first `tokens.shape` table had no 6px rung. Surfaced by the numeric shape-token migration; pinned by `packages/ui-native/src/components/radius-parity.test.ts`.
