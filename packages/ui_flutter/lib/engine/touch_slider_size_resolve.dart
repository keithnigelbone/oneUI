import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import 'native_design_system_payload.dart';

class TouchSliderResolvedLayout {
  const TouchSliderResolvedLayout({
    required this.thicknessPx,
    required this.trackLengthPx,
    required this.borderRadiusPx,
    required this.slotSizePx,
  });

  final double thicknessPx;
  final double trackLengthPx;
  final double borderRadiusPx;
  final double slotSizePx;
}

TouchSliderResolvedLayout resolveTouchSliderLayout(
  BuildContext context,
  NativeDesignSystemPayload ds,
) {
  final scope = OneUiScope.of(context);
  final plat = scope.platformId;
  final den = scope.density;
  final pc = scope.platformsFoundationConfig;
  final typo = OneUiScope.nativeTypographyOf(context);

  double? px(Iterable<String> keys) => ds.resolveComponentLengthPxCascade(
        keys,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );

  final thickness = px([
        '--TouchSlider-thickness',
        '--Spacing-9',
      ]) ??
      resolveSpacingPx(
        designSystem: ds,
        platformsConfig: pc,
        platformId: plat,
        density: den,
        spacingName: '9',
      );

  final trackLength = px([
        '--TouchSlider-width',
        '--Dimension-f14',
      ]) ??
      resolveFStepPx(
        designSystem: ds,
        platformsConfig: pc,
        platformId: plat,
        density: den,
        step: 'f14',
      );

  final borderRadius = px([
        '--TouchSlider-borderRadius',
        '--Shape-Pill',
      ]) ??
      thickness / 2;

  final slotSize = px([
        '--TouchSlider-slotSize',
        '--Spacing-4-5',
      ]) ??
      resolveSpacingPx(
        designSystem: ds,
        platformsConfig: pc,
        platformId: plat,
        density: den,
        spacingName: '4-5',
      );

  return TouchSliderResolvedLayout(
    thicknessPx: thickness,
    trackLengthPx: trackLength,
    borderRadiusPx: borderRadius,
    slotSizePx: slotSize,
  );
}
