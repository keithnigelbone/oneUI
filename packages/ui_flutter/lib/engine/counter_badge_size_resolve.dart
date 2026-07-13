import 'package:flutter/material.dart';

import '../foundations/dimensions_resolve.dart';
import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_counter_badge_types.dart';
import 'badge_slot_context.dart';
import 'native_design_system_payload.dart';

/// Resolved geometry + label typography for [OneUiCounterBadge].
class CounterBadgeResolvedLayout {
  const CounterBadgeResolvedLayout({
    required this.height,
    required this.padH,
    required this.borderRadius,
    required this.labelStyle,
  });

  final double height;
  final double padH;
  final double borderRadius;
  final TextStyle labelStyle;
}

const Map<OneUiCounterBadgeSize, String> kCounterBadgeSizeToLabel = {
  'xs': '3XS',
  's': '3XS',
  'm': '2XS',
  'l': 'XS',
  'xl': 'S',
};

/// Web `CounterBadge.module.css` / RN `CounterBadge.styles.native.ts` height chain.
const Map<OneUiCounterBadgeSize, String> kCounterBadgeHeightSpacingFallback = {
  'xs': '3',
  's': '3-5',
  'm': '4',
  'l': '5',
  'xl': '5',
};

double _counterBadgeHeightFromSpacing(
    BuildContext context, String spacingName) {
  final scope = OneUiScope.of(context);
  return resolveSpacingPx(
    designSystem: scope.designSystem,
    platformsConfig: scope.platformsFoundationConfig,
    platformId: scope.platformId,
    density: scope.density,
    spacingName: spacingName,
  );
}

CounterBadgeResolvedLayout resolveCounterBadgeLayout(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiCounterBadgeSize size,
  bool inheritSlotGeometry = false,
}) {
  final scope = OneUiScope.of(context);
  final typo = OneUiScope.nativeTypographyOf(context);
  final slot = inheritSlotGeometry ? BadgeSlotSizeScope.maybeOf(context) : null;

  double? px(Iterable<String> keys) => ds.resolveComponentLengthPxCascade(
        keys,
        platformId: scope.platformId,
        density: scope.density,
        platformsConfig: scope.platformsFoundationConfig,
        nativeTypography: typo,
      );

  final heightKeys = <String>[
    '--CounterBadge-height-$size',
    if (size == 'xl') '--CounterBadge-height-l',
    '--CounterBadge-height-m',
  ];

  final height = (slot != null
          ? _counterBadgeHeightFromSpacing(context, slot.counterSpacing)
          : null) ??
      px(heightKeys) ??
      _counterBadgeHeightFromSpacing(
        context,
        kCounterBadgeHeightSpacingFallback[size] ?? '4',
      );

  final padH = px([
        '--CounterBadge-paddingHorizontal-$size',
        '--CounterBadge-paddingHorizontal',
      ]) ??
      _counterBadgeHeightFromSpacing(context, '0-5');

  final borderRadius = px([
        '--CounterBadge-borderRadius',
        '--Shape-Pill',
      ]) ??
      height;

  final labelKey = kCounterBadgeSizeToLabel[size] ?? '2XS';
  var labelStyle = typo?.emphasisStyle('label', labelKey, emphasis: 'medium') ??
      TextStyle(
        fontSize: height * 0.55,
        fontWeight: FontWeight.w600,
        fontFamily: typo?.fontFamilyPrimaryOrBundled,
      );

  final fontSizePx = px([
    '--CounterBadge-fontSize-$size',
    if (size == 'xl') '--CounterBadge-fontSize-l',
    '--CounterBadge-fontSize-m',
  ]);
  final lineHeightPx = px([
    '--CounterBadge-lineHeight-$size',
    if (size == 'xl') '--CounterBadge-lineHeight-l',
    '--CounterBadge-lineHeight-m',
  ]);
  if (fontSizePx != null) {
    labelStyle = labelStyle.copyWith(fontSize: fontSizePx);
  }
  final effectiveFontSize = labelStyle.fontSize ?? fontSizePx;
  if (effectiveFontSize != null &&
      effectiveFontSize > 0 &&
      lineHeightPx != null) {
    final ratio = lineHeightPx / effectiveFontSize;
    if (ratio == 1.0) {
      // copyWith(height: null) retains the old ratio — rebuild without height.
      labelStyle = TextStyle(
        fontFamily: labelStyle.fontFamily,
        fontSize: effectiveFontSize,
        fontWeight: labelStyle.fontWeight,
        letterSpacing: labelStyle.letterSpacing,
      );
    } else {
      labelStyle = labelStyle.copyWith(
        fontSize: effectiveFontSize,
        height: ratio,
      );
    }
  }

  return CounterBadgeResolvedLayout(
    height: height,
    padH: padH,
    borderRadius: borderRadius,
    labelStyle: labelStyle,
  );
}
