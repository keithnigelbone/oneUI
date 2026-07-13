# Logo — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/Logo/Logo.tsx](../../packages/ui/src/components/Logo/Logo.tsx) | [packages/ui-native/src/components/Logo/Logo.native.tsx](../../packages/ui-native/src/components/Logo/Logo.native.tsx) |
| Static visuals | `Logo.module.css` | `Logo.styles.native.ts` |
| Prop contract | `Logo.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | `Logo.stories.tsx` | `Logo.showcase.native.tsx` |

## Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `LogoDefault` | **Aligned** — single mark at size M |
| 2 | `Variants` | `LogoVariants` | **Aligned** — `mark` vs `full` |
| 3 | `Sizes` | `LogoSizes` | **Aligned** — XS/S/M/L/XL + custom (48 dp) |
| 4 | `ContentSources` | `LogoContentSources` | **Aligned** — children / svgContent / src |
| 5 | `SurfaceContext` | `LogoSurfaceContext` | **Aligned** — 6 surface modes (default/minimal/subtle/moderate/bold/elevated) |
| 6 | `ImageFallback` | `LogoImageFallback` | **Aligned** — broken `src` + fallback / empty + fallback |
| 7 | `Interactive` | `LogoInteractive` | **Aligned** — single mark at size M (controls counterpart on web) |
| 8 | `Themes` | `LogoThemes` | **Aligned** — all sizes side by side, plus on a bold surface |

## Native-only sections

These exist to keep regression coverage for native-specific flows that don't have their own web story:

| Section | Reason |
|---|---|
| `LogoCustomSize` | Three explicit `customSize` values (48/72/96 dp); web folds these into `Sizes` |
| `LogoFromImage` | Single image-source case so the `<RNImage>` branch is rendered standalone |
| `LogoFromChildren` | Single children branch (`Svg/Path` JSX) so the renderless / inherit-currentColor path is rendered standalone |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `variant` | yes | yes | `'mark' \| 'full'` |
| `size` | yes | yes | `'xs' \| 's' \| 'm' \| 'l' \| 'xl' \| 'custom'` |
| `customSize` | yes | yes | dp / px when `size='custom'` |
| `svgContent` | yes | yes | Inline SVG XML |
| `src` | yes | yes | Image URL / data URI |
| `children` | yes | yes | JSX rendering |
| `fallback` | yes | yes | Rendered when `src` errors or no content provided |
| `alt` | yes | yes | Accessibility label (required) |
| `style` | yes | yes | `CSSProperties` -> `ViewStyle` |
| `className` | yes | no | Web-only |
| `testID` | no | yes | RN convention |

## Behaviour parity

- Both platforms resolve content in the priority `children > svgContent > src > fallback`.
- Both platforms colour the SVG via `currentColor` semantics — web uses CSS `color`, native passes `color` through `SvgXml`.
- Both platforms expose the brand-logo context in stories via `useBrandLogo` (web) / per-screen `svgContent` prop (native).

## Known gaps / follow-ups

- Pre-existing baseline `error TS2304: Cannot find name 'logoColor'` in [Logo.native.tsx:62](../../packages/ui-native/src/components/Logo/Logo.native.tsx) is **unchanged** by this PR. The fix lives in a separate Logo refactor branch and is out of scope for the showcase parity sweep.
- Web `Themes` story relies on a Storybook decorator that re-renders both light and dark themes. On native we render a single theme but include a bold-surface row to cover the contrasting on-bold colour path.
