# Flutter Radio parity

Flutter `OneUiRadio` / `OneUiRadioGroup` mirror web `Radio` / `RadioGroup` and native `Radio.native.tsx`.

## Aligned

| Area | Web / RN | Flutter |
|------|----------|---------|
| Sizes | S/M/L (`Spacing-4/5/6` box, 50% dot) | `resolveRadioMetrics` + Convex `--Radio-boxSize-*` |
| Appearance | `auto` → `secondary` | `resolveOneUiRadioState` |
| Unchecked | stroke medium, transparent fill | `resolveRadioPaint` via `--{Role}-*` (not `--Radio-role*`) |
| Checked | role bold + on-bold tinted dot | Per-`appearance` role tokens — mirrors `.appearancePrimary` etc. |
| Read-only | content high fill when checked | same |
| Disabled | `--Disabled-Opacity` | Opacity on wrapper |
| Group | `value` / `defaultValue` / `onValueChange` | `OneUiRadioGroup` |
| Orientation | vertical / horizontal gaps | `RadioGroup-*Gap` tokens |
| Surface context | `[data-surface]` + `--Secondary-Fill-*` on demo surfaces | `OneUiSurface` + `_secondarySurfaceFill` (Chip parity) |
| A11y | `role="radio"`, `aria-checked`, readOnly vs disabled | `Semantics(checked: …)`, `SemanticsRole.radioGroup`, `getRadioAccessibilityProps` |
| Brand switch | Convex snapshot + `useBrandCSS` | `bindRadioBrandScope` + `radioBrandScopeKey` on all story sections; `one_ui_radio_brand_switch_test.dart` |
| Label props | `labelSuffixInside`, `labelTrailing`, `aria-describedby` / `aria-invalid` / `aria-hidden` | Same props on `OneUiRadio` |
| Hover | CSS `:hover` on unchecked/checked | `MouseRegion` + `resolveRadioPaint(hovered: …)` |

## Storybook sections (React parity)

Flutter `kRadioStoryNavOrder` matches React `Radio.stories.tsx`:

Docs, Default, Sizes, States, Focus State, Appearances, Appearance (fill roles), Surface Context, Themes, With Label, Interactive, Motion, Responsive, Read Only.

| Story | Flutter implementation |
|-------|------------------------|
| Default | `RadioDefaultStoryPage` (controls panel) |
| Interactive | `RadioInteractiveStoryPage` (2-option group) |
| Motion | `RadioMotionStoryPage` (subtle-motion toggle + tap scale) |
| Focus State | `forceFocusRing` + Informative-Bold halo |

## Partial / deferred

| Area | Notes |
|------|-------|
| Knob scale-burst on check | `_RadioKnobIndicator` — scale 2→1 + opacity (Motion L/S); off when subtle motion |
| Read-only | Solid `--{Role}-High` fill, no inner dot (web `data-readonly`) |
| Story roles | `radioStoryRoles` ∩ React story lists; `rootRoles` keys (not full `themeConfig`) |
| Surface demos | `roleSurfaceDemoBackground` — default/elevated native Surface; other modes `--Secondary-Fill-*` |
| `dotShape` recipe | Convex emits `dotBorderRadius`; Flutter derives from box radius |
| Field composition | Web `labelAssociation="field"`; use platform `InputField` patterns later |

## Files

- `packages/ui_flutter/lib/widgets/one_ui_radio.dart`
- `packages/ui_flutter/lib/widgets/one_ui_radio_group.dart`
- `packages/ui_flutter/lib/engine/radio_color_resolve.dart`
- `packages/ui_flutter/lib/engine/radio_size_resolve.dart`
- `packages/ui_flutter/lib/foundations/radio_*`

See also [`radio-web-native-parity.md`](radio-web-native-parity.md).
