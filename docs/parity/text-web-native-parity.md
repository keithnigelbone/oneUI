# Text — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/Text/Text.tsx](../../packages/ui/src/components/Text/Text.tsx) | [packages/ui-native/src/components/Text/Text.native.tsx](../../packages/ui-native/src/components/Text/Text.native.tsx) |
| Static visuals | `Text.module.css` | `Text.styles.native.ts` |
| Prop contract | `Text.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | `Text.stories.tsx` | `Text.showcase.native.tsx` |

## Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `TextDefault` | **Aligned** — single playable instance |
| 2 | `Variants` | `TextVariants` | **Aligned** — every variant × every valid size × 3 attention rows |
| 3 | `Sizes` | `TextSizes` | **Aligned** — Body across every public size + 3XS clamp warning case |
| 4 | `AttentionAndWeight` | `TextAttentionAndWeight` | **Aligned** — attention × weight matrix |
| 5 | `Appearances` | `TextAppearances` | **Aligned** — every multi-accent role at high + tintedA11y attention |
| 6 | `Decorations` | `TextDecorations` | **Aligned** — italic / underline / strikethrough / combined |
| 7 | `SurfaceContext` | `TextSurfaceContext` | **Aligned** — 6 surface modes |
| 8 | `TruncationAlignmentAndLink` | `TextTruncationAlignmentAndLink` | **Aligned** — combined section mirroring web |

## Native-only sections

| Section | Reason |
|---|---|
| `TextTruncation` | Granular sample-app section; combined into `TextTruncationAlignmentAndLink` for web parity. |
| `TextAlignment` | Granular sample-app section; combined into `TextTruncationAlignmentAndLink` for web parity. |
| `TextLink` | Granular sample-app section; combined into `TextTruncationAlignmentAndLink` for web parity. |
| `TextDisabled` | Documents the `appearance="…" attention="low"` pattern used by Field components for the disabled visual. Not a separate web story; handled by the prop combination instead. |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `variant` | yes | yes | `'display' \| 'headline' \| 'title' \| 'body' \| 'label' \| 'code'` |
| `size` | yes | yes | Variant-scoped union — invalid sizes are clamped at runtime with a dev warning |
| `attention` | yes | yes | `'high' \| 'medium' \| 'low' \| 'tintedA11y'` |
| `appearance` | yes | yes | 9-role union + `'auto'` |
| `weight` | yes | yes | `'high' \| 'medium' \| 'low'` |
| `italic` | yes | yes | |
| `underline` | yes | yes | |
| `strikethrough` | yes | yes | |
| `language` | yes | yes | `'latin' \| 'others'` switches font slot |
| `textAlign` | yes | yes | `'left' \| 'center' \| 'right'` |
| `maxLines` | yes | yes | Web uses `-webkit-line-clamp`; native uses `numberOfLines` |
| `as` | yes | n/a | Web semantic element override |
| `href` | yes | yes (via `link` substring) | RN routes through the link slot for tappability |
| `link` (substring or node) | yes (link slot) | yes | Native API: `link={substring}` or `link={<Text/>}` |
| `onLinkPress` | n/a (web uses `<a>`) | yes | RN-specific tap handler |
| `style` | yes | yes | `CSSProperties` -> `TextStyle` |
| `className` | yes | no | Web-only |
| `testID` | no | yes | RN convention |

## Behaviour parity

- Both platforms resolve typography through `useTypographyTokens(variant, size, { emphasis })`, which maps to V2 Brand-CSS tokens (`--Display-L-FontSize`, `--Body-M-LineHeight`, etc.).
- Surface-context-aware colour comes from `useSurfaceTokens(role)` (native) or `[data-surface]` cascade (web). Both pick the matching `--{Role}-High/Medium/Low/TintedA11y` based on the nearest `<Surface>` ancestor.
- Both clamp invalid sizes to the nearest valid size for the active variant and emit a dev-mode warning.
- Disabled visual treatment is achieved with `attention="low"` + dimmed appearance; same pattern on both platforms.

## Known gaps / follow-ups

- Web `as` prop swaps the semantic element (`h1`, `h2`, `p`, `a`, …); native renders a single `<Text>` with `accessibilityRole` adjusted for headings. Functional parity, structural divergence.
- Web link slot uses real `<a>` semantics; native maps the substring or node to a tappable `<Pressable>` wrapped span. The prop API differs, but the visual outcome is identical.
