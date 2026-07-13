# Avatar — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/Avatar/Avatar.tsx](../../packages/ui/src/components/Avatar/Avatar.tsx) | [packages/ui-native/src/components/Avatar/Avatar.native.tsx](../../packages/ui-native/src/components/Avatar/Avatar.native.tsx) |
| Static visuals | `Avatar.module.css` | `Avatar.styles.native.ts` |
| Prop contract | `Avatar.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | `Avatar.stories.tsx` | `Avatar.showcase.native.tsx` |

## Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `AvatarDefault` | **Aligned** — image content at size M |
| 2 | `Variants` | `AvatarVariants` | **Aligned** — image / icon / text |
| 3 | `AttentionLevels` | `AvatarAttentionLevels` | **Aligned** — high / medium / low × content modes |
| 4 | `Sizes` | `AvatarSizes` | **Aligned** — 2XS / XS / S / M / L / XL / 2XL + custom |
| 5 | `Appearances` | `AvatarAppearances` | **Aligned** — 7-role × 3-attention × 2-content matrix (sparkle / brand-bg omitted, matches web's typical demo brand) |
| 6 | `Themes` | `AvatarThemes` | **Aligned** — default / minimal / subtle / elevated × icon + text matrices |
| 7 | `SurfaceContext` | `AvatarSurfaceContext` | **Aligned** — 6 surface modes |
| 8 | `States` | `AvatarStates` | **Aligned** — Default / Disabled across icon + text + image |
| 9 | `ImageFallback` | `AvatarImageFallback` | **Aligned** — valid / broken→icon / custom fallback |
| 10 | `WithIcons` | `AvatarWithIcons` | **Aligned** — person / star / check |
| 11 | `Density` | _intentionally skipped_ | **Web-only** — density cards rely on per-element overrides; native density is a global theme context. |
| 12 | `Interactive` | _intentionally skipped_ | **Web-only** — Storybook play function asserting `data-content` / `data-size` / `data-attention` DOM attributes. RN doesn't expose those data attributes; equivalent assertions live in the Avatar native A11y peer test. |
| 13 | `Responsive` | `AvatarResponsive` | **Aligned** — image / icon / text across S / M / L (mobile viewport) |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `content` | yes | yes | `'image' \| 'icon' \| 'text'` |
| `attention` | yes | yes | `'high' \| 'medium' \| 'low'` |
| `variant` | yes | yes | `'bold' \| 'subtle' \| 'ghost'` (legacy alias) |
| `size` | yes | yes | `'2xs' \| 'xs' \| 's' \| 'm' \| 'l' \| 'xl' \| '2xl' \| 'custom'` |
| `customSize` | yes | yes | dp / px when `size='custom'` |
| `appearance` | yes | yes | 9-role union + `'auto'` |
| `src` | yes | yes | Image source |
| `icon` | yes | yes | Slot — sized by component |
| `alt` | yes | yes | Required for accessibility |
| `disabled` | yes | yes | |
| `fallback` | yes | yes | Used when image fails / no src |
| `style` | yes | yes | `CSSProperties` -> `ViewStyle` |
| `className` | yes | no | Web-only |
| `testID` | no | yes | RN convention |

## Behaviour parity

- Both platforms render the avatar inside a single round container with `border-radius: 9999px` (CSS `--Avatar-borderRadius`) / `tokens.shape.Pill` on native.
- Initials are extracted client-side from `alt` on both platforms — first letter of each whitespace-separated word, max 2.
- Icon slots inherit colour through the slot context cascade (`useComponentSlotIconContext` on native, `--_av-icon-color` on web).
- Image fallback is identical: failed `<img onerror>` / `Image onError` swaps to the icon fallback; explicit `fallback` prop overrides it.

## Known gaps / follow-ups

- The web `Interactive` play function asserts `data-content` / `data-size` / `data-attention` attributes; native exposes the same state through `accessibilityLabel` + dedicated `testID` slots. We rely on the A11y peer test for that coverage.
- The default `appearance` defaults differ at runtime depending on parent slot context (`ComponentSlotIconContext`); when the avatar is nested inside a Badge with `appearance='sparkle'`, both platforms inherit the sparkle role without the consumer having to repeat it.
