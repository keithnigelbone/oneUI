import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/platform_foundation_config.dart';
import 'native_design_system_payload.dart';
import 'native_typography_snapshot.dart';

/// Geometry for the bordered Input shell — `Input.module.css` `[data-size]`.
class InputSizeMetrics {
  const InputSizeMetrics({
    required this.minHeight,
    required this.paddingHorizontal,
    required this.paddingVertical,
    required this.gap,
    required this.borderRadius,
    required this.iconSize,
    required this.bodySizeKey,
  });

  final double minHeight;
  final double paddingHorizontal;
  final double paddingVertical;
  final double gap;
  final double borderRadius;
  final double iconSize;
  final String bodySizeKey;
}

const Map<
    int,
    ({
      String height,
      String padH,
      String padV,
      String gap,
      String radius,
      String icon,
      String body
    })> _kInputSizeFallbacks = {
  6: (
    height: '6',
    padH: '1-5',
    padV: '0',
    gap: '1',
    radius: 'xs',
    icon: '3',
    body: 'S',
  ),
  8: (
    height: '8',
    padH: '2',
    padV: '0',
    gap: '1-5',
    radius: '2',
    icon: '4',
    body: 'S',
  ),
  10: (
    height: '10',
    padH: '3',
    padV: '1-5',
    gap: '1-5',
    radius: '2',
    icon: '5',
    body: 'M',
  ),
  12: (
    height: '12',
    padH: '4',
    padV: '2',
    gap: '2',
    radius: '3',
    icon: '6',
    body: 'L',
  ),
};

double? _spacingPx(
  NativeDesignSystemPayload ds, {
  required String tail,
  required String platformId,
  required String density,
  required PlatformsFoundationConfig? platformsConfig,
  required NativeTypographySnapshot? nativeTypography,
  List<String>? gaps,
}) {
  return ds.resolveComponentLengthPxCascade(
    ['--Spacing-$tail'],
    gaps: gaps,
    platformId: platformId,
    density: density,
    platformsConfig: platformsConfig,
    nativeTypography: nativeTypography,
  );
}

InputSizeMetrics? resolveInputSizeMetrics(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required int numericSize,
  required bool pillShape,
  List<String>? gaps,
}) {
  final row = _kInputSizeFallbacks[numericSize];
  if (row == null) return null;

  final scope = OneUiScope.of(context);
  final plat = scope.platformId;
  final den = scope.density;
  final pc = scope.platformsFoundationConfig;
  final typo = OneUiScope.nativeTypographyOf(context);
  final sz = '$numericSize';

  /// Brand-resolved px when the token chain resolves (including **0** for `Shape-0`).
  /// Returns null only when the cascade is missing — then [spacingFallback] applies.
  double? brandPxForKeys(List<String> keys) {
    final fromBrand = ds.resolveComponentLengthPxCascade(
      keys,
      gaps: gaps,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    );
    if (fromBrand != null) return fromBrand;
    return null;
  }

  double pxForKeys(List<String> keys, {required String spacingFallback}) {
    return brandPxForKeys(keys) ??
        _spacingPx(
          ds,
          tail: spacingFallback,
          platformId: plat,
          density: den,
          platformsConfig: pc,
          nativeTypography: typo,
          gaps: gaps,
        ) ??
        0;
  }

  double shapePx(String shapeTail) {
    return brandPxForKeys(['--Shape-$shapeTail']) ?? 0;
  }

  final radiusKeys = pillShape
      ? ['--Input-borderRadius-pill', '--Shape-Pill']
      : [
          '--Input-borderRadius-$sz',
          '--Input-borderRadius',
          '--Shape-${row.radius}',
        ];
  final brandRadius = brandPxForKeys(radiusKeys);
  final borderRadius =
      pillShape ? (brandRadius ?? 9999) : (brandRadius ?? shapePx(row.radius));

  return InputSizeMetrics(
    minHeight: pxForKeys(
      ['--Input-height-$sz', '--Input-height', '--Spacing-${row.height}'],
      spacingFallback: row.height,
    ),
    paddingHorizontal: pxForKeys(
      [
        '--Input-paddingHorizontal-$sz',
        '--Input-paddingHorizontal',
        '--Spacing-${row.padH}'
      ],
      spacingFallback: row.padH,
    ),
    paddingVertical: pxForKeys(
      [
        '--Input-paddingVertical-$sz',
        '--Input-paddingVertical',
        '--Spacing-${row.padV}'
      ],
      spacingFallback: row.padV,
    ),
    gap: pxForKeys(['--Input-slotGap', '--Spacing-${row.gap}'],
        spacingFallback: row.gap),
    borderRadius: borderRadius,
    iconSize: pxForKeys(
      ['--Input-iconSize-$sz', '--Input-iconSize', '--Spacing-${row.icon}'],
      spacingFallback: row.icon,
    ),
    bodySizeKey: row.body,
  );
}

InputBorderWidths resolveInputBorderWidths(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  List<String>? gaps,
}) {
  final scope = OneUiScope.of(context);
  final plat = scope.platformId;
  final den = scope.density;
  final pc = scope.platformsFoundationConfig;
  final typo = OneUiScope.nativeTypographyOf(context);

  double px(List<String> keys, double fallback) {
    return ds.resolveComponentLengthPxCascade(
          keys,
          gaps: gaps,
          platformId: plat,
          density: den,
          platformsConfig: pc,
          nativeTypography: typo,
        ) ??
        fallback;
  }

  return InputBorderWidths(
    idle: px(['--Input-borderWidth', '--Stroke-M'], 1),
    focus: px(['--Input-borderWidthFocus', '--Spacing-0-5'], 2),
    disabledOpacity: _parseOpacity(
      ds.rawComponentCascade(['--Input-disabledOpacity']),
      fallback: 0.4,
    ),
    rootStackGap: px(['--Input-rootStackGap', '--Spacing-1-5'], 6),
  );
}

class InputBorderWidths {
  const InputBorderWidths({
    required this.idle,
    required this.focus,
    required this.disabledOpacity,
    required this.rootStackGap,
  });

  final double idle;
  final double focus;
  final double disabledOpacity;
  final double rootStackGap;
}

double _parseOpacity(String? raw, {required double fallback}) {
  if (raw == null) return fallback;
  final n = double.tryParse(raw.replaceAll(RegExp(r'[^0-9.]'), ''));
  return (n ?? fallback).clamp(0, 1);
}
