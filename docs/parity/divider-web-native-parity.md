# Divider — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/Divider/Divider.tsx](../../packages/ui/src/components/Divider/Divider.tsx) | [packages/ui-native/src/components/Divider/Divider.native.tsx](../../packages/ui-native/src/components/Divider/Divider.native.tsx) |
| Static visuals | `Divider.module.css` | `Divider.styles.native.ts` |
| Prop contract | `Divider.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | `Divider.stories.tsx` | `Divider.showcase.native.tsx` |

## Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `DividerDefault` | **Aligned** |
| 2 | `Orientations` | `DividerOrientations` | **Aligned** |
| 3 | `Sizes` | `DividerSizes` | **Aligned** |
| 4 | `AttentionLevels` | `DividerAttentionLevels` (alias `DividerAttentions`) | **Aligned** |
| 5 | `WithIcon` | `DividerWithIcon` | **Aligned** |
| 6 | `WithLabel` | `DividerWithLabel` | **Aligned** |
| 7 | `RoundCaps` | `DividerRoundCaps` | **Aligned** |
| 8 | `SurfaceContext` | `DividerSurfaceContext` | **Aligned** |
| 9 | `Interactive` | _intentionally skipped_ | **Web-only** — the play function asserts `getByRole('separator')`; on native the equivalent assertion lives in the `*A11y.test.ts` peer (`accessibilityRole='none'` + `role='separator'`). |
| 10 | `VerticalSizes` | `DividerVerticalSizes` | **Aligned** |
| 11 | `VerticalAttentionLevels` | `DividerVerticalAttentionLevels` | **Aligned** |
| 12 | `VerticalWithIcon` | `DividerVerticalWithIcon` | **Aligned** |
| 13 | `VerticalWithLabel` | `DividerVerticalWithLabel` | **Aligned** |
| 14 | `VerticalInlineUsage` | `DividerVertical` | **Aligned** — kept the existing native name to avoid breaking sample-app imports; the doc records the cross-reference. |
| – | _no web peer_ | `DividerAppearances` | **Native-only** debug surface; not a regression because `appearance` is exhaustively covered by `Divider.tokens.ts` recipe types and the role-axis stays opt-in for callers. |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `orientation` | yes | yes | `'horizontal' \| 'vertical'`, default `'horizontal'` |
| `size` | yes | yes | `'s' \| 'm' \| 'l'`, default `'m'` |
| `content` | yes | yes | `ReactNode` — optional `<Icon />` / `<Text />` slot; omit for plain separator (web merges `appearance` / `attention` into `Icon` / `Text` when unset on the child) |
| `contentAlign` | yes | yes | `'center' \| 'start' \| 'end'`, default `'center'` |
| `appearance` | yes | yes | 9-role union + `'auto'` (resolves to `'neutral'`) |
| `attention` | yes | yes | `'high' \| 'medium' \| 'low'`, default `'low'` |
| `roundCaps` | yes | yes | Maps to `tokens.shape.Pill` on the line views |
| `data-testid` | yes | yes | Forwarded; `testID` available natively too |
| `style` | yes | yes | `CSSProperties` -> `ViewStyle` |
| `className` | yes | no | Web-only |
| `accessibilityHint` | no | yes | RN convention |

## Behaviour parity

- Both render a single hairline + optional `content` slot (`ReactNode`). Web accepts design-system `Icon` / `Text` with prop merge; native merges into `Text` and wraps other nodes with `SlotParentAppearanceProvider`.
- Stroke colour resolves through `useSurfaceTokens(resolvedAppearance).content.{strokeMedium,strokeLow,high}` on native, mirroring the `--{Role}-Stroke-{Medium,Low}` cascade web reads.
- Text slot uses the design-system `Text` (`label` · `S` · `medium`) on web; the same component on native.
- Web's `roundCaps` becomes `border-radius: 9999px` via CSS; native applies `borderRadius: tokens.shape.Pill` directly to the line view.

## Known gaps / follow-ups

- The native showcase keeps `DividerAppearances` as a native-only matrix because we use it for visual regression on RN; web Storybook covers the equivalent matrix through Chromatic snapshots of `AttentionLevels` × `appearance` controls.
- No animations on the native divider; web does not animate either, so this is a one-to-one no-op.
