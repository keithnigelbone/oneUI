import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/platform_foundation_config.dart';
import '../widgets/one_ui_single_text_button_types.dart';
import 'native_design_system_payload.dart';
import 'native_typography_snapshot.dart';
import 'single_text_button_typography_resolve.dart';

/// Container + label typography — `SingleTextButton.module.css` `[data-size]` /
/// `[data-condensed]`.
class SingleTextButtonSizeMetrics {
  const SingleTextButtonSizeMetrics({
    required this.containerPx,
    required this.paddingPx,
    required this.textStyle,
  });

  final double containerPx;
  final double paddingPx;
  final TextStyle textStyle;
}

const Map<String, ({String normal, String condensed, String padding})>
    _kContainerSpacingKeys = {
  's': (normal: '8', condensed: '4-5', padding: '0-5'),
  'm': (normal: '10', condensed: '6', padding: '1'),
  'l': (normal: '12', condensed: '8', padding: '2'),
};

const String _kCondensedPaddingSpacingTail = '0-5';

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

TextStyle? _labelStyle(
  BuildContext context,
  OneUiSingleTextButtonSize size,
) {
  final typo = OneUiScope.nativeTypographyOf(context);
  final labelKey = oneUiSingleTextButtonLabelKey(size);
  return typo?.emphasisStyle('label', labelKey, emphasis: 'high') ??
      Theme.of(context).textTheme.labelMedium;
}

SingleTextButtonSizeMetrics? resolveSingleTextButtonSizeMetrics(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiSingleTextButtonSize size,
  required bool condensed,
  List<String>? gaps,
}) {
  final row = _kContainerSpacingKeys[size];
  if (row == null) return null;

  final scope = OneUiScope.of(context);
  final plat = scope.platformId;
  final den = scope.density;
  final pc = scope.platformsFoundationConfig;
  final typo = OneUiScope.nativeTypographyOf(context);

  final containerKeys = condensed
      ? [
          '--SingleTextButton-minHeight-$size-condensed',
          '--SingleTextButton-height-$size-condensed',
        ]
      : [
          '--SingleTextButton-minHeight-$size',
          '--SingleTextButton-height-$size',
        ];

  final container = ds.resolveComponentLengthPxCascade(
        containerKeys,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      ) ??
      _spacingPx(
        ds,
        spacingTail: condensed ? row.condensed : row.normal,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      );

  if (container == null) {
    gaps?.add(
      'missing SingleTextButton container size for $size condensed=$condensed',
    );
    return null;
  }

  final paddingTail = condensed ? '$size-condensed' : size;
  final paddingKeys = condensed
      ? [
          '--SingleTextButton-padding-$paddingTail',
          '--SingleTextButton-paddingHorizontal-$paddingTail',
        ]
      : [
          '--SingleTextButton-padding-$paddingTail',
          '--SingleTextButton-paddingHorizontal-$paddingTail',
          '--SingleTextButton-padding-$size',
          '--SingleTextButton-paddingHorizontal-$size',
        ];
  final padding = ds.resolveComponentLengthPxCascade(
        paddingKeys,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      ) ??
      _spacingPx(
        ds,
        spacingTail: condensed ? _kCondensedPaddingSpacingTail : row.padding,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
      ) ??
      0;

  final baseStyle = _labelStyle(context, size);
  if (baseStyle == null) return null;

  final fontSize = ds.resolveComponentLengthPxCascade(
    [
      '--SingleTextButton-fontSize-$size',
      '--Label-${oneUiSingleTextButtonLabelKey(size)}-FontSize',
    ],
    gaps: gaps,
    platformId: plat,
    density: den,
    platformsConfig: pc,
    nativeTypography: typo,
  );

  final lineHeight = ds.resolveComponentLengthPxCascade(
    [
      '--SingleTextButton-lineHeight-$size',
      '--Label-${oneUiSingleTextButtonLabelKey(size)}-LineHeight',
    ],
    gaps: gaps,
    platformId: plat,
    density: den,
    platformsConfig: pc,
    nativeTypography: typo,
  );

  final fontFamilyRaw = ds.rawComponentCascade([
    '--SingleTextButton-fontFamily',
    '--Label-FontFamily',
    '--Typography-Font-Primary',
  ]);
  final fontFamily = fontFamilyRaw != null
      ? ds.resolveCSSValue(
          fontFamilyRaw,
          platformId: plat,
          density: den,
          platformsConfig: pc,
          nativeTypography: typo,
        )
      : null;

  final textStyle = applySingleTextButtonTypographyOverrides(
    baseStyle.copyWith(
      fontSize: fontSize ?? baseStyle.fontSize,
      height: lineHeight != null && (baseStyle.fontSize ?? 0) > 0
          ? lineHeight / (fontSize ?? baseStyle.fontSize!)
          : baseStyle.height,
      fontFamily: fontFamily ?? baseStyle.fontFamily,
    ),
    ds,
    platformId: plat,
    density: den,
    platformsConfig: pc,
    nativeTypography: typo,
  );

  return SingleTextButtonSizeMetrics(
    containerPx: container,
    paddingPx: padding,
    textStyle: textStyle,
  );
}
