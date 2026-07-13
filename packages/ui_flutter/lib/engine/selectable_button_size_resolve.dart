import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/typography_scale.dart';
import '../widgets/one_ui_selectable_button_types.dart';
import 'native_design_system_payload.dart';
import 'native_typography_snapshot.dart';
import '../utils/storybook_google_fonts.dart';
import '../widgets/one_ui_text_types.dart';
import 'text_style_resolve.dart';

class SelectableButtonResolvedLayout {
  const SelectableButtonResolvedLayout({
    required this.minHeight,
    required this.padding,
    required this.gap,
    required this.borderRadius,
    required this.labelStyle,
    required this.iconSize,
  });

  final double minHeight;
  final EdgeInsets padding;
  final double gap;
  final double borderRadius;
  final TextStyle labelStyle;
  final double iconSize;
}

/// Icon slot size — web `1em` when uncontained.
double selectableButtonResolvedIconSize(
  SelectableButtonResolvedLayout layout, {
  required bool contained,
}) {
  if (!contained) {
    return layout.labelStyle.fontSize ?? layout.iconSize;
  }
  return layout.iconSize;
}

SelectableButtonResolvedLayout resolveSelectableButtonLayout(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiSelectableButtonSize size,
  required bool condensed,
  required bool hasStart,
  required bool hasEnd,
}) {
  final scope = OneUiScope.of(context);
  final typo = OneUiScope.nativeTypographyOf(context);
  final gaps = <String>[];

  double? px(Iterable<String> keys, {double? relativeToPx}) =>
      ds.resolveComponentLengthPxCascade(
        keys,
        gaps: gaps,
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: typo,
        relativeToPx: relativeToPx,
      );

  final heightKeys = condensed
      ? [
          '--SelectableButton-minHeight-$size-condensed',
          '--SelectableButton-minHeight-$size',
          '--SelectableButton-height-$size',
          '--SelectableButton-height',
        ]
      : [
          '--SelectableButton-minHeight-$size',
          '--SelectableButton-height-$size',
          '--SelectableButton-height',
        ];

  final minHeight = px(heightKeys) ?? _fallbackHeight(size, condensed);
  final gap = px([
    '--SelectableButton-gap-$size',
    '--SelectableButton-gap',
  ]) ?? 6;

  final padDefault = px([
    '--SelectableButton-paddingHorizontal-$size',
    '--SelectableButton-paddingHorizontal',
  ]) ?? 16;

  final padCondensed = condensed
      ? px([
          '--SelectableButton-paddingHorizontal-$size-condensed',
        ])
      : null;

  final padStart = hasStart
      ? px([
          '--SelectableButton-paddingHorizontalStart-$size-slot',
        ])
      : null;
  final padEnd = hasEnd
      ? px([
          '--SelectableButton-paddingHorizontalEnd-$size-slot',
        ])
      : null;

  final padV = px([
    '--SelectableButton-paddingVertical-$size',
    '--SelectableButton-paddingVertical',
  ]) ?? 4;

  final left = padStart ?? padCondensed ?? padDefault;
  final right = padEnd ?? padCondensed ?? padDefault;

  final radius = px(['--SelectableButton-borderRadius', '--Shape-Pill']) ?? 9999;

  final iconSize = px([
    '--SelectableButton-iconSize-$size',
    '--SelectableButton-iconSize',
  ]) ?? _fallbackIconSize(size);

  final labelStyle = _resolveLabelStyle(context, ds, size: size, px: px, typo: typo);

  return SelectableButtonResolvedLayout(
    minHeight: minHeight,
    padding: EdgeInsets.fromLTRB(left, padV, right, padV),
    gap: gap,
    borderRadius: radius,
    labelStyle: labelStyle,
    iconSize: iconSize,
  );
}

double _fallbackHeight(OneUiSelectableButtonSize size, bool condensed) {
  if (condensed) {
    return switch (size) {
      'xs' => 14,
      's' => 22,
      'm' => 28,
      'l' => 36,
      _ => 28,
    };
  }
  return switch (size) {
    'xs' => 24,
    's' => 32,
    'm' => 40,
    'l' => 48,
    _ => 40,
  };
}

double _fallbackIconSize(OneUiSelectableButtonSize size) => switch (size) {
      'xs' => 14,
      's' => 16,
      'm' => 20,
      'l' => 24,
      _ => 20,
    };

TextStyle _resolveLabelStyle(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiSelectableButtonSize size,
  required double? Function(Iterable<String> keys, {double? relativeToPx}) px,
  required NativeTypographySnapshot? typo,
}) {
  final scope = OneUiScope.of(context);
  final labelSize = switch (size) {
    'xs' => 'XS',
    's' => 'S',
    'm' => 'M',
    'l' => 'L',
    _ => 'M',
  };

  final fontSize = px([
        '--SelectableButton-fontSize-$size',
        '--SelectableButton-fontSize',
      ]) ??
      typo?.emphasisStyle('label', labelSize, emphasis: 'high')?.fontSize ??
      14;

  final lineHeightPx = px([
    '--SelectableButton-lineHeight-$size',
    '--SelectableButton-lineHeight',
  ], relativeToPx: fontSize);

  final heightMult = (lineHeightPx != null && fontSize > 0)
      ? lineHeightPx / fontSize
      : typo?.emphasisStyle('label', labelSize, emphasis: 'high')?.height ??
          1.25;

  final baseTypo = resolveOneUiTextTypographyStyle(
        context,
        variant: OneUiTextVariant.label,
        size: labelSize,
        weight: OneUiTextWeight.high,
      ) ??
      TextStyle(
        fontFamily: typo?.fontFamilyPrimaryOrBundled,
        fontWeight: FontWeight.w600,
      );

  final fontWeightRaw = ds.resolveCSSValue(
    ds.rawComponentCascade(['--SelectableButton-fontWeight']) ??
        'var(--Label-FontWeight-High)',
    platformId: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
    nativeTypography: typo,
  );

  FontWeight? fw;
  if (fontWeightRaw != null) {
    final n = int.tryParse(fontWeightRaw.replaceAll(RegExp(r'[^0-9]'), ''));
    if (n != null) {
      fw = FontWeight.values.firstWhere(
        (w) => w.value == n,
        orElse: () => FontWeight.w600,
      );
    }
  }

  final slotIds = resolveFontSlotIds(scope.typographyConfig, scope.customFonts);
  final fontId =
      curatedFontIdForTypographyRole('label', slotIds, scope.typographyConfig);
  final uploaded = uploadedFamilyForFontId(fontId, scope.customFonts);
  final lhPx = fontSize * heightMult;

  final loaded = storybookLoadedTextStyle(
    fontId: fontId,
    uploadedFamilyName: uploaded,
    fontSize: fontSize,
    lineHeightPx: lhPx,
    fontWeight: fw ?? baseTypo.fontWeight ?? FontWeight.w600,
    letterSpacing: baseTypo.letterSpacing,
    fontVariations: baseTypo.fontVariations,
    fontFeatures: baseTypo.fontFeatures,
  );

  return loaded.copyWith(
    fontSize: fontSize,
    height: heightMult,
    fontWeight: fw ?? loaded.fontWeight,
  );
}
