# SingleTextButton — Web ↔ Native parity

Circular single-text **action** button (max 2 characters, e.g. `Ag`, `En`, `A`, `12`). Non-toggle sibling of `SelectableSingleTextButton`. Attention level drives the entire visual — no selected/unselected duality.

| Source | Path |
| ------ | ---- |
| Web contract | [`packages/ui/src/components/SingleTextButton/SingleTextButton.shared.ts`](../../packages/ui/src/components/SingleTextButton/SingleTextButton.shared.ts) |
| Web render | [`SingleTextButton.tsx`](../../packages/ui/src/components/SingleTextButton/SingleTextButton.tsx) · [`SingleTextButton.module.css`](../../packages/ui/src/components/SingleTextButton/SingleTextButton.module.css) |
| Native contract | [`packages/ui-native/src/components/SingleTextButton/interface.ts`](../../packages/ui-native/src/components/SingleTextButton/interface.ts) |
| Native render | [`SingleTextButton.native.tsx`](../../packages/ui-native/src/components/SingleTextButton/SingleTextButton.native.tsx) · [`SingleTextButton.styles.native.ts`](../../packages/ui-native/src/components/SingleTextButton/SingleTextButton.styles.native.ts) |
| Layers cross-check | `jdssingletextbutton-4` (React V4) · `jdssingletextbutton` (React Native) |

## Public API

| Prop | Web | Native | Notes |
| ---- | --- | ------ | ----- |
| `children` | `ReactNode` | `ReactNode` | Max 2 chars; longer is truncated with a dev warning (both platforms). |
| `size` | `'s' \| 'm' \| 'l'` | same | Default `'m'`. No XS. |
| `attention` | `'high' \| 'medium' \| 'low'` | same | Default `'high'`. Maps to variant bold/subtle/ghost. |
| `appearance` | `ComponentAppearance \| 'tertiary' \| 'quaternary'` | same | Default `'auto'` → surface-inherited → `'primary'`. Type intentionally exceeds the canonical 9 roles (web wires `.appearanceTertiary/Quaternary`; native falls back to `primary` for roles a brand hasn't configured). |
| `condensed` | `boolean` | same | Reduced height/padding, same typography. |
| `fullWidth` | `boolean` | same | Overrides circular shape (`aspect-ratio: auto`, `width: 100%`). |
| `disabled` | `boolean` | same | |
| `loading` | `boolean` | same | Spinner replaces the label. **Native:** marks the control *busy* (`accessibilityState.busy`) and suppresses activation, but does **not** mark it disabled — only `disabled` does that. **Web:** still couples `isDisabled = disabled \|\| loading` (see divergence below). |
| `onPress` / `onClick` | `onClick` (web), `onPress`/`onClick` | both | Native prefers `onPress`, falls back to `onClick`. |
| `aria-label` | ✓ | ✓ | Optional (children text is visible). |
| `type` | `'button' \| 'submit' \| 'reset'` | — | Web-only HTML attribute; omitted on native. |
| `className` | ✓ | — | Web-only; native uses `style?: ViewStyle`. |
| `accessibilityHint`, `testID`, `aria-describedby/expanded/haspopup/controls/hidden` | — | ✓ | RN accessibility passthroughs. |

## Attention → variant → paint

Attention resolves to a variant (`SINGLE_TEXT_BUTTON_ATTENTION_TO_VARIANT`), then paint mirrors the web module's `--_stb-*` intermediate variables:

| Attention | Variant | Web CSS | Native (`useSurfaceTokens`) |
| --------- | ------- | ------- | --------------------------- |
| high | bold | bg `--_stb-bold` (`--Primary-Bold`), text `--_stb-bold-high` (`--Primary-Bold-TintedA11y`), pressed `--Primary-Bold-Pressed` | `surfaces.bold` / `onBoldContent.tintedA11y` / `states.boldPressed` |
| medium | subtle | bg `--Primary-Subtle`, text `--Primary-TintedA11y`, pressed `--Primary-Subtle-Pressed` | `surfaces.subtle` / `content.tintedA11y` / `states.subtlePressed` |
| low | ghost | bg `transparent`, text `--Primary-TintedA11y`, pressed `--Primary-Pressed` | `transparent` / `content.tintedA11y` / `states.pressed` |

Appearance remaps the whole family: web via `.appearance{Role}` classes remapping `--_stb-*`; native by passing `resolvedAppearance` to `useSurfaceTokens(role)`.

## Geometry

Sizes are token-driven — web `[data-size]` selectors → native `CONTAINER` / `CONTAINER_CONDENSED` maps (`tokens.spacing['N']`), zero literals.

| Size | minHeight/minWidth | padding | condensed minH/W | Label typography |
| ---- | ------------------ | ------- | ---------------- | ---------------- |
| s | `Spacing-8` | `Spacing-0-5` | `Spacing-4-5` | `Label-S` |
| m | `Spacing-10` | `Spacing-1` | `Spacing-6` | `Label-M` |
| l | `Spacing-12` | `Spacing-2` | `Spacing-8` | `Label-L` |

- **Circular:** native uses `aspectRatio: 1` + `borderRadius: Shape-Pill` (peer of web `aspect-ratio: 1`). `fullWidth` swaps to `width: '100%'`.
- **Padding is vertical-only (`paddingVertical`) — native divergence.** Web uses all-side `padding` and lets the box **grow** to fit the label (`min-width` floor + `aspect-ratio` + `white-space: nowrap`). React Native's Yoga `aspectRatio` instead **clamps width to height** and never grows for content, so all-side padding on the small condensed sizes left a 2-char label (e.g. "Ag" at condensed **M**: 24px circle → 20px inner) narrower than the glyphs, and `numberOfLines={1}` truncated it to "A..". Dropping horizontal padding gives the label the full diameter width while the diameter (driven by height = line-height + vertical padding) stays identical, so the circle is unchanged and 2-char labels no longer truncate.
- **Radius:** brand-overridable via the `SingleTextButton` recipe (`resolveRecipeBorderRadius`), default `Shape-Pill`.
- **Typography:** `useTypographyTokens('label', S|M|L, { emphasis: 'high' })` — peer of `--Label-{Size}-FontSize` + `--Label-FontWeight-High`.

## Loading spinner

Web renders `<CircularProgressIndicator variant="indeterminate">` inside the button, with the `.spinner` wrapper forcing the arc to `currentColor` (the attention-driven text colour). Native reproduces the same 16-unit-viewBox arc (`react-native-svg`, `r=6.5`, dasharray `30.63/10.21`) coloured with the resolved text colour, rotated by an `Animated.View`. Spinner diameter tracks the label font size. A11y subtree uses the shared `getButtonFamilyLoadingSpinnerAccessibility()` (`role='progressbar'`, label `Loading`).

## Accessibility

Native `getSingleTextButtonAccessibilityProps` delegates to the shared `buildButtonFamilyPressableAccessibility` (`accessibilityRole='button'`, `accessibilityState.disabled/busy`, aria passthroughs). Covered by [`SingleTextButtonA11y.test.ts`](../../packages/ui-native/src/components/SingleTextButton/SingleTextButtonA11y.test.ts).

## Known gaps / divergences

- **`loading` vs `disabled` (behavioural divergence)** — Native decouples the two: `loading` reports as **busy** (`aria-busy` / `accessibilityState.busy`) and suppresses activation, but the control is only marked **disabled** (dim opacity, `accessibilityState.disabled`) when `disabled` is explicitly set (`useSingleTextButtonState`: `isDisabled = Boolean(disabled)`). Web still couples them (`SingleTextButton.shared.ts`: `isDisabled = disabled || loading`) — align web to match for full parity.
- **Focus halo** — web draws a two-layer focus ring (`--Surface-Halo-Gap` + `--Focus-Outline`). RN touch surfaces have no focus indicator, so there is no native peer.
- **Hover** — web has per-attention `:hover` background states; native (touch) has press states only.
- **`type` / `className`** — web-only, omitted on native.
- **Motion** — web uses `--Motion-Tap-Scale-*` via CSS `transform: scale()`; native uses `useMotion().tapScale` on an `Animated.Value`, honouring `useReduceMotion()`.
