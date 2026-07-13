# IconButton — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/IconButton/IconButton.tsx](../../packages/ui/src/components/IconButton/IconButton.tsx) | [packages/ui-native/src/components/IconButton/IconButton.native.tsx](../../packages/ui-native/src/components/IconButton/IconButton.native.tsx) |
| Static visuals | `IconButton.module.css` | `IconButton.styles.native.ts` |
| Prop contract | `IconButton.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | `IconButton.stories.tsx` | `IconButton.showcase.native.tsx` |

## Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `IconButtonDefault` | **Aligned** |
| 2 | `AttentionLevels` | `IconButtonAttentionLevels` | **Aligned** |
| 3 | `Sizes` | `IconButtonSizes` | **Aligned** — 2XS / XS / S / M / L / XL |
| 4 | `Condensed` | `IconButtonCondensed` | **Aligned** — Normal vs Condensed comparison |
| 5 | `States` | `IconButtonStates` | **Aligned** — Default / Disabled / Loading |
| 5b | `FocusState` | _intentionally skipped_ | **Web-only** — RN touch surfaces have no focus indicator. |
| 6 | `Appearances` | `IconButtonAppearances` | **Aligned** — 9-role × 3-attention matrix |
| 7 | `Shapes` (`ShapeLayouts`) | `IconButtonLayouts` | **Aligned** — `1:1` square + `3:2` wide |
| 8 | `FullWidth` | `IconButtonFullWidth` | **Aligned** |
| 9 | `Interactive` | _intentionally skipped_ | **Web-only** — Storybook play function asserting `getByRole('button')` accessible name + keyboard activation. Equivalent assertions live in the IconButton native A11y peer test. |
| 10 | `Responsive` | `IconButtonResponsive` | **Aligned** — even-spread row mimicking a narrow nav bar |
| 11 | `Themes` | _intentionally skipped_ | **Web-only** — theme decorator driven; native theme is global. |
| 12 | `SurfaceContext` | `IconButtonSurfaceContext` | **Partially aligned** — native renders default/minimal/subtle/bold (web also includes moderate/elevated; same code path) |
| 13 | `Density` | _intentionally skipped_ | **Web-only** — density cards rely on per-element overrides; native density is global. |
| 14 | `LoadingStates` | `IconButtonLoadingStates` | **Aligned** — attention × size matrices |
| 15 | `Motion` | `IconButtonMotion` | **Partially aligned** — tap interaction implemented as `Animated.spring` scale-up (1.07 for 1:1 / default; honours `useReduceMotion`). Web's CSS keyframes + `data-layout="3:2"` scale-down variant not ported (motion-feel parity covered by the spring scale-up only). |

## Native-only sections

| Section | Reason |
|---|---|
| `IconButtonWithJdsIcon` | Native uses JDS icon glyphs (`IcAddGlyph`); web uses inline SVG via the `<Icon>` resolver. The dedicated section pins the glyph wiring so we catch regressions in the slot context cascade. |
| `IconButtonLoadingSizes` | Native still ships the size-only loading matrix as a back-compat export; `IconButtonLoadingStates` supersedes it but consumers may rely on the older name. |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `icon` | yes | yes | Required slot |
| `attention` | yes | yes | `'high' \| 'medium' \| 'low'` |
| `variant` | yes | yes | `'bold' \| 'subtle' \| 'ghost'` (legacy alias) |
| `size` | yes | yes | `'2xs' \| 'xs' \| 's' \| 'm' \| 'l' \| 'xl'` |
| `appearance` | yes | yes | 9-role union + `'auto'` |
| `condensed` | yes | yes | Reduces container size, keeps icon size |
| `layout` | yes | yes | `'1:1' \| '3:2'` |
| `fullWidth` | yes | yes | |
| `disabled` | yes | yes | |
| `loading` | yes | yes | |
| `aria-label` | yes | yes | Required for accessibility |
| `style` | yes | yes | `CSSProperties` -> `ViewStyle` |
| `className` | yes | no | Web-only |
| `testID` | no | yes | RN convention |

## Behaviour parity

- Both platforms enforce `aria-label` because the icon-only surface has no implicit accessible name.
- Both platforms read the slot icon size from a shared context (web: `--_ib-icon-size`; native: `useComponentSlotIconContext`) so the same icon node sizes correctly across all six size tokens.
- `condensed` shrinks padding without scaling the icon glyph on both platforms.
- The motion section uses `Animated.spring` to mirror web's `transform: scale(1.07)` on press; the reduced-motion path skips the scale-up entirely.

## Known gaps / follow-ups

- Web's `data-layout="3:2"` renders a 3% scale-DOWN; native motion currently scales up only. If we standardise on direction, we should fork `MotionWrap` per layout.
- Web's `Density` and `Themes` stories rely on per-card data attributes. Native exposes the same outcomes via global theme context, so single-theme renders are the source of truth.
