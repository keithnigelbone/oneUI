import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../utils/storybook_google_fonts.dart';
import '../widgets/one_ui_badge_types.dart';
import '../foundations/typography_preview_utils.dart';
import '../tokens/typography_scale.dart';
import '../widgets/one_ui_text_types.dart';
import 'badge_slot_context.dart';
import 'badge_slot_padding.dart';
import 'native_design_system_payload.dart';
import 'native_typography_snapshot.dart';
import 'text_style_resolve.dart';

/// Resolved geometry + label typography for [OneUiBadge].
class BadgeResolvedLayout {
  const BadgeResolvedLayout({
    required this.height,
    required this.padding,
    required this.gap,
    required this.borderRadius,
    required this.labelStyle,
  });

  /// Total outer height — CSS `height` on `.badge[data-size]` (border-box).
  final double height;
  final EdgeInsets padding;
  final double gap;
  final double borderRadius;
  final TextStyle labelStyle;
}

EdgeInsets resolveBadgeContainerPadding(
  OneUiBadgeSize size, {
  required bool hasStart,
  required bool hasEnd,
  required NativeDesignSystemPayload ds,
  required BuildContext context,
  BadgeSlotPaddingFlags slotFlags = const BadgeSlotPaddingFlags.empty(),
  List<String> gaps = const [],
}) {
  return resolveBadgeContainerPaddingWithFlags(
    context,
    size,
    hasStart: hasStart,
    hasEnd: hasEnd,
    flags: slotFlags,
    ds: ds,
    gaps: gaps,
  );
}

BadgeResolvedLayout resolveBadgeLayout(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiBadgeSize size,
  required bool hasStart,
  required bool hasEnd,
  BadgeSlotPaddingFlags slotFlags = const BadgeSlotPaddingFlags.empty(),
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

  final height = px([
        '--Badge-height-$size',
        '--Badge-height',
      ]) ??
      20;

  final gap = px(['--Badge-gap-$size', '--Badge-gap']) ?? 4;

  final borderRadius = px([
        '--Badge-borderRadius-$size',
        '--Badge-borderRadius',
      ]) ??
      6;

  final labelStyle = _resolveBadgeLabelStyle(context, ds, size: size, px: px);

  return BadgeResolvedLayout(
    height: height,
    padding: resolveBadgeContainerPadding(
      size,
      hasStart: hasStart,
      hasEnd: hasEnd,
      ds: ds,
      context: context,
      slotFlags: slotFlags,
      gaps: gaps,
    ),
    gap: gap,
    borderRadius: borderRadius,
    labelStyle: labelStyle,
  );
}

TextStyle _resolveBadgeLabelStyle(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiBadgeSize size,
  required double? Function(Iterable<String> keys, {double? relativeToPx}) px,
}) {
  final scope = OneUiScope.of(context);
  final typo = OneUiScope.nativeTypographyOf(context);
  final labelSize = kBadgeSizeToLabel[size] ?? 'XS';

  final fontSize = px([
        '--Badge-fontSize-$size',
        '--Badge-fontSize',
      ]) ??
      typo?.emphasisStyle('label', labelSize, emphasis: 'medium')?.fontSize ??
      12;

  final lineHeightPx = px([
    '--Badge-lineHeight-$size',
    '--Badge-lineHeight',
  ], relativeToPx: fontSize);

  final heightMult = (lineHeightPx != null && fontSize > 0)
      ? lineHeightPx / fontSize
      : typo?.emphasisStyle('label', labelSize, emphasis: 'medium')?.height ??
          1.25;

  final baseTypo = resolveOneUiTextTypographyStyle(
        context,
        variant: OneUiTextVariant.label,
        size: labelSize,
        weight: OneUiTextWeight.medium,
      ) ??
      TextStyle(
        fontFamily: typo?.fontFamilyPrimaryOrBundled,
        fontWeight: FontWeight.w500,
      );

  final fontWeightRaw = ds.resolveCSSValue(
    ds.rawComponentCascade(['--Badge-fontWeight']) ??
        'var(--Label-FontWeight-Medium)',
    platformId: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
    nativeTypography: typo,
  );

  FontWeight? fw;
  if (fontWeightRaw != null) {
    final n = int.tryParse(fontWeightRaw.replaceAll(RegExp(r'[^0-9]'), ''));
    if (n != null)
      fw = FontWeight.values.firstWhere(
        (w) => w.value == n,
        orElse: () => FontWeight.w500,
      );
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
    fontWeight: fw ?? baseTypo.fontWeight ?? FontWeight.w500,
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

List<String> collectBadgeLayoutGaps(
  BuildContext context,
  NativeDesignSystemPayload ds,
  OneUiBadgeSize size,
) {
  final gaps = <String>[];
  final scope = OneUiScope.of(context);
  final typo = OneUiScope.nativeTypographyOf(context);

  for (final key in [
    '--Badge-height-$size',
    '--Badge-paddingHorizontal-$size',
    '--Badge-gap-$size',
    '--Badge-borderRadius-$size',
    '--Badge-fontSize-$size',
    '--Badge-lineHeight-$size',
  ]) {
    ds.resolveComponentLengthPxCascade(
      [key],
      gaps: gaps,
      platformId: scope.platformId,
      density: scope.density,
      platformsConfig: scope.platformsFoundationConfig,
      nativeTypography: typo,
    );
  }
  return gaps;
}
