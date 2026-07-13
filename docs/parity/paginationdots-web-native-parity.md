# PaginationDots — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/PaginationDots/PaginationDots.tsx](../../packages/ui/src/components/PaginationDots/PaginationDots.tsx) | [packages/ui-native/src/components/PaginationDots/PaginationDots.native.tsx](../../packages/ui-native/src/components/PaginationDots/PaginationDots.native.tsx) |
| Static visuals | `PaginationDots.module.css` | `PaginationDots.styles.native.ts` |
| Prop contract | `PaginationDots.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | `PaginationDots.stories.tsx` | `PaginationDots.showcase.native.tsx` |

## Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `PaginationDotsDefault` | **Aligned** |
| 2 | `Appearances` | `PaginationDotsAppearances` | **Aligned** |
| 3 | `FocusState` | _intentionally skipped_ | **Web-only** — relies on the `data-force-state="focus"` CSS hook + `:before` pseudo-element to render the focus ring without real keyboard nav. RN has no pseudo-elements, and focus rings are owned by Pressable's `pressed`/`focused` state, which isn't injectable from a story. |
| 4 | `LoopVsNonLoop` | `PaginationDotsLoopVsNonLoop` | **Aligned** — uses local mini-buttons instead of `<Button>` so the showcase stays self-contained. |
| 5 | `LongSequence` | `PaginationDotsLongSequence` | **Aligned** |
| 6 | `Interactive` | `PaginationDotsInteractive` | **Aligned** — `ScrollView` replaces the web `overflow-x: auto` carousel; opacity dimming on inactive cards mirrors the web styling. |
| 7 | `ReadOnly` | `PaginationDotsReadOnly` | **Aligned** |
| 8 | `Degenerate` | `PaginationDotsDegenerate` | **Aligned** |
| 9 | `SurfaceContext` | `PaginationDotsSurfaceContext` | **Aligned** — uses `<Surface mode='primary' appearance='primary' />` boundaries; tokens remap via `[data-surface]` cascade on web and `useSurfaceTokens` on native. |
| 10 | `Keyboard` | _intentionally skipped_ | **Web-only** — the play function exercises ArrowLeft / ArrowRight key events; there is no equivalent on native (taps replace key events). |
| – | _no web peer_ | `PaginationDotsBasic` | **Native-only** — controlled-state quick demo; kept as a back-compat export. |
| – | _no web peer_ | `PaginationDotsLoop`, `PaginationDotsShortSequence` | **Native-only** convenience exports kept for sample-app back-compat. |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `pageCount` | yes | yes | Total page count |
| `activeIndex` | yes | yes | Controlled active index |
| `defaultActiveIndex` | yes | yes | Uncontrolled default |
| `onActiveIndexChange` | yes | yes | Change callback |
| `loop` | yes | yes | Infinite-wrap mode |
| `appearance` | yes | yes | 9-role union + `'auto'` |
| `readOnly` | yes | yes | Renders `progressbar` with `aria-valuenow` instead of `tablist` |
| `aria-label` | yes | yes | Forwarded |
| `style` | yes | yes | `CSSProperties` -> `ViewStyle` |
| `className` | yes | no | Web-only |
| `testID` | no | yes | RN convention |

## Behaviour parity

- Window-of-five logic is identical (clamped sliding window, edge dots smaller, active dot becomes a pill).
- Active pill / regular / edge dot dimensions and gaps are baked into `PaginationDots.styles.native.ts` to match the Figma spec.
- Keyboard navigation (ArrowLeft / ArrowRight / Home / End) is web-only by design; native uses tap-only navigation per platform UX conventions.

## Known gaps / follow-ups

- Focus-ring story — RN renders Pressable focus state via the platform navigation system; there's no story-level injection of the focused state outside an integration harness. If we add a focus-ring component for Pressable, a `PaginationDotsFocusState` mirror could land here.
- Multi-role active pill colour adaptation matches web — `useSurfaceTokens(appearance).surfaces.bold` resolves the active fill, and `content.strokeMedium` resolves inactive dots.
