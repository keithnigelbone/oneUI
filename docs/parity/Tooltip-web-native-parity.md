# Tooltip — Web ↔ Native parity

| Area | Web | Native |
|---|---|---|
| Component | [packages/ui/src/components/Tooltip/Tooltip.tsx](../../packages/ui/src/components/Tooltip/Tooltip.tsx) | [packages/ui-native/src/components/Tooltip/Tooltip.native.tsx](../../packages/ui-native/src/components/Tooltip/Tooltip.native.tsx) |
| Static visuals | `Tooltip.module.css` | `Tooltip.styles.native.ts` |
| Prop contract | `Tooltip.shared.ts` | `interface.ts` (locally owned per the playbook) |
| Stories / showcase | `Tooltip.stories.tsx` | `Tooltip.showcase.native.tsx` |

## Storybook ↔ Native showcase section map

| # | Web story | Native section | Status |
|---|---|---|---|
| 1 | `Default` | `TooltipDefault` | **Aligned** |
| 2 | `Positions` | `TooltipPositions` | **Aligned** — 12 Figma position aliases, click trigger (closed by default) |
| 3 | `Arrow` | `TooltipArrow` | **Aligned** |
| 4 | `TriggerModes` | `TooltipTriggerModes` | **Aligned** — hover / click / focus |
| 5 | `Delay` | `TooltipDelay` | **Aligned** |
| 6 | `Disabled` | `TooltipDisabled` | **Aligned** |
| 7 | `Controlled` | `TooltipControlled` | **Aligned** — `trigger="manual"` |
| 8 | `MaxWidth` | `TooltipMaxWidth` | **Aligned** |
| 9 | `Motion` | `TooltipMotion` | **Aligned** — `subtle` prop + reduce-motion path |
| 10 | `Long content / nowrap vs maxWidth` | `TooltipLongContent` | **Aligned** |
| 11 | `Portal` | _intentionally diverged_ | **Native** — trigger-relative sibling (no root `Modal`) |
| 12 | `Interactive` | _intentionally skipped_ | **Web-only** — Storybook play function |
| 13 | `Surface Context / Bold` | `TooltipInsideBoldSurface` | **Aligned** |
| 14 | `Surface Context / Subtle` | `TooltipInsideSubtleSurface` | **Aligned** |
| 15 | `Surface Context / All Modes` | `TooltipSurfaceContext` | **Aligned** |
| 16 | _Layers RN: interactive positions_ | `TooltipPositionsInteractive` | **Aligned** — click-toggle grid (manual trigger) |
| 17 | _Layers RN: side offset_ | `TooltipSideOffset` | **Aligned** |
| 18 | _Layers RN: icon trigger_ | `TooltipIconTrigger` | **Aligned** |

## Prop parity

| Prop | Web | Native | Notes |
|---|:-:|:-:|---|
| `children` | yes | yes | Trigger element |
| `content` | yes | yes | `ReactNode` popup body |
| `position` | yes | yes | 12 Figma aliases → `parsePosition` |
| `side` | yes | yes | Explicit side wins over `position` |
| `align` | yes | yes | `start` / `center` / `end` |
| `sideOffset` | yes | yes | Default `Spacing-2` (8px baseline) |
| `open` | yes | yes | Controlled open state |
| `defaultOpen` | yes | yes | Uncontrolled initial state |
| `onOpenChange` | yes | yes | |
| `trigger` | yes | yes | `hover` / `click` / `focus` / `manual` |
| `delay` | yes | yes | Default 200ms; native applies on `click` (mobile has no hover) |
| `closeDelay` | yes | yes | |
| `arrow` | yes | yes | Figma `tip` |
| `maxWidth` | yes | yes | Number or `NNpx` string; CSS `var()` strings are not resolved on native |
| `hoverable` | yes | yes | Affects hover-mode outside dismiss only |
| `disabled` | yes | yes | |
| `portal` | yes | yes (deprecated) | Native ignores — popup is anchor-relative |
| `zIndex` | yes | yes | Default `tokens.zIndex.tooltip` |
| `subtle` | yes | yes | Opacity-only motion + faster Subtle timing |
| `testID` | no | yes | RN convention |
| `accessibilityHint` | no | yes | RN passthrough on trigger |
| `aria-label` | no | yes | Trigger label override |

## Behaviour parity

- **Position API:** `parsePosition` in `interface.ts` mirrors `Tooltip.shared.ts` — Figma tip positions invert to popup `side` + `align` exactly like web/Base UI.
- **Paint:** Popup always uses **neutral** role — `surfaces.bold` fill + `onBoldContent.high` text. Web maps these via legacy `--Surface-Bold` / `--Text-OnBold-High` (engine emits those aliases from neutral in `generateMultiRoleRootCSS`). Native: `useSurfaceTokens('neutral')`. Web popup also sets `data-mode="light"` so the chip stays dark on dark pages. Typography: Body S Medium via `useTypographyTokens('body', 'S', { emphasis: 'medium' })`.
- **Geometry:** Padding `Spacing-1-5` × `Spacing-3`, radius `Shape-1-5`, arrow 18×6 Figma path, 6px corner inset for start/end — all from spacing tokens in `Tooltip.styles.native.ts`.
- **Mount strategy:** Web mounts via Base UI `Tooltip.Portal` → `document.body`. Native mounts as an absolutely positioned sibling inside `styles.anchor`, positioned with `measureLayout(trigger → anchor)` so scroll position stays in sync with the trigger.
- **Provider:** `TooltipProvider` shares `delay` / `closeDelay` through React context (web: Base UI provider).
- **Recipe:** `useComponentRecipe('tooltip')` maps `cornerRadius` (`sharp` / `default` / `soft` / `pill`) and `density` (`tight` / `default` / `roomy`) per `Tooltip.recipe.ts`.
- **Surface context:** Trigger buttons inside `<Surface mode="…">` re-contrast via native Surface context. Popup paint is pinned to neutral bold (not inherited from parent Surface); web achieves the same by portaling to `:root` legacy aliases.

## Layers cross-check (`jdstooltip`)

| Layers RN | OneUI native |
|---|---|
| `position` | `position` |
| `tip` | `arrow` |
| `disable` | `disabled` |
| `hideDelay` | `closeDelay` |
| `offset` | `sideOffset` |
| `text` (string) | `content` (`ReactNode`) |
| `testID` | `testID` |
| `ariaLabel` | `aria-label` |

## Known gaps / follow-ups

- **Hover trigger on touch:** RN maps `trigger="hover"` to press-and-hold (`onPressIn` / `onPressOut`) because there is no cursor hover. Web uses pointer enter/leave via Base UI.
- **Click delay on native:** `delay` applies before open on `trigger="click"` (tap → wait → open; second tap while waiting cancels). Web click/focus open immediately (`delay={0}` on Base UI root).
- **Focus trigger:** Requires a focusable child (e.g. `Button`). Plain `Text` triggers do not receive focus on mobile.
- **maxWidth CSS strings:** Only numeric values and `NNpx` strings resolve; arbitrary CSS lengths (`rem`, `var(--Spacing-40)`) are not parsed — pass numbers from `theme.spacing` instead.
- **Hoverable popup body:** Moving a finger onto the popup without closing (web `disableHoverablePopup={false}`) is not replicated — touch targets dismiss on outside press except in hover+hoverable mode.
- **Escape key:** Web listens for `Escape` on click/focus modes. Native uses Android back button via `BackHandler` (no hardware Escape on phones).
- **Shared import gate:** Native contract is owned in `interface.ts` (playbook); `pnpm check:parity` shared-import rule applies to components that re-export web shared types — Tooltip follows the native-owned contract pattern used by Badge/Button.
