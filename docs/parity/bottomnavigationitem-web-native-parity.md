# BottomNavigationItem — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/BottomNavigation/BottomNavItem.tsx](../../packages/ui/src/components/BottomNavigation/BottomNavItem.tsx) (lives inside the `BottomNavigation` package) | [packages/ui-native/src/components/BottomNavigationItem/BottomNavigationItem.native.tsx](../../packages/ui-native/src/components/BottomNavigationItem/BottomNavigationItem.native.tsx) |
| Static visuals | `BottomNavigation.module.css` (item rules co-located with parent) | `BottomNavigationItem.styles.native.ts` |
| Prop contract | `BottomNavigation.shared.ts` (`BottomNavItemProps`) | `interface.ts` (locally owned per the playbook; type alias `BottomNavItemProps` re-exported for web parity) |
| Stories / showcase | _no separate `BottomNavItem.stories.tsx`_ — Item is exercised by the parent `BottomNavigation.stories.tsx` | `BottomNavigationItem.showcase.native.tsx` (item-only sections) |

## Storybook ↔ Native showcase section map

The web Item has **no standalone Storybook stories** — it is always demonstrated through the parent `BottomNavigation` stories (`Default`, `LabelTypes`, `States`, `WithIcons`, `Appearances`, …). Those stories are mirrored at the parent level by `BottomNavigation.showcase.native.tsx`.

This package adds Item-only sections that demonstrate each Item-relevant prop matrix in isolation, so visual regression and unit tests can target the Item without spinning up the parent. They name themselves after the parent story they're a subset of:

| # | Subset of web parent story | Native section | Status |
|---|---|---|---|
| 1 | parent `Default` | `BottomNavigationItemDefault` | **Aligned** — single Item, label visible |
| 2 | parent `LabelTypes` | `BottomNavigationItemLabelTypes` | **Aligned** — `none` / `1line` / `2line` |
| 3 | parent `States` | `BottomNavigationItemStates` | **Aligned** — default / active / disabled |
| 4 | parent `WithIcons` | `BottomNavigationItemWithIcons` | **Aligned** — `activeIcon` swap on selection |
| – | _native-only_ | `BottomNavigationItemIconOnly` | **Native-only** — visual regression for the icon-only path |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `icon` | yes | yes | `SemanticIconName \| ReactElement \| IconComponent` |
| `activeIcon` | yes | yes | Optional swap on selection |
| `label` | yes | yes | |
| `active` | yes | yes | Manual override; otherwise resolves via parent context |
| `value` | yes | yes | Used for parent context-driven selection |
| `href` | yes | yes | Native delegates to `Linking.openURL` |
| `onClick` | yes | yes | Web; native also exposes `onPress` (preferred RN convention) |
| `disabled` | yes | yes | Sets `accessibilityState.disabled` + dims via opacity |
| `appearance` | yes | yes | Falls back to parent context |
| `labelType` | yes | yes | Falls back to parent context |
| `aria-label` | yes | yes | Required when `labelType="none"` (warning in dev) |
| `style` | yes | yes | `CSSProperties` -> `ViewStyle` |
| `className` | yes | no | Web-only |
| `testID` | no | yes | RN convention |
| `accessibilityHint` | no | yes | RN convention |

## Behaviour parity

- `activeIcon` swaps in for `icon` only when the Item resolves to active (manual `active` prop or parent-context `value` match).
- `disabled` halts press handling, sets `accessibilityState.disabled` on native (`aria-disabled` on web), and dims the inner content via opacity.
- `aria-label` is required when `labelType="none"` because the visible label is the only screen-reader cue otherwise; both platforms emit a dev-mode warning.

## Known gaps / follow-ups

- The Item never renders outside a parent in production — it always lives inside `<BottomNavigation>`. Item-only sections exist purely for focused testing / visual regression; if we ever expose a standalone Item primitive, those sections become the canonical Storybook entries.
