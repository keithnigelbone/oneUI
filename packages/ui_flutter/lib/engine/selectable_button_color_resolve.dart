import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_selectable_button_types.dart';
import 'focus_ring_resolve.dart' show resolveSurfaceHaloGapFromScope;
import 'native_design_system_payload.dart';
import 'nested_surface_component_resolve.dart';
import 'surface_engine.dart';

class SelectableButtonResolvedPaint {
  const SelectableButtonResolvedPaint({
    required this.background,
    required this.foreground,
    required this.borderColor,
    required this.borderWidth,
    required this.slotIconColor,
    this.uncontainedSelectedFontWeight,
  });

  final Color background;
  final Color foreground;
  final Color borderColor;
  final double borderWidth;
  final Color slotIconColor;
  final FontWeight? uncontainedSelectedFontWeight;
}

bool _useRoleSlots(String appearance) => appearance == 'primary';

List<String> _keys(List<String> keys, String appearance) {
  if (_useRoleSlots(appearance)) return keys;
  return keys.where((k) => !k.contains('-role')).toList(growable: false);
}

Color? _fromComponent(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required List<String> keys,
  required String appearance,
}) {
  // Web remaps `--SelectableButton-role*` per `.appearance*` class. Convex
  // component props are primary-scoped; non-primary colours come from surface role tokens.
  if (appearance != 'primary') return null;
  return resolveColorFromComponentPropertyKeys(
    context,
    ds,
    keys: _keys(keys, appearance),
    appearance: appearance,
  );
}

FlatRoleTokens _role(BuildContext context, String appearance) =>
    OneUiSurfaceScope.tokensForAppearance(context, appearance);

double _hairline(BuildContext context, NativeDesignSystemPayload ds) {
  final scope = OneUiScope.of(context);
  return ds.resolveComponentLengthPxCascade(
        ['--Stroke-M'],
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: OneUiScope.nativeTypographyOf(context),
      ) ??
      1;
}

Color _mediumText(FlatRoleTokens role) =>
    oneUiHexColor(role.content['mediumText'] ?? role.content['high']!);

Color _tintedA11y(FlatRoleTokens role) =>
    oneUiHexColor(role.content['tintedA11y']!);

Color _strokeLow(FlatRoleTokens role) =>
    oneUiHexColor(role.content['strokeLow']!);

FontWeight? _resolveUncontainedSelectedFontWeight(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
  final scope = OneUiScope.of(context);
  final typo = OneUiScope.nativeTypographyOf(context);
  final raw = ds.resolveCSSValue(
    ds.rawComponentCascade([
      '--SelectableButton-fontWeight-uncontained-selected',
      '--Label-FontWeight-High',
    ]),
    platformId: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
    nativeTypography: typo,
  );
  if (raw == null) return null;
  final n = int.tryParse(raw.replaceAll(RegExp(r'[^0-9]'), ''));
  if (n == null) return null;
  return FontWeight.values.firstWhere(
    (w) => w.value == n,
    orElse: () => FontWeight.w700,
  );
}

Color _boldHigh(FlatRoleTokens role) => oneUiHexColor(
      role.onBoldContent['tintedA11y'] ?? role.onBoldContent['high']!,
    );

Color _resolveSlotIconColor({
  required bool selected,
  required OneUiSelectableButtonAttention attention,
  required FlatRoleTokens role,
  required Color foreground,
}) {
  if (!selected) return _mediumText(role);
  if (attention == 'high') return _boldHigh(role);
  return _tintedA11y(role);
}

SelectableButtonResolvedPaint resolveSelectableButtonPaint(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required bool selected,
  required bool hovered,
  required bool contained,
  required OneUiSelectableButtonAttention attention,
  required String appearance,
}) {
  final role = _role(context, appearance);
  final hw = _hairline(context, ds);

  if (!contained) {
    if (!selected) {
      final fg = _fromComponent(context, ds,
              keys: ['--SelectableButton-textColor-uncontained'],
              appearance: appearance) ??
          _mediumText(role);
      return SelectableButtonResolvedPaint(
        background: const Color(0x00000000),
        foreground: fg,
        borderColor: const Color(0x00000000),
        borderWidth: 0,
        slotIconColor: fg,
      );
    }
    final fg = _fromComponent(context, ds,
            keys: ['--SelectableButton-textColor-uncontained-selected'],
            appearance: appearance) ??
        _tintedA11y(role);
    return SelectableButtonResolvedPaint(
      background: const Color(0x00000000),
      foreground: fg,
      borderColor: const Color(0x00000000),
      borderWidth: 0,
      slotIconColor: fg,
      uncontainedSelectedFontWeight:
          _resolveUncontainedSelectedFontWeight(context, ds),
    );
  }

  if (!selected) {
    final bg = hovered
        ? (_fromComponent(context, ds,
                keys: ['--SelectableButton-backgroundColor-hover'],
                appearance: appearance) ??
            oneUiHexColor(role.surfaces[kSurfaceMinimal]!))
        : (_fromComponent(context, ds,
                keys: ['--SelectableButton-backgroundColor'],
                appearance: appearance) ??
            const Color(0x00000000));
    final fg = _fromComponent(context, ds,
            keys: ['--SelectableButton-textColor', '--SelectableButton-roleMediumText'],
            appearance: appearance) ??
        _mediumText(role);
    final border = _fromComponent(context, ds,
            keys: ['--SelectableButton-borderColor', '--SelectableButton-roleStrokeLow'],
            appearance: appearance) ??
        _strokeLow(role);
    return SelectableButtonResolvedPaint(
      background: bg,
      foreground: fg,
      borderColor: border,
      borderWidth: hw,
      slotIconColor: _resolveSlotIconColor(
        selected: false,
        attention: attention,
        role: role,
        foreground: fg,
      ),
    );
  }

  switch (attention) {
    case 'medium':
      final bg = hovered
          ? (_fromComponent(context, ds,
                  keys: [
                    '--SelectableButton-backgroundColor-selected-medium-hover',
                    '--SelectableButton-roleSubtleHover',
                  ],
                  appearance: appearance) ??
              oneUiHexColor(
                  role.states['subtleHover'] ?? role.surfaces[kSurfaceSubtle]!))
          : (_fromComponent(context, ds,
                  keys: [
                    '--SelectableButton-backgroundColor-selected-medium',
                    '--SelectableButton-roleSubtle',
                  ],
                  appearance: appearance) ??
              oneUiHexColor(role.surfaces[kSurfaceSubtle]!));
      final fg = _fromComponent(context, ds,
              keys: [
                '--SelectableButton-textColor-selected-medium',
                '--SelectableButton-roleTintedA11y',
              ],
              appearance: appearance) ??
          _tintedA11y(role);
      return SelectableButtonResolvedPaint(
        background: bg,
        foreground: fg,
        borderColor: const Color(0x00000000),
        borderWidth: hw,
        slotIconColor: _resolveSlotIconColor(
          selected: true,
          attention: attention,
          role: role,
          foreground: fg,
        ),
      );
    case 'low':
      final bg = hovered
          ? (_fromComponent(context, ds,
                  keys: ['--SelectableButton-backgroundColor-selected-low-hover'],
                  appearance: appearance) ??
              oneUiHexColor(role.surfaces[kSurfaceMinimal]!))
          : const Color(0x00000000);
      final fg = _fromComponent(context, ds,
              keys: [
                '--SelectableButton-textColor-selected-low',
                '--SelectableButton-roleTintedA11y',
              ],
              appearance: appearance) ??
          _tintedA11y(role);
      final border = _fromComponent(context, ds,
              keys: [
                '--SelectableButton-borderColor-selected-low',
                '--SelectableButton-roleBold',
              ],
              appearance: appearance) ??
          oneUiHexColor(role.surfaces[kSurfaceBold]!);
      return SelectableButtonResolvedPaint(
        background: bg,
        foreground: fg,
        borderColor: border,
        borderWidth: hw,
        slotIconColor: _resolveSlotIconColor(
          selected: true,
          attention: attention,
          role: role,
          foreground: fg,
        ),
      );
    case 'high':
    default:
      final bg = hovered
          ? (_fromComponent(context, ds,
                  keys: [
                    '--SelectableButton-backgroundColor-selected-high-hover',
                    '--SelectableButton-roleBoldHover',
                  ],
                  appearance: appearance) ??
              oneUiHexColor(
                  role.states['boldHover'] ?? role.surfaces[kSurfaceBold]!))
          : (_fromComponent(context, ds,
                  keys: [
                    '--SelectableButton-backgroundColor-selected-high',
                    '--SelectableButton-roleBold',
                  ],
                  appearance: appearance) ??
              oneUiHexColor(role.surfaces[kSurfaceBold]!));
      final fg = _fromComponent(context, ds,
              keys: [
                '--SelectableButton-textColor-selected-high',
                '--SelectableButton-roleBoldHigh',
              ],
              appearance: appearance) ??
          _boldHigh(role);
      return SelectableButtonResolvedPaint(
        background: bg,
        foreground: fg,
        borderColor: const Color(0x00000000),
        borderWidth: hw,
        slotIconColor: _resolveSlotIconColor(
          selected: true,
          attention: attention,
          role: role,
          foreground: fg,
        ),
      );
  }
}

Color? selectableButtonFocusHaloGapOverride(
  BuildContext context, {
  required Color restingFill,
  required bool selected,
}) {
  if (restingFill.a == 0 || selected) {
    return resolveSurfaceHaloGapFromScope(context);
  }
  return restingFill;
}