# LinkButton — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/LinkButton/LinkButton.tsx](../../packages/ui/src/components/LinkButton/LinkButton.tsx) | [packages/ui-native/src/components/LinkButton/LinkButton.native.tsx](../../packages/ui-native/src/components/LinkButton/LinkButton.native.tsx) |
| Static visuals | `LinkButton.module.css` | `StyleSheet.create` block in `LinkButton.native.tsx` |
| Prop contract | `LinkButton.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | `LinkButton.stories.tsx` | `LinkButton.showcase.native.tsx` (new) |

## Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `LinkButtonDefault` | **Aligned** |
| 2 | `AttentionLevels` | `LinkButtonAttentionLevels` | **Aligned** — High / Medium / Low |
| 3 | `Sizes` | `LinkButtonSizes` | **Aligned** — S / M / L |
| 4 | `States` | `LinkButtonStates` | **Aligned** — Default / Disabled / Loading × 3 attention levels |
| 4b | `FocusState` | _intentionally skipped_ | **Web-only** — RN touch surfaces have no focus indicator. |
| 5 | `Appearances` | `LinkButtonAppearances` | **Aligned** — 9-role × 3-attention matrix |
| 6 | `WithSlots` | `LinkButtonWithSlots` | **Aligned** — start / end / both, by attention level |
| 7 | `Interactive` | _intentionally skipped_ | **Web-only** — Storybook play function calls `userEvent.click`/`userEvent.keyboard`. Equivalent assertions live in the LinkButton native A11y peer test. |
| 8 | `Responsive` | `LinkButtonResponsive` | **Aligned** — same matrix framed for narrow viewport |
| 9 | `Themes` | _intentionally skipped_ | **Web-only** — theme toolbar driven; native theme is global, so we render the active theme only. |
| 10 | `SurfaceContext` | `LinkButtonSurfaceContext` | **Aligned** — 6 surface modes |
| 11 | `Density` | _intentionally skipped_ | **Web-only** — density cards rely on per-element overrides; native density is global. |
| 12 | `LoadingStates` | `LinkButtonLoadingStates` | **Aligned** — loading × attention / slot / size matrices |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `children` | yes | yes | Label content |
| `attention` | yes | yes | `'high' \| 'medium' \| 'low'` (Figma terminology) |
| `variant` | yes | yes | `'bold' \| 'subtle' \| 'ghost'` (legacy alias for `attention`) |
| `size` | yes | yes | `'s' \| 'm' \| 'l'` + numeric `6/8/10/12` for cross-engine alignment |
| `appearance` | yes | yes | 9-role union + `'auto'` |
| `start` | yes | yes | Icon slot |
| `end` | yes | yes | Icon slot |
| `disabled` | yes | yes | |
| `loading` | yes | yes | Renders inline spinner before label |
| `showUnderline` | yes | yes | Per-instance opt-out; web also reads from CSS, native reads from prop only |
| `onClick` / `onPress` | yes | yes | Native accepts both; `onPress` is preferred |
| `aria-label` | yes | yes | |
| `accessibilityHint` | no | yes | RN-only, paired with `aria-label` |
| `style` | yes | yes | `CSSProperties` -> `ViewStyle` |
| `className` | yes | no | Web-only |
| `testID` | no | yes | RN convention |

## Behaviour parity

- Underline rendering — web uses `text-decoration` driven by CSS, native uses `textDecorationLine` + `textDecorationColor` on the label `Text`. The `subtle` variant's hover-only underline is rendered as transparent on native because RN has no hover state.
- Both platforms expose `role='link'` (web `<button>` with `data-link-style`, native `Pressable` with explicit `role='link'`).
- Disabled / loading opacity matches the web's `--LinkButton-disabledOpacity` (0.5) and `--LinkButton-loadingOpacity` (0.65).
- Spinner geometry matches the web inline SVG (radius 6.5, stroke 1.5, dasharray 30.63 / 10.21).

## Known gaps / follow-ups

- Hover state for `subtle` variant — web reveals an underline on hover; native renders transparent because RN has no hover state.
- The numeric size prop (`6 | 8 | 10 | 12`) is exposed for parity with web's coarse-grained density tokens; new code should prefer the `'s' | 'm' | 'l'` aliases.
- LinkButton ships as the back-end for `Button` when `contained=false`; the same parity rules apply when used through that delegation path.
