# Separator — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/Separator/Separator.tsx](../../packages/ui/src/components/Separator/Separator.tsx) | [packages/ui-native/src/components/Separator/Separator.native.tsx](../../packages/ui-native/src/components/Separator/Separator.native.tsx) |
| Static visuals | `Separator.module.css` | `Separator.styles.native.ts` |
| Prop contract | `Separator.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | _no `Separator.stories.tsx`_ | `Separator.showcase.native.tsx` |

## Storybook ↔ Native showcase section map

The web `Separator` component has **no Storybook stories** — it's a pure 2-orientation primitive that ships with `Divider` covering the labelled / variant cases. The native showcase exposes both orientations, which is the full surface area:

| # | Native section | Demonstrates | Status |
|---|---|---|---|
| 1 | `SeparatorHorizontal` | Default horizontal hairline between two stacked text blocks | **Aligned** |
| 2 | `SeparatorVertical` | `orientation="vertical"` between two inline blocks | **Aligned** |

If `Divider` stories grow in scope, we should consider whether Separator should pick up a styling story too — today the two are intentionally minimal.

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `orientation` | yes | yes | `'horizontal' \| 'vertical'`, default `'horizontal'` |
| `style` | yes | yes | `CSSProperties` -> `ViewStyle` |
| `className` | yes | no | Web-only |
| `testID` | no | yes | RN convention |

## Behaviour parity

- Both render a single hairline (`tokens.borderWidth.hairline`) painted with `Border-Subtle` / `useSurfaceTokens('neutral').content.strokeMedium`.
- Web emits `role="separator"` via Base UI's `Separator`; native applies `accessibilityRole="none"` because RN has no `'separator'` role enum value (the visual hairline is decorative — the surrounding layout supplies semantics).

## Known gaps / follow-ups

- None today. If you need a labelled or icon-bisected separator, use `Divider` on both platforms.
