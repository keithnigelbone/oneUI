import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../theme/surface_scope.dart';
import '../utils/one_ui_hex_color.dart';
import '../widgets/one_ui_selectable_single_text_button_types.dart';
import 'button_color_resolve.dart';
import 'native_design_system_payload.dart';
import 'surface_engine.dart';

/// Resolved fill / label / border — `SelectableSingleTextButton.module.css`.
class SelectableSingleTextButtonResolvedPaint {
  const SelectableSingleTextButtonResolvedPaint({
    required this.background,
    required this.foreground,
    required this.borderColor,
    required this.borderWidth,
    required this.backgroundHover,
    required this.backgroundPressed,
  });

  final Color background;
  final Color foreground;
  final Color borderColor;
  final double borderWidth;
  final Color backgroundHover;
  final Color backgroundPressed;
}

FlatRoleTokens _role(BuildContext context, String appearance) =>
    OneUiSurfaceScope.tokensForAppearance(context, appearance);

bool _useRoleSlots(String appearance) => appearance == 'primary';

List<String> _keys(List<String> keys, String appearance) {
  if (_useRoleSlots(appearance)) return keys;
  return keys.where((k) => !k.contains('-role')).toList(growable: false);
}

Color? _fromPaint(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required List<String> keys,
  required String appearance,
}) =>
    resolveButtonPaintFromComponentKeys(
      context,
      ds,
      keys: _keys(keys, appearance),
      appearance: appearance,
    );

Color _roleSuffix(
  BuildContext context,
  NativeDesignSystemPayload ds,
  FlatRoleTokens role,
  String suffix,
  String appearance,
) {
  final label = oneUiAppearanceCssLabel(appearance);
  return _fromPaint(
        context,
        ds,
        keys: ['--SelectableSingleTextButton-role$suffix'],
        appearance: appearance,
      ) ??
      resolveButtonTokenColor(
        context,
        ds,
        '--$label-$suffix',
        appearance: appearance,
      ) ??
      colorFromRoleTokenSuffix(role, suffix) ??
      oneUiHexColor(
        switch (suffix) {
          'Bold' || 'BoldHigh' || 'BoldHover' || 'Bold-High' ||
          'Bold-TintedA11y' =>
            role.surfaces[kSurfaceBold]!,
          'Subtle' || 'SubtleHover' || 'Subtle-Hover' =>
            role.surfaces[kSurfaceSubtle]!,
          'Hover' => role.states['hover'] ?? role.surfaces[kSurfaceMinimal]!,
          'MediumText' || 'Medium-Text' => role.content['medium']!,
          'StrokeLow' || 'Stroke-Low' => role.content['strokeLow']!,
          _ => role.content['tintedA11y'] ?? role.content['high']!,
        },
      );
}

double _hairline(
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

SelectableSingleTextButtonResolvedPaint resolveSelectableSingleTextButtonPaint(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required bool selected,
  required OneUiSelectableSingleTextButtonAttention attention,
  required String appearance,
}) {
  final role = _role(context, appearance);
  final roleLabel = oneUiAppearanceCssLabel(appearance);
  final hw = _hairline(context, ds);

  if (!selected) {
    final hover = _fromPaint(
          context,
          ds,
          keys: [
            '--SelectableSingleTextButton-backgroundColor-hover',
            '--SelectableSingleTextButton-roleHover',
          ],
          appearance: appearance,
        ) ??
        resolveButtonTokenColor(
          context,
          ds,
          '--$roleLabel-Hover',
          appearance: appearance,
        ) ??
        oneUiHexColor(role.states['hover'] ?? role.surfaces[kSurfaceMinimal]!);

    return SelectableSingleTextButtonResolvedPaint(
      background: _fromPaint(
            context,
            ds,
            keys: ['--SelectableSingleTextButton-backgroundColor'],
            appearance: appearance,
          ) ??
          const Color(0x00000000),
      foreground: _fromPaint(
            context,
            ds,
            keys: [
              '--SelectableSingleTextButton-textColor',
              '--SelectableSingleTextButton-roleMediumText',
            ],
            appearance: appearance,
          ) ??
          resolveButtonTokenColor(
            context,
            ds,
            '--$roleLabel-Medium-Text',
            appearance: appearance,
          ) ??
          oneUiHexColor(role.content['medium']!),
      borderColor: _fromPaint(
            context,
            ds,
            keys: [
              '--SelectableSingleTextButton-borderColor',
              '--SelectableSingleTextButton-roleStrokeLow',
            ],
            appearance: appearance,
          ) ??
          resolveButtonTokenColor(
            context,
            ds,
            '--$roleLabel-Stroke-Low',
            appearance: appearance,
          ) ??
          oneUiHexColor(role.content['strokeLow']!),
      borderWidth: hw,
      backgroundHover: hover,
      backgroundPressed: hover,
    );
  }

  switch (attention) {
    case OneUiSelectableSingleTextButtonAttention.high:
      final bold = _fromPaint(
            context,
            ds,
            keys: [
              '--SelectableSingleTextButton-backgroundColor-selected-high',
              '--SelectableSingleTextButton-roleMaterialFill',
              '--SelectableSingleTextButton-roleBold',
            ],
            appearance: appearance,
          ) ??
          _roleSuffix(context, ds, role, 'Bold', appearance);
      final boldHigh = _fromPaint(
            context,
            ds,
            keys: [
              '--SelectableSingleTextButton-textColor-selected-high',
              '--SelectableSingleTextButton-roleMaterialText',
              '--SelectableSingleTextButton-roleBoldHigh',
            ],
            appearance: appearance,
          ) ??
          resolveButtonTokenColor(
            context,
            ds,
            '--$roleLabel-Bold-High',
            appearance: appearance,
          ) ??
          resolveButtonTokenColor(
            context,
            ds,
            '--$roleLabel-Bold-TintedA11y',
            appearance: appearance,
          ) ??
          oneUiHexColor(
            role.onBoldContent['high'] ??
                role.onBoldContent['tintedA11y']!,
          );
      final boldHover = _fromPaint(
            context,
            ds,
            keys: [
              '--SelectableSingleTextButton-backgroundColor-selected-high-hover',
              '--SelectableSingleTextButton-roleBoldHover',
            ],
            appearance: appearance,
          ) ??
          _roleSuffix(context, ds, role, 'BoldHover', appearance);
      return SelectableSingleTextButtonResolvedPaint(
        background: bold,
        foreground: boldHigh,
        borderColor: const Color(0x00000000),
        borderWidth: 0,
        backgroundHover: boldHover,
        backgroundPressed: boldHover,
      );

    case OneUiSelectableSingleTextButtonAttention.medium:
      final subtle = _fromPaint(
            context,
            ds,
            keys: [
              '--SelectableSingleTextButton-backgroundColor-selected-medium',
              '--SelectableSingleTextButton-roleSubtle',
            ],
            appearance: appearance,
          ) ??
          _roleSuffix(context, ds, role, 'Subtle', appearance);
      final accent = _fromPaint(
            context,
            ds,
            keys: [
              '--SelectableSingleTextButton-textColor-selected-medium',
              '--SelectableSingleTextButton-roleTintedA11y',
            ],
            appearance: appearance,
          ) ??
          _roleSuffix(context, ds, role, 'TintedA11y', appearance);
      final subtleHover = _fromPaint(
            context,
            ds,
            keys: [
              '--SelectableSingleTextButton-backgroundColor-selected-medium-hover',
              '--SelectableSingleTextButton-roleSubtleHover',
            ],
            appearance: appearance,
          ) ??
          resolveButtonTokenColor(
            context,
            ds,
            '--$roleLabel-Subtle-Hover',
            appearance: appearance,
          ) ??
          oneUiHexColor(
            role.states['subtleHover'] ?? role.surfaces[kSurfaceSubtle]!,
          );
      return SelectableSingleTextButtonResolvedPaint(
        background: subtle,
        foreground: accent,
        borderColor: const Color(0x00000000),
        borderWidth: 0,
        backgroundHover: subtleHover,
        backgroundPressed: subtleHover,
      );

    case OneUiSelectableSingleTextButtonAttention.low:
      final accentLow = _fromPaint(
            context,
            ds,
            keys: [
              '--SelectableSingleTextButton-textColor-selected-low',
              '--SelectableSingleTextButton-roleTintedA11y',
            ],
            appearance: appearance,
          ) ??
          _roleSuffix(context, ds, role, 'TintedA11y', appearance);
      final borderBold = _fromPaint(
            context,
            ds,
            keys: [
              '--SelectableSingleTextButton-borderColor-selected-low',
              '--SelectableSingleTextButton-roleBold',
            ],
            appearance: appearance,
          ) ??
          _roleSuffix(context, ds, role, 'Bold', appearance);
      final ghostHover = _fromPaint(
            context,
            ds,
            keys: [
              '--SelectableSingleTextButton-backgroundColor-selected-low-hover',
              '--SelectableSingleTextButton-roleHover',
            ],
            appearance: appearance,
          ) ??
          resolveButtonTokenColor(
            context,
            ds,
            '--$roleLabel-Hover',
            appearance: appearance,
          ) ??
          oneUiHexColor(
            role.states['hover'] ?? role.surfaces[kSurfaceMinimal]!,
          );
      return SelectableSingleTextButtonResolvedPaint(
        background: const Color(0x00000000),
        foreground: accentLow,
        borderColor: borderBold,
        borderWidth: hw,
        backgroundHover: ghostHover,
        backgroundPressed: ghostHover,
      );
  }
}

Color resolveSelectableSingleTextButtonFill(
  SelectableSingleTextButtonResolvedPaint paint, {
  required bool hovered,
  double pressT = 0,
}) {
  if (pressT > 0) {
    return Color.lerp(paint.background, paint.backgroundPressed, pressT)!;
  }
  if (hovered) return paint.backgroundHover;
  return paint.background;
}
