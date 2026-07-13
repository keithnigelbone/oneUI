# Flutter component parity pass (Web + RN + Convex)

Master checklist for the Flutter Storybook components. Run **`flutter test test/component_surface_parity_test.dart`** after engine or resolver changes.

**References:** [flutter-surface-context-audit.md](./flutter-surface-context-audit.md) · per-component [*-web-native-parity.md](./README.md) · Convex `nativeTheme:getNativeThemeSnapshot`

## Global rules (all components)

| Rule | Web | RN | Flutter |
|------|-----|-----|---------|
| Convex snapshot | `useBrandCSS` + flat `--*` map | `buildNativeTheme` + `rootRoles` | `OneUiBrandScope` + `NativeThemeSnapshot` |
| Role lookup | CSS `[data-surface]` remapping | `useSurfaceTokens` chain | `OneUiSurfaceScope.tokensForAppearance` |
| Unconfigured role | N/A | Falls back primary → neutral | `isAppearanceConfigured` → gap card; stories use `appearanceRolesForBrand` |
| Nested surface colours | No root `#hex` inside `[data-surface]` | Same | `resolveColorFromComponentPropertyKeys` |
| Surface `auto` | Inherits parent effective appearance | Partial | `OneUiSurfaceScope.effectiveSurfaceAppearance` |
| Ghost + different appearance | `--Surface-Self-Color` at parent step | No fill (RN) | **Web parity:** paints role at parent step when effective ≠ parent |

## Component matrix

| Component | Flutter widget | Colour resolver | RN | Web parity doc | Surface story | Brand-filtered appearances | Auto test |
|-----------|----------------|-----------------|----|----------------|---------------|---------------------------|-----------|
| Button | `one_ui_button.dart` | `button_color_resolve.dart` | ✅ | [button](./button-web-native-parity.md) | ✅ | ✅ | ✅ |
| IconButton | `one_ui_icon_button.dart` | `icon_button_color_resolve.dart` | ✅ | [iconbutton](./iconbutton-web-native-parity.md) | ✅ | ✅ | ✅ |
| Icon | `one_ui_icon.dart` | `icon_color_resolve.dart` | ✅ | [icon](./icon-web-native-parity.md) | ✅ | — | ✅ |
| IconContained | `one_ui_icon_contained.dart` | `icon_contained_color_resolve.dart` | ✅ | [icon-contained](./icon-contained-web-native-parity.md) | ✅ | — | ✅ |
| Avatar | `one_ui_avatar.dart` | `avatar_color_resolve.dart` | ✅ | [avatar](./avatar-web-native-parity.md) | ✅ | ✅ | ✅ |
| Text | `one_ui_text.dart` | `text_color_resolve.dart` | ✅ | [text](./text-web-native-parity.md) | ✅ | — | ✅ |
| Badge | `one_ui_badge.dart` | `badge_color_resolve.dart` | ✅ | [badge](./badge-web-native-parity.md) | ✅ | ✅ | ✅ |
| CounterBadge | `one_ui_counter_badge.dart` | `counter_badge_color_resolve.dart` | ✅ | [counterbadge](./counterbadge-web-native-parity.md) | partial | — | ✅ |
| IndicatorBadge | `one_ui_indicator_badge.dart` | `indicator_badge_color_resolve.dart` | ✅ | [indicatorbadge](./indicatorbadge-web-native-parity.md) | ✅ | — | ✅ |
| Image | `one_ui_image.dart` | `image_style_resolve.dart` | ✅ | [image](./image-web-native-parity.md) | — | — | layout only |
| Input | `one_ui_input.dart` | `input_color_resolve.dart` | ✅ | [input](./input-web-native-parity.md) | via InputField | — | ✅ |
| InputField | `one_ui_input_field.dart` | (uses Input) | ✅ | [inputfield](./inputfield-web-native-parity.md) | ✅ | — | ✅ |
| InputDynamicText | `one_ui_input_dynamic_text.dart` | `input_dynamic_text_resolve.dart` | ✅ | [inputdynamictext](./inputdynamictext-web-native-parity.md) | internals | — | partial |
| InputFeedback | `one_ui_input_feedback.dart` | `input_feedback_resolve.dart` | ✅ | [inputfeedback](./inputfeedback-web-native-parity.md) | internals | — | ✅ |
| CircularProgressIndicator | `one_ui_circular_progress_indicator.dart` | `cpi_color_resolve.dart` | ✅ | [cpi](./circularprogressindicator-web-native-parity.md) | ✅ | ✅ | ✅ |
| Chip | `one_ui_chip.dart` | `chip_color_resolve.dart` | ✅ | [chip](./chip-web-native-parity.md) | ✅ | ✅ | ✅ |
| ChipGroup | `one_ui_chip_group.dart` | (Chip) | ✅ | [chipgroup](./chipgroup-web-native-parity.md) | ✅ | ✅ | ✅ |
| Radio | `one_ui_radio.dart` | `radio_color_resolve.dart` | ✅ | [radio](./flutter-radio-parity.md) | ✅ | ✅ | ✅ |

## Per-component audit steps

1. Read web `*.module.css` + `*.shared.ts` + Surface Context story.
2. Read RN `interface.ts` + native tests.
3. Confirm Flutter: `tokensForAppearance`, `resolveColorFromComponentPropertyKeys` on colour paths, `isAppearanceConfigured` on gap cards.
4. Confirm `appearance="auto"` matches web/RN default (see table below).
5. Hot-restart Storybook: **One UI Theme**, **Jio**, **Swadesh**, **Reliance** (light + dark) — bold / subtle / ghost rows on Surface stories.
6. Run `flutter test test/component_surface_parity_test.dart`.

## `appearance="auto"` defaults (must match web CSS)

| Component | Flutter resolved default |
|-----------|-------------------------|
| Chip | `secondary` |
| Badge | `sparkle` (or parent surface role inside Surface) |
| Text | `neutral` |
| IconButton / Button | `primary` (explicit on widget) |
| CPI | `primary` |
| Radio | `secondary` |
| CounterBadge / IndicatorBadge | parent slot or `primary` |

## Known intentional deltas

| Topic | RN | Flutter |
|-------|-----|---------|
| Ghost surface fill | No `backgroundColor` | Web parity: cross-role ghost paints fill |
| `loopFocus` on ChipGroup | Declared, not implemented | Implemented |
| Badge `auto` outside Surface | RN uses sparkle | Flutter uses sparkle via `resolveOneUiBadgeState` |

## Commands

```bash
cd packages/ui_flutter
flutter test test/component_surface_parity_test.dart
flutter test test/surface_scope_appearance_test.dart
flutter test test/nested_surface_component_resolve_test.dart
```
