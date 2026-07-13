import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_selectable_icon_button_types.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';
import 'surface_engine.dart';

/// Resolved paint for one visual state — mirrors `--_sib-*` CSS cascade.
class SelectableIconButtonPaint {
  const SelectableIconButtonPaint({
    required this.background,
    required this.foreground,
    this.borderColor,
    this.borderWidth = 0,
    this.backgroundHover,
  });

  final Color background;
  final Color foreground;
  final Color? borderColor;
  final double borderWidth;
  final Color? backgroundHover;
}

Color? _fromComponent(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required List<String> keys,
  required String appearance,
}) {
  return resolveButtonPaintFromComponentKeys(
    context,
    ds,
    keys: keys,
    appearance: appearance,
  );
}

Color? _fromRoleToken(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required String token,
  required String appearance,
}) {
  return resolveButtonTokenColor(
    context,
    ds,
    token,
    appearance: appearance,
  );
}

Color _roleHex(Map<String, String> map, String key) {
  return oneUiHexColor(map[key]!);
}

double _strokeM(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
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

SelectableIconButtonPaint resolveSelectableIconButtonPaint(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required bool selected,
  required OneUiSelectableIconButtonAttention attention,
  required String appearance,
  required bool contained,
}) {
  final role = OneUiSurfaceScope.tokensForAppearance(context, appearance);
  final roleLabel = oneUiAppearanceCssLabel(appearance);
  final strokeM = _strokeM(context, ds);

  final mediumText = _fromComponent(context, ds,
          keys: ['--SelectableIconButton-iconColor'], appearance: appearance) ??
      _roleHex(role.content, 'medium');
  final strokeLow = _fromComponent(context, ds,
          keys: ['--SelectableIconButton-borderColor'], appearance: appearance) ??
      _roleHex(role.content, 'strokeLow');
  final tintedA11y = _roleHex(role.content, 'tintedA11y');
  final bold = _roleHex(role.surfaces, kSurfaceBold);
  final boldHigh = _fromRoleToken(context, ds,
          token: '--$roleLabel-Bold-TintedA11y',
          appearance: appearance) ??
      oneUiHexColor(
          role.onBoldContent['tintedA11y'] ?? role.onBoldContent['high']!);
  final subtle = _roleHex(role.surfaces, kSurfaceSubtle);
  final hover = _fromComponent(context, ds,
          keys: ['--SelectableIconButton-backgroundColor-hover'],
          appearance: appearance) ??
      _roleHex(role.states, 'hover');
  final boldHover = _fromRoleToken(context, ds,
          token: '--$roleLabel-Bold-Hover', appearance: appearance) ??
      _roleHex(role.states, 'boldHover');
  final subtleHover = _fromRoleToken(context, ds,
          token: '--$roleLabel-Subtle-Hover', appearance: appearance) ??
      _roleHex(role.states, 'subtleHover');

  if (!contained) {
    if (!selected) {
      return SelectableIconButtonPaint(
        background: const Color(0x00000000),
        foreground: mediumText,
        backgroundHover: hover,
      );
    }
    return switch (attention) {
      OneUiSelectableIconButtonAttention.high => SelectableIconButtonPaint(
          background: const Color(0x00000000),
          foreground: _fromComponent(context, ds,
                  keys: ['--SelectableIconButton-iconColor-selected-high'],
                  appearance: appearance) ??
              bold,
          backgroundHover: hover,
        ),
      OneUiSelectableIconButtonAttention.medium ||
      OneUiSelectableIconButtonAttention.low =>
        SelectableIconButtonPaint(
          background: const Color(0x00000000),
          foreground: _fromComponent(
                context,
                ds,
                keys: [
                  '--SelectableIconButton-iconColor-selected-${attention == OneUiSelectableIconButtonAttention.medium ? 'medium' : 'low'}',
                ],
                appearance: appearance,
              ) ??
              tintedA11y,
          backgroundHover: hover,
        ),
    };
  }

  if (!selected) {
    return SelectableIconButtonPaint(
      background: const Color(0x00000000),
      foreground: mediumText,
      borderColor: strokeLow,
      borderWidth: strokeM,
      backgroundHover: hover,
    );
  }

  return switch (attention) {
    OneUiSelectableIconButtonAttention.high => SelectableIconButtonPaint(
        background: _fromComponent(context, ds,
                keys: ['--SelectableIconButton-backgroundColor-selected-high'],
                appearance: appearance) ??
            bold,
        foreground: _fromComponent(context, ds,
                keys: ['--SelectableIconButton-iconColor-selected-high'],
                appearance: appearance) ??
            boldHigh,
        backgroundHover: _fromComponent(
              context,
              ds,
              keys: ['--SelectableIconButton-backgroundColor-selected-high-hover'],
              appearance: appearance,
            ) ??
            boldHover,
      ),
    OneUiSelectableIconButtonAttention.medium => SelectableIconButtonPaint(
        background: _fromComponent(context, ds,
                keys: ['--SelectableIconButton-backgroundColor-selected-medium'],
                appearance: appearance) ??
            subtle,
        foreground: _fromComponent(context, ds,
                keys: ['--SelectableIconButton-iconColor-selected-medium'],
                appearance: appearance) ??
            tintedA11y,
        backgroundHover: _fromComponent(
              context,
              ds,
              keys: [
                '--SelectableIconButton-backgroundColor-selected-medium-hover',
              ],
              appearance: appearance,
            ) ??
            subtleHover,
      ),
    OneUiSelectableIconButtonAttention.low => SelectableIconButtonPaint(
        background: const Color(0x00000000),
        foreground: _fromComponent(context, ds,
                keys: ['--SelectableIconButton-iconColor-selected-low'],
                appearance: appearance) ??
            tintedA11y,
        borderColor: _fromComponent(context, ds,
                keys: ['--SelectableIconButton-borderColor-selected-low'],
                appearance: appearance) ??
            bold,
        borderWidth: strokeM,
        backgroundHover: _fromComponent(
              context,
              ds,
              keys: ['--SelectableIconButton-backgroundColor-selected-low-hover'],
              appearance: appearance,
            ) ??
            hover,
      ),
  };
}

Color resolveSelectableIconButtonFill(
  SelectableIconButtonPaint paint, {
  required bool hovered,
  double pressT = 0,
}) {
  if (pressT > 0 && paint.backgroundHover != null) {
    return Color.lerp(paint.background, paint.backgroundHover!, pressT)!;
  }
  if (hovered && paint.backgroundHover != null) {
    return paint.backgroundHover!;
  }
  return paint.background;
}
