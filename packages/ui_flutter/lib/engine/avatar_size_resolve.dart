import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/dimension_scale.dart';
import 'badge_slot_context.dart';
import 'native_design_system_payload.dart';

class AvatarResolvedMetrics {
  const AvatarResolvedMetrics({
    required this.containerPx,
    required this.iconPx,
    this.textStyle,
  });

  final double containerPx;
  final double iconPx;
  final TextStyle? textStyle;
}

const Map<String, (String container, String icon)> _kSpacingFallback = {
  '2xs': ('2', '2'),
  'xs': ('3', '2-5'),
  's': ('4', '3'),
  'm': ('5', '4'),
  'l': ('6', '5'),
  'xl': ('8', '6'),
  '2xl': ('10', '8'),
};

const Map<String, String> _kLabelSizeKey = {
  's': '3XS',
  'm': '2XS',
  'l': 'XS',
  'xl': 'S',
  '2xl': 'M',
  'custom': 'L',
};

double _spacingPx(BuildContext context, String tail) {
  final scope = OneUiScope.of(context);
  return getSpacingTokenPx(
    spacingName: tail,
    platform: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
  );
}

double? _resolveLength(
  BuildContext context,
  NativeDesignSystemPayload ds,
  List<String> keys,
  String fallbackSpacing,
) {
  final scope = OneUiScope.of(context);
  final typo = OneUiScope.nativeTypographyOf(context);
  final px = ds.resolveComponentLengthPxCascade(
    keys,
    platformId: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
    nativeTypography: typo,
  );
  if (px != null) return px;
  return _spacingPx(context, fallbackSpacing);
}

AvatarResolvedMetrics? resolveAvatarMetrics(
  BuildContext context, {
  required String size,
  double? customSize,
}) {
  final badgeSlot = BadgeSlotSizeScope.maybeOf(context);
  if (badgeSlot != null && size == 'm') {
    size = badgeSlot.avatarSize;
  }

  final ds = OneUiScope.designSystemOf(context);
  if (ds == null) return null;

  if (size == 'custom') {
    final side = customSize ?? _spacingPx(context, '5');
    final iconSide =
        (customSize != null) ? customSize * 2 / 3 : _spacingPx(context, '10');
    final typo = _textStyleForSize(context, 'custom');
    return AvatarResolvedMetrics(
      containerPx: side,
      iconPx: iconSide,
      textStyle: typo,
    );
  }

  final fb = _kSpacingFallback[size] ?? _kSpacingFallback['m']!;
  final container = _resolveLength(
    context,
    ds,
    ['--Avatar-size-$size', '--Avatar-size-m'],
    fb.$1,
  );
  if (container == null) return null;

  double iconPx;
  if (size == '2xs') {
    iconPx = container;
  } else {
    iconPx = _resolveLength(
          context,
          ds,
          ['--Avatar-iconSize-$size', '--Avatar-iconSize-m', '--Avatar-iconSize'],
          fb.$2,
        ) ??
        _spacingPx(context, fb.$2);
  }

  return AvatarResolvedMetrics(
    containerPx: container,
    iconPx: iconPx,
    textStyle: _textStyleForSize(context, size),
  );
}

TextStyle? _textStyleForSize(BuildContext context, String size) {
  final labelKey = _kLabelSizeKey[size];
  if (labelKey == null) return null;
  final typo = OneUiScope.nativeTypographyOf(context);
  if (typo == null) return null;
  final style = typo.emphasisStyle('label', labelKey, emphasis: 'medium');
  if (style == null) return null;
  return style.copyWith(height: 1);
}

/// Pill radius for a square [containerPx] when brand shape tokens do not resolve.
double avatarBorderRadiusFallbackPx(double containerPx) => containerPx / 2;

double resolveAvatarBorderRadiusPx(
  BuildContext context, {
  required double containerPx,
}) {
  final scope = OneUiScope.of(context);
  final ds = OneUiScope.designSystemOf(context);
  if (ds != null) {
    final resolved = ds.resolveComponentLengthPxCascade(
      ['--Avatar-borderRadius', '--Shape-Pill'],
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      nativeTypography: OneUiScope.nativeTypographyOf(context),
    );
    if (resolved != null) return resolved;
  }
  return avatarBorderRadiusFallbackPx(containerPx);
}
