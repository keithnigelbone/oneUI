# Container — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/Container/Container.tsx](../../packages/ui/src/components/Container/Container.tsx) | [packages/ui-native/src/components/Container/Container.native.tsx](../../packages/ui-native/src/components/Container/Container.native.tsx) |
| Static visuals | `Container.module.css` | `Container.styles.native.ts` |
| Prop contract | `Container.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | `Container.stories.tsx` | `Container.showcase.native.tsx` |

## Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Fluid` | `ContainerFluid` | **Aligned** |
| 2 | `Fixed` | `ContainerFixed` | **Aligned** |
| 3 | `FullBleed` | `ContainerFullBleed` | **Aligned** |
| 4 | `CustomMaxWidth` | `ContainerCustomMaxWidth` | **Aligned** |
| – | _aggregator_ | `ContainerVariants` (back-compat) | **Aligned** — keeps existing native imports stable; renders the three variants stacked. |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `variant` | yes | yes | `'fluid' \| 'fixed' \| 'full-bleed'`, default `'fluid'` |
| `maxWidth` | yes | yes | Number (dp) on native, string `'480px'` parsed via `parseFloat` |
| `style` | yes | yes | `CSSProperties` -> `ViewStyle` |
| `children` | yes | yes | |
| `className` | yes | no | Web-only |

## Behaviour parity

- `'fluid'` — applies the platform grid margin (CSS `--Grid-Margin`; native `tokens.spacing['Margin']` baked into `VARIANT_STYLE.fluid`).
- `'fixed'` — capped at `--Grid-MaxWidth` on web (1280 / 1440 by viewport breakpoint); native caps at the static fixed-width baked into `VARIANT_STYLE.fixed`. Override per-instance with `maxWidth`.
- `'full-bleed'` — zero horizontal margin on both platforms.

## Known gaps / follow-ups

- Native does not currently respond to viewport-driven max-width changes (no native equivalent of `data-Breakpoint` breakpoints inside the layout cascade). If we add responsive max-width on native, it will land here without a contract change because the cap is computed at render time.
- Web's `Container` story `Fluid` documents "no upper limit" — native intentionally still pads horizontally at the platform-density grid margin to avoid edge-to-edge content on small screens; matches the existing platform UX.
