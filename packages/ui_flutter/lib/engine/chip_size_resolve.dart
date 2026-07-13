import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../tokens/typography_scale.dart';
import '../utils/storybook_google_fonts.dart';
import '../widgets/one_ui_chip_types.dart';
import 'chip_slot_kind.dart';
import 'native_design_system_payload.dart';
import 'text_style_resolve.dart';
import '../widgets/one_ui_text_types.dart';

class ChipResolvedLayout {
  const ChipResolvedLayout({
    required this.height,
    required this.padding,
    required this.gap,
    required this.borderRadius,
    required this.labelStyle,
  });

  final double height;
  final EdgeInsets padding;
  final double gap;
  final double borderRadius;
  final TextStyle labelStyle;
}

/// Fallback layout when Convex keys missing — `chipLayoutMatrix.ts`.
ChipResolvedLayout _fallbackLayout(
  OneUiChipSize size,
  ChipSlotKind startKind,
  ChipSlotKind endKind,
) {
  const heights = {'s': 20.0, 'm': 24.0, 'l': 32.0};
  const gap = {'s': 4.0, 'm': 4.0, 'l': 6.0};
  const padNone = {'s': 10.0, 'm': 10.0, 'l': 12.0};
  const padSlot = {'s': 4.0, 'm': 4.0, 'l': 6.0};
  const padBadge = {'s': 6.0, 'm': 8.0, 'l': 10.0};

  double side(ChipSlotKind k, {required bool isBadge}) {
    if (k == kChipSlotNone) return padNone[size]!;
    if (isBadge) return padBadge[size]!;
    return padSlot[size]!;
  }

  return ChipResolvedLayout(
    height: heights[size]!,
    padding: EdgeInsets.fromLTRB(
      side(startKind, isBadge: startKind == kChipSlotBadge),
      0,
      side(endKind, isBadge: endKind == kChipSlotBadge),
      0,
    ),
    gap: gap[size]!,
    borderRadius: 9999,
    labelStyle: const TextStyle(fontSize: 14),
  );
}

ChipResolvedLayout resolveChipLayout(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiChipSize size,
  required bool hasStart,
  required bool hasEnd,
  ChipSlotKind startKind = kChipSlotNone,
  ChipSlotKind endKind = kChipSlotNone,
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

  final height = px(['--Chip-height-$size', '--Chip-height']);
  final gap = px(['--Chip-gap-$size', '--Chip-gap']);
  final radius = px(['--Chip-borderRadius', '--Shape-Pill']);

  final padDefault = px([
    '--Chip-paddingHorizontal-$size',
    '--Chip-paddingHorizontal',
  ]);
  final padSlot = px([
    '--Chip-paddingHorizontal-$size-slot',
    '--Chip-paddingHorizontal-slot',
  ]);

  if (height == null || padDefault == null) {
    return _fallbackLayout(size, startKind, endKind);
  }

  final left = hasStart ? (padSlot ?? padDefault) : padDefault;
  final right = hasEnd ? (padSlot ?? padDefault) : padDefault;

  final labelStyle = _resolveChipLabelStyle(context, ds, size: size, px: px);

  return ChipResolvedLayout(
    height: height,
    padding: EdgeInsets.fromLTRB(left, 0, right, 0),
    gap: gap ?? 4,
    borderRadius: radius ?? 9999,
    labelStyle: labelStyle,
  );
}

TextStyle _resolveChipLabelStyle(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiChipSize size,
  required double? Function(Iterable<String> keys, {double? relativeToPx}) px,
}) {
  final scope = OneUiScope.of(context);
  final typo = OneUiScope.nativeTypographyOf(context);
  final labelSize = kChipSizeToLabel[size] ?? 'S';

  final fontSize = px([
        '--Chip-fontSize-$size',
        '--Chip-fontSize',
      ]) ??
      typo?.emphasisStyle('label', labelSize, emphasis: 'medium')?.fontSize ??
      14;

  final lineHeightPx = px([
    '--Chip-lineHeight-$size',
    '--Chip-lineHeight',
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
    ds.rawComponentCascade(['--Chip-fontWeight']) ??
        'var(--Label-FontWeight-Medium)',
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
        orElse: () => FontWeight.w500,
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
