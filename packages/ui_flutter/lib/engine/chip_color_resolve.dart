import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_chip_types.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

/// Resolved fill / label / border — RN `ChipPaint` + web `--_ch-*` cascade.
class ChipResolvedPaint {
  const ChipResolvedPaint({
    required this.background,
    required this.foreground,
    required this.borderColor,
    required this.borderWidth,
    required this.slotIconColor,
  });

  final Color background;
  final Color foreground;
  final Color borderColor;
  final double borderWidth;
  final Color slotIconColor;
}

FlatRoleTokens _chipRole(
  BuildContext context,
  String appearance,
) {
  return OneUiSurfaceScope.tokensForAppearance(context, appearance);
}

FlatRoleTokens _chipNeutral(
  BuildContext context,
  String unselectedAppearance,
) {
  return OneUiSurfaceScope.tokensForAppearance(context, unselectedAppearance);
}

/// `--Chip-role*` in Convex are primary-scoped slots (web remaps via
/// `.appearanceSecondary` etc.). Only consult them when [appearance] is primary —
/// matches [resolveButtonColors] / `Chip.module.css` default Secondary cascade.
bool _useChipRoleSlots(String appearance) => appearance == 'primary';

List<String> _chipKeys(List<String> keys, String appearance) {
  if (_useChipRoleSlots(appearance)) return keys;
  return keys.where((k) => !k.contains('-role')).toList(growable: false);
}

Color? _fromChipComponent(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required List<String> keys,
  required String appearance,
}) =>
    resolveColorFromComponentPropertyKeys(
      context,
      ds,
      keys: _chipKeys(keys, appearance),
      appearance: appearance,
    );

/// Web `data-unselected-appearance` — stroke/minimal tokens for unselected chips.
Color? _fromChipComponentUnselected(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required List<String> keys,
  required String unselectedAppearance,
}) =>
    _fromChipComponent(context, ds,
        keys: keys, appearance: unselectedAppearance);

/// Web `.start`/`.end { --Icon-color: var(--_ch-default-accent-a11y) }` and
/// `.bold[data-pressed] … { --Icon-color: var(--_ch-bold-tinted-a11y) }`.
Color _resolveChipSlotIconColor(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required bool selected,
  required String variant,
  required String roleAppearance,
  required FlatRoleTokens role,
}) {
  if (selected && variant == 'bold') {
    return _fromChipComponent(context, ds,
            keys: [
              '--Chip-roleBoldTintedA11y',
            ],
            appearance: roleAppearance) ??
        oneUiHexColor(
          role.onBoldContent['tintedA11y'] ?? role.onBoldContent['high']!,
        );
  }
  return _fromChipComponent(context, ds,
          keys: [
            '--Chip-roleTintedA11y',
          ],
          appearance: roleAppearance) ??
      oneUiHexColor(role.content['tintedA11y']!);
}

ChipResolvedPaint resolveChipPaint(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiChipState state,
  required bool selected,
  required bool pressed,
  bool hovered = false,
  required String roleAppearance,
}) {
  final role = _chipRole(context, roleAppearance);
  final neutral = _chipNeutral(context, state.unselectedAppearance);
  final variant = state.resolvedVariant;
  final scope = OneUiScope.of(context);

  double hairline() =>
      ds.resolveComponentLengthPxCascade(
        ['--Chip-borderWidth', '--Stroke-M'],
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: OneUiScope.nativeTypographyOf(context),
      ) ??
      1;

  /// Unselected label — use [neutral] (parent surface role), not primary page text.
  Color textHigh() => oneUiHexColor(neutral.content['high']!);

  List<String> boldSelectedBackgroundKeys() => [
        '--Chip-backgroundColor-bold-selected',
        '--Chip-roleBold',
      ];

  List<String> boldSelectedPressedBackgroundKeys() => [
        '--Chip-backgroundColor-bold-selected-pressed',
        '--Chip-roleBoldPressed',
      ];

  ChipResolvedPaint base() {
    final hw = hairline();
    switch (variant) {
      case 'bold':
        if (selected) {
          return ChipResolvedPaint(
            background: _fromChipComponent(context, ds,
                    keys: boldSelectedBackgroundKeys(),
                    appearance: roleAppearance) ??
                oneUiHexColor(role.surfaces[kSurfaceBold]!),
            foreground: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-textColor-bold-selected',
                      '--Chip-roleBoldHigh',
                    ],
                    appearance: roleAppearance) ??
                oneUiHexColor(
                  role.onBoldContent['high'] ??
                      role.onBoldContent['tintedA11y']!,
                ),
            borderColor: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-borderColor-bold-selected',
                    ],
                    appearance: roleAppearance) ??
                oneUiHexColor(role.surfaces[kSurfaceBold]!),
            borderWidth: hw,
            slotIconColor: _resolveChipSlotIconColor(
              context,
              ds,
              selected: true,
              variant: variant,
              roleAppearance: roleAppearance,
              role: role,
            ),
          );
        }
        return ChipResolvedPaint(
          background: _fromChipComponentUnselected(context, ds,
                  keys: [
                    '--Chip-backgroundColor-bold',
                  ],
                  unselectedAppearance: state.unselectedAppearance) ??
              oneUiHexColor(neutral.surfaces[kSurfaceMinimal]!),
          foreground: _fromChipComponentUnselected(context, ds,
                  keys: [
                    '--Chip-textColor-bold',
                  ],
                  unselectedAppearance: state.unselectedAppearance) ??
              textHigh(),
          borderColor: _fromChipComponentUnselected(context, ds,
                  keys: [
                    '--Chip-borderColor-bold',
                  ],
                  unselectedAppearance: state.unselectedAppearance) ??
              const Color(0x00000000),
          borderWidth: hw,
          slotIconColor: _resolveChipSlotIconColor(
            context,
            ds,
            selected: false,
            variant: variant,
            roleAppearance: roleAppearance,
            role: role,
          ),
        );
      case 'subtle':
        if (selected) {
          return ChipResolvedPaint(
            background: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-backgroundColor-subtle-selected',
                      '--Chip-roleSubtle',
                    ],
                    appearance: roleAppearance) ??
                oneUiHexColor(role.surfaces[kSurfaceSubtle]!),
            foreground: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-textColor-subtle-selected',
                    ],
                    appearance: roleAppearance) ??
                oneUiHexColor(role.content['high']!),
            borderColor: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-borderColor-subtle-selected',
                    ],
                    appearance: roleAppearance) ??
                const Color(0x00000000),
            borderWidth: hw,
            slotIconColor: _resolveChipSlotIconColor(
              context,
              ds,
              selected: true,
              variant: variant,
              roleAppearance: roleAppearance,
              role: role,
            ),
          );
        }
        return ChipResolvedPaint(
          background: _fromChipComponentUnselected(context, ds,
                  keys: [
                    '--Chip-backgroundColor-subtle',
                  ],
                  unselectedAppearance: state.unselectedAppearance) ??
              const Color(0x00000000),
          foreground: _fromChipComponentUnselected(context, ds,
                  keys: [
                    '--Chip-textColor-subtle',
                  ],
                  unselectedAppearance: state.unselectedAppearance) ??
              textHigh(),
          borderColor: _fromChipComponentUnselected(context, ds,
                  keys: [
                    '--Chip-borderColor-subtle',
                  ],
                  unselectedAppearance: state.unselectedAppearance) ??
              oneUiHexColor(
                neutral.content['strokeMedium'] ??
                    neutral.content['strokeLow']!,
              ),
          borderWidth: hw,
          slotIconColor: _resolveChipSlotIconColor(
            context,
            ds,
            selected: false,
            variant: variant,
            roleAppearance: roleAppearance,
            role: role,
          ),
        );
      case 'ghost':
      default:
        if (selected) {
          return ChipResolvedPaint(
            background: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-backgroundColor-ghost-selected',
                    ],
                    appearance: roleAppearance) ??
                const Color(0x00000000),
            foreground: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-textColor-ghost-selected',
                    ],
                    appearance: roleAppearance) ??
                oneUiHexColor(role.content['high']!),
            borderColor: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-borderColor-ghost-selected',
                    ],
                    appearance: roleAppearance) ??
                resolveButtonTokenColor(
                  context,
                  ds,
                  '--${oneUiAppearanceCssLabel(roleAppearance)}-TintedA11y',
                  appearance: roleAppearance,
                ) ??
                oneUiHexColor(role.content['tintedA11y']!),
            borderWidth: hw,
            slotIconColor: _resolveChipSlotIconColor(
              context,
              ds,
              selected: true,
              variant: variant,
              roleAppearance: roleAppearance,
              role: role,
            ),
          );
        }
        return ChipResolvedPaint(
          background: _fromChipComponentUnselected(context, ds,
                  keys: [
                    '--Chip-backgroundColor-ghost',
                  ],
                  unselectedAppearance: state.unselectedAppearance) ??
              const Color(0x00000000),
          foreground: _fromChipComponentUnselected(context, ds,
                  keys: [
                    '--Chip-textColor-ghost',
                  ],
                  unselectedAppearance: state.unselectedAppearance) ??
              textHigh(),
          borderColor: _fromChipComponentUnselected(context, ds,
                  keys: [
                    '--Chip-borderColor-ghost',
                  ],
                  unselectedAppearance: state.unselectedAppearance) ??
              const Color(0x00000000),
          borderWidth: hw,
          slotIconColor: _resolveChipSlotIconColor(
            context,
            ds,
            selected: false,
            variant: variant,
            roleAppearance: roleAppearance,
            role: role,
          ),
        );
    }
  }

  ChipResolvedPaint pressedPaint() {
    final hw = hairline();
    switch (variant) {
      case 'bold':
        if (selected) {
          return ChipResolvedPaint(
            background: _fromChipComponent(context, ds,
                    keys: boldSelectedPressedBackgroundKeys(),
                    appearance: roleAppearance) ??
                oneUiHexColor(
                  role.states['boldPressed'] ?? role.surfaces[kSurfaceBold]!,
                ),
            foreground: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-textColor-bold-selected',
                      '--Chip-roleBoldHigh',
                    ],
                    appearance: roleAppearance) ??
                oneUiHexColor(
                  role.onBoldContent['high'] ??
                      role.onBoldContent['tintedA11y']!,
                ),
            borderColor: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-borderColor-bold-selected-pressed',
                    ],
                    appearance: roleAppearance) ??
                oneUiHexColor(
                  role.states['boldPressed'] ?? role.surfaces[kSurfaceBold]!,
                ),
            borderWidth: hw,
            slotIconColor: _resolveChipSlotIconColor(
              context,
              ds,
              selected: true,
              variant: variant,
              roleAppearance: roleAppearance,
              role: role,
            ),
          );
        }
        return ChipResolvedPaint(
          background: _fromChipComponentUnselected(context, ds,
                  keys: [
                    '--Chip-backgroundColor-bold-pressed',
                  ],
                  unselectedAppearance: state.unselectedAppearance) ??
              oneUiHexColor(neutral.states['pressed'] ??
                  neutral.surfaces[kSurfaceMinimal]!),
          foreground: base().foreground,
          borderColor: const Color(0x00000000),
          borderWidth: hw,
          slotIconColor: base().slotIconColor,
        );
      case 'subtle':
        if (selected) {
          return ChipResolvedPaint(
            background: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-backgroundColor-subtle-selected-pressed',
                    ],
                    appearance: roleAppearance) ??
                oneUiHexColor(
                  role.states['subtlePressed'] ??
                      role.surfaces[kSurfaceSubtle]!,
                ),
            foreground: base().foreground,
            borderColor: const Color(0x00000000),
            borderWidth: hw,
            slotIconColor: base().slotIconColor,
          );
        }
        return ChipResolvedPaint(
          background: _fromChipComponentUnselected(context, ds,
                  keys: [
                    '--Chip-backgroundColor-subtle-pressed',
                  ],
                  unselectedAppearance: state.unselectedAppearance) ??
              oneUiHexColor(neutral.states['pressed'] ??
                  neutral.surfaces[kSurfaceMinimal]!),
          foreground: base().foreground,
          borderColor: base().borderColor,
          borderWidth: hw,
          slotIconColor: base().slotIconColor,
        );
      case 'ghost':
      default:
        if (selected) {
          return ChipResolvedPaint(
            background: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-backgroundColor-ghost-selected-pressed',
                    ],
                    appearance: roleAppearance) ??
                oneUiHexColor(
                  role.states['subtleHover'] ?? role.surfaces[kSurfaceSubtle]!,
                ),
            foreground: base().foreground,
            borderColor: base().borderColor,
            borderWidth: hw,
            slotIconColor: base().slotIconColor,
          );
        }
        return ChipResolvedPaint(
          background: _fromChipComponentUnselected(context, ds,
                  keys: [
                    '--Chip-backgroundColor-ghost-pressed',
                  ],
                  unselectedAppearance: state.unselectedAppearance) ??
              oneUiHexColor(neutral.states['pressed'] ??
                  neutral.surfaces[kSurfaceMinimal]!),
          foreground: base().foreground,
          borderColor: const Color(0x00000000),
          borderWidth: hw,
          slotIconColor: base().slotIconColor,
        );
    }
  }

  ChipResolvedPaint hoverPaint() {
    final hw = hairline();
    switch (variant) {
      case 'bold':
        if (selected) {
          return ChipResolvedPaint(
            background: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-backgroundColor-bold-selected-hover',
                      '--Chip-roleBoldHover',
                    ],
                    appearance: roleAppearance) ??
                oneUiHexColor(
                  role.states['boldHover'] ?? role.surfaces[kSurfaceBold]!,
                ),
            foreground: base().foreground,
            borderColor: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-borderColor-bold-selected-hover',
                    ],
                    appearance: roleAppearance) ??
                oneUiHexColor(
                  role.states['boldHover'] ?? role.surfaces[kSurfaceBold]!,
                ),
            borderWidth: hw,
            slotIconColor: base().slotIconColor,
          );
        }
        return ChipResolvedPaint(
          background: _fromChipComponentUnselected(context, ds,
                  keys: [
                    '--Chip-backgroundColor-bold-hover',
                  ],
                  unselectedAppearance: state.unselectedAppearance) ??
              oneUiHexColor(
                neutral.states['hover'] ?? neutral.surfaces[kSurfaceMinimal]!,
              ),
          foreground: base().foreground,
          borderColor: base().borderColor,
          borderWidth: hw,
          slotIconColor: base().slotIconColor,
        );
      case 'subtle':
        if (selected) {
          return ChipResolvedPaint(
            background: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-backgroundColor-subtle-selected-hover',
                      '--Chip-roleSubtleHover',
                    ],
                    appearance: roleAppearance) ??
                oneUiHexColor(
                  role.states['subtleHover'] ?? role.surfaces[kSurfaceSubtle]!,
                ),
            foreground: base().foreground,
            borderColor: base().borderColor,
            borderWidth: hw,
            slotIconColor: base().slotIconColor,
          );
        }
        return ChipResolvedPaint(
          background: _fromChipComponentUnselected(context, ds,
                  keys: [
                    '--Chip-backgroundColor-subtle-hover',
                  ],
                  unselectedAppearance: state.unselectedAppearance) ??
              oneUiHexColor(
                neutral.states['hover'] ?? neutral.surfaces[kSurfaceMinimal]!,
              ),
          foreground: base().foreground,
          borderColor: base().borderColor,
          borderWidth: hw,
          slotIconColor: base().slotIconColor,
        );
      case 'ghost':
      default:
        if (selected) {
          return ChipResolvedPaint(
            background: _fromChipComponent(context, ds,
                    keys: [
                      '--Chip-backgroundColor-ghost-selected-hover',
                    ],
                    appearance: roleAppearance) ??
                oneUiHexColor(role.surfaces[kSurfaceSubtle]!),
            foreground: base().foreground,
            borderColor: base().borderColor,
            borderWidth: hw,
            slotIconColor: base().slotIconColor,
          );
        }
        return ChipResolvedPaint(
          background: _fromChipComponentUnselected(context, ds,
                  keys: [
                    '--Chip-backgroundColor-ghost-hover',
                  ],
                  unselectedAppearance: state.unselectedAppearance) ??
              oneUiHexColor(
                neutral.states['hover'] ?? neutral.surfaces[kSurfaceMinimal]!,
              ),
          foreground: base().foreground,
          borderColor: base().borderColor,
          borderWidth: hw,
          slotIconColor: base().slotIconColor,
        );
    }
  }

  if (pressed) return pressedPaint();
  if (hovered) return hoverPaint();
  return base();
}
