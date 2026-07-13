# Pagination — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/Pagination/Pagination.tsx](../../packages/ui/src/components/Pagination/Pagination.tsx) | [packages/ui-native/src/components/Pagination/Pagination.native.tsx](../../packages/ui-native/src/components/Pagination/Pagination.native.tsx) |
| Page chip | [PaginationItem.tsx](../../packages/ui/src/components/Pagination/PaginationItem.tsx) | [PaginationItem.native.tsx](../../packages/ui-native/src/components/Pagination/PaginationItem.native.tsx) |
| Static geometry | `Pagination.module.css` + `PaginationItemPage.module.css` | `Pagination.styles.native.ts` |
| Prop contract | `Pagination.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | `Pagination.showcase.tsx` | `Pagination.showcase.native.tsx` |

## Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `PaginationDefault` | **Aligned** |
| 2 | `SizesAttention` | `PaginationSizesAttention` | **Aligned** |
| 3 | `Appearances` | `PaginationAppearances` | **Aligned** |
| 4 | `Controlled` | `PaginationControlled` | **Aligned** |
| 5 | `WithFirstLast` | `PaginationWithFirstLast` | **Aligned** |
| 6 | `EdgeCases` | `PaginationEdgeCases` | **Aligned** |
| 7 | `SurfaceContext` | `PaginationSurfaceContext` | **Aligned** — default / subtle / moderate / bold surfaces |
| 8 | `PaginationItem` | `PaginationItemShowcase` | **Aligned** |
| 9 | `FocusState` | `PaginationFocusState` | **Partial** — RN relies on platform focus; no `data-force-state` injection |

## Prop parity

| Prop | Web | Native | Notes |
|---|---|:-:|---|
| `totalPages` | yes | yes | |
| `page` / `defaultPage` | yes | yes | Controlled / uncontrolled |
| `onPageChange` | yes | yes | |
| `siblingCount` / `boundaryCount` | yes | yes | Windowing math in `buildPaginationPages` |
| `showPrevNext` / `showFirstLast` | yes | yes | |
| `disabled` | yes | yes | |
| `attention` | yes | yes | `high` → bold, `medium` → subtle, `low` → ghost |
| `size` | yes | yes | `S` / `M` / `L` (+ lowercase aliases) |
| `appearance` | yes | yes | 9-role union + `'auto'` |
| `aria-label` | yes | yes | SR-only group name (`header`); container stays non-accessible so children are focusable |
| `accessibilityHint` | — | yes | RN convention |
| `style` | yes | yes | `CSSProperties` → `ViewStyle` |
| `className` | yes | no | Web-only |
| `testID` | no | yes | RN convention |

### PaginationItem

| Prop | Web | Native | Notes |
|---|---|:-:|---|
| `page` | yes | yes | |
| `selected` | yes | yes | |
| `disabled` | yes | yes | |
| `attention` / `size` / `appearance` | yes | yes | |
| `onSelect` / `onPress` | yes | yes | |
| `focusable` | yes | yes | Composite sets `focusable={isCurrent}` on current page |
| `aria-label` | yes | yes | Defaults to `Go to page N` |

## Behaviour parity

- **Windowing:** `buildPaginationPages` + `usePaginationState` mirror web shared logic (boundary pages, sibling window, start/end ellipsis).
- **Nav controls:** Prev / next / first / last use `IconButton` with low attention; labels from `PAGINATION_NAV_LABELS`.
- **Ellipsis:** Decorative `moreHorizontal` `IconButton` (disabled); hidden from a11y tree on both platforms.
- **Selected page chip:** Attention maps to variant; inactive chips use neutral ghost styling.
- **Live region:** Polite announcement `Page N of M` via `getPaginationLiveRegionProps`.
- **Surface context:** `useSurfaceAppearance` + `useSurfaceTokens` remap role colours on tinted surfaces.

## Known gaps

| Topic | Web | Native |
|---|---|---|
| Roving tabindex + arrow keys | `PaginationContext` + key handlers on list | **Not ported** — tap-only navigation per RN UX |
| `data-force-state="focus"` story | CSS hook for visual review | **Not ported** — platform focus only |
| `className` | yes | no |

## Accessibility helpers

All helpers live in `interface.ts` (no separate `*A11y.ts`):

- `getPaginationAccessibilityProps` — root `navigation` landmark
- `getPaginationItemAccessibilityProps` — page chip button + selected state
- `getPaginationLiveRegionProps` — polite page announcement
- `getPaginationEllipsisAccessibilityProps` — hide decorative ellipsis

Tests: `PaginationA11y.test.ts`.
