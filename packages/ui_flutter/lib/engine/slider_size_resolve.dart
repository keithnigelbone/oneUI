import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import 'native_design_system_payload.dart';
import '../widgets/one_ui_slider_types.dart';

/// Per-size spacing token keys — `m` matches React `Slider.tokens.ts`;
/// `s` / `l` align with RN `SLIDER_SIZES`.
class _SliderSizeSpacingKeys {
  const _SliderSizeSpacingKeys({
    required this.trackOutside,
    required this.trackInside,
    required this.knobOutside,
    required this.knobOutsideGrown,
    required this.knobInside,
    required this.knobInsideGrown,
  });

  final String trackOutside;
  final String trackInside;
  final String knobOutside;
  final String knobOutsideGrown;
  final String knobInside;
  final String knobInsideGrown;
}

const Map<String, _SliderSizeSpacingKeys> kOneUiSliderSizeSpacingKeys = {
  's': _SliderSizeSpacingKeys(
    trackOutside: '1',
    trackInside: '2',
    knobOutside: '2',
    knobOutsideGrown: '3',
    knobInside: '1-5',
    knobInsideGrown: '1',
  ),
  'm': _SliderSizeSpacingKeys(
    trackOutside: '1',
    trackInside: '3',
    knobOutside: '4',
    knobOutsideGrown: '4-5',
    knobInside: '1',
    knobInsideGrown: '2',
  ),
  'l': _SliderSizeSpacingKeys(
    trackOutside: '1-5',
    trackInside: '4',
    knobOutside: '5',
    knobOutsideGrown: '6',
    knobInside: '1-5',
    knobInsideGrown: '2-5',
  ),
};

class SliderResolvedLayout {
  const SliderResolvedLayout({
    required this.containerHeightPx,
    required this.containerWidthPx,
    required this.verticalHeightPx,
    required this.trackHeightOutsidePx,
    required this.trackHeightInsidePx,
    required this.hitTargetPx,
    required this.knobOutsidePx,
    required this.knobOutsideGrownPx,
    required this.knobInsidePx,
    required this.knobInsideGrownPx,
    required this.slotGapPx,
    required this.slotSizePx,
    required this.trackBorderRadiusPx,
    required this.tickOutsidePx,
    required this.tickInsidePx,
  });

  final double containerHeightPx;
  final double containerWidthPx;
  final double verticalHeightPx;
  final double trackHeightOutsidePx;
  final double trackHeightInsidePx;
  final double hitTargetPx;
  final double knobOutsidePx;
  final double knobOutsideGrownPx;
  final double knobInsidePx;
  final double knobInsideGrownPx;
  final double slotGapPx;
  final double slotSizePx;
  final double trackBorderRadiusPx;
  final double tickOutsidePx;
  final double tickInsidePx;

  double trackHeightFor(String knobStyle) =>
      knobStyle == 'inside' ? trackHeightInsidePx : trackHeightOutsidePx;

  double knobIdleFor(String knobStyle) =>
      knobStyle == 'inside' ? knobInsidePx : knobOutsidePx;

  double knobScaleFor(String knobStyle) {
    if (knobStyle == 'inside') {
      return knobInsideGrownPx / knobInsidePx;
    }
    return knobOutsideGrownPx / knobOutsidePx;
  }

  double tickSizeFor(String knobStyle) =>
      knobStyle == 'inside' ? tickInsidePx : tickOutsidePx;
}

SliderResolvedLayout resolveSliderLayout(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  String size = 'm',
}) {
  final effectiveSize = kOneUiSliderSizes.contains(size) ? size : 'm';
  final preset =
      kOneUiSliderSizeSpacingKeys[effectiveSize] ?? kOneUiSliderSizeSpacingKeys['m']!;
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

  double spacing(String name) => resolveSpacingPx(
        designSystem: ds,
        platformsConfig: pc,
        platformId: plat,
        density: den,
        spacingName: name,
      );

  /// Size-specific brand token → generic m token → spacing preset.
  double dim(String sizeKey, String genericKey, String fallbackSpacing) {
    final sized = px(['--Slider-$genericKey-$sizeKey']);
    if (sized != null) return sized;
    if (sizeKey == 'm') {
      final generic = px(['--Slider-$genericKey']);
      if (generic != null) return generic;
    }
    return px(['--Spacing-$fallbackSpacing']) ?? spacing(fallbackSpacing);
  }

  final containerHeight = px(['--Slider-height', '--Spacing-4-5']) ?? spacing('4-5');
  final verticalHeight = px(['--Spacing-40']) ?? spacing('40');
  const containerWidth = 328.0;

  return SliderResolvedLayout(
    containerHeightPx: containerHeight,
    containerWidthPx: containerWidth,
    verticalHeightPx: verticalHeight,
    trackHeightOutsidePx: dim(effectiveSize, 'trackHeight-outside', preset.trackOutside),
    trackHeightInsidePx: dim(effectiveSize, 'trackHeight-inside', preset.trackInside),
    // Platform minimum touch target — constant across s/m/l per WCAG (visual knob
    // shrinks but hit area stays at least Spacing-12).
    hitTargetPx: px(['--Slider-hitTarget', '--Spacing-12']) ?? spacing('12'),
    knobOutsidePx: dim(effectiveSize, 'knobSize-outside', preset.knobOutside),
    knobOutsideGrownPx: dim(
      effectiveSize,
      'knobSize-outside-grown',
      preset.knobOutsideGrown,
    ),
    knobInsidePx: dim(effectiveSize, 'knobSize-inside', preset.knobInside),
    knobInsideGrownPx: dim(
      effectiveSize,
      'knobSize-inside-grown',
      preset.knobInsideGrown,
    ),
    slotGapPx: px(['--Slider-slotGap', '--Spacing-2']) ?? spacing('2'),
    slotSizePx: px(['--Slider-slotSize', '--Spacing-9']) ?? spacing('9'),
    trackBorderRadiusPx: px(['--Slider-trackBorderRadius', '--Shape-Pill']) ??
        containerHeight / 2,
    tickOutsidePx: px(['--Slider-tickSize-outside', '--Stroke-XL']) ?? 2,
    tickInsidePx: px(['--Slider-tickSize-inside', '--Spacing-1']) ?? spacing('1'),
  );
}
