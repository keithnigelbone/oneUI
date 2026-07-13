import 'package:flutter/material.dart';

import '../tokens/platform_foundation_config.dart';
import 'native_design_system_payload.dart';
import 'native_typography_snapshot.dart';

/// Circular label metrics — `SelectableSingleTextButton.module.css` `[data-size]`.
class SelectableSingleTextButtonSizeMetrics {
  const SelectableSingleTextButtonSizeMetrics({
    required this.minSizePx,
    required this.paddingPx,
    required this.fontSizePx,
    required this.lineHeightPx,
    required this.fontWeight,
  });

  final double minSizePx;
  final double paddingPx;
  final double fontSizePx;
  final double lineHeightPx;
  final FontWeight fontWeight;
}

const Map<String, ({String height, String padding, String condensedHeight})>
    _kSizeSpacingFallbacks = {
  's': (height: '8', padding: '0-5', condensedHeight: '4-5'),
  'm': (height: '10', padding: '1', condensedHeight: '6'),
  'l': (height: '12', padding: '2', condensedHeight: '8'),
};

double? _spacingPx(
  NativeDesignSystemPayload ds, {
  required String spacingTail,
  required String platformId,
  required String density,
  required PlatformsFoundationConfig? platformsConfig,
  required NativeTypographySnapshot? nativeTypography,
  List<String>? gaps,
}) {
  return ds.resolveComponentLengthPxCascade(
    ['--Spacing-$spacingTail', '--Spacing-M'],
    gaps: gaps,
    platformId: platformId,
    density: density,
    platformsConfig: platformsConfig,
    nativeTypography: nativeTypography,
  );
}

double? _componentLength(
  NativeDesignSystemPayload ds, {
  required List<String> keys,
  required String platformId,
  required String density,
  required PlatformsFoundationConfig? platformsConfig,
  required NativeTypographySnapshot? nativeTypography,
  List<String>? gaps,
}) {
  return ds.resolveComponentLengthPxCascade(
    keys,
    gaps: gaps,
    platformId: platformId,
    density: density,
    platformsConfig: platformsConfig,
    nativeTypography: nativeTypography,
  );
}

FontWeight _resolveFontWeight(
  NativeDesignSystemPayload ds, {
  required String platformId,
  required String density,
  required PlatformsFoundationConfig? platformsConfig,
  required NativeTypographySnapshot? nativeTypography,
}) {
  final raw = ds.resolveCSSValue(
    ds.rawComponentCascade(['--SelectableSingleTextButton-fontWeight']) ??
        'var(--Label-FontWeight-High)',
    platformId: platformId,
    density: density,
    platformsConfig: platformsConfig,
    nativeTypography: nativeTypography,
  );
  final w = double.tryParse(raw ?? '');
  if (w == null) return FontWeight.w700;
  if (w >= 700) return FontWeight.w700;
  if (w >= 600) return FontWeight.w600;
  if (w >= 500) return FontWeight.w500;
  return FontWeight.w400;
}

SelectableSingleTextButtonSizeMetrics? resolveSelectableSingleTextButtonSizeMetrics(
  NativeDesignSystemPayload ds, {
  required String size,
  required bool condensed,
  required String platformId,
  required String density,
  required PlatformsFoundationConfig? platformsConfig,
  required NativeTypographySnapshot? nativeTypography,
  List<String>? gaps,
}) {
  final sz = size.trim().toLowerCase();
  final fb = _kSizeSpacingFallbacks[sz];
  if (fb == null) return null;

  final minSize = _componentLength(
        ds,
        keys: condensed
            ? [
                '--SelectableSingleTextButton-minHeight-$sz-condensed',
                '--SelectableSingleTextButton-height-$sz-condensed',
              ]
            : [
                '--SelectableSingleTextButton-minHeight-$sz',
                '--SelectableSingleTextButton-height-$sz',
                '--SelectableSingleTextButton-height',
              ],
        platformId: platformId,
        density: density,
        platformsConfig: platformsConfig,
        nativeTypography: nativeTypography,
      ) ??
      _spacingPx(
        ds,
        spacingTail: condensed ? fb.condensedHeight : fb.height,
        platformId: platformId,
        density: density,
        platformsConfig: platformsConfig,
        nativeTypography: nativeTypography,
      );

  final padding = _componentLength(
        ds,
        keys: condensed
            ? [
                '--SelectableSingleTextButton-padding-$sz-condensed',
                '--SelectableSingleTextButton-padding-$sz',
              ]
            : [
                '--SelectableSingleTextButton-padding-$sz',
              ],
        platformId: platformId,
        density: density,
        platformsConfig: platformsConfig,
        nativeTypography: nativeTypography,
      ) ??
      _spacingPx(
        ds,
        spacingTail: condensed ? '0-5' : fb.padding,
        platformId: platformId,
        density: density,
        platformsConfig: platformsConfig,
        nativeTypography: nativeTypography,
      );

  final fontSize = _componentLength(
        ds,
        keys: [
          '--SelectableSingleTextButton-fontSize-$sz',
          '--SelectableSingleTextButton-fontSize',
        ],
        platformId: platformId,
        density: density,
        platformsConfig: platformsConfig,
        nativeTypography: nativeTypography,
        gaps: gaps,
      ) ??
      nativeTypography?.emphasisStyle('label', sz.toUpperCase())?.fontSize;

  final lineHeight = _componentLength(
        ds,
        keys: [
          '--SelectableSingleTextButton-lineHeight-$sz',
          '--SelectableSingleTextButton-lineHeight',
        ],
        platformId: platformId,
        density: density,
        platformsConfig: platformsConfig,
        nativeTypography: nativeTypography,
        gaps: gaps,
      ) ??
      nativeTypography?.emphasisStyle('label', sz.toUpperCase())?.height;

  if (minSize == null || padding == null || fontSize == null || lineHeight == null) {
    return null;
  }

  return SelectableSingleTextButtonSizeMetrics(
    minSizePx: minSize,
    paddingPx: padding,
    fontSizePx: fontSize,
    lineHeightPx: lineHeight,
    fontWeight: _resolveFontWeight(
      ds,
      platformId: platformId,
      density: density,
      platformsConfig: platformsConfig,
      nativeTypography: nativeTypography,
    ),
  );
}
