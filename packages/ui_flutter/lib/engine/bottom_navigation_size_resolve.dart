import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../theme/one_ui_scope.dart';
import '../widgets/one_ui_bottom_navigation_types.dart';
import 'native_design_system_payload.dart';
import 'native_typography_snapshot.dart';
import 'motion_css_static.dart';
import 'motion_resolve.dart';

/// Layout metrics — `BottomNavigation.module.css` + RN `BottomNavigationItem.styles`.
class BottomNavigationResolvedLayout {
  const BottomNavigationResolvedLayout({
    required this.paddingHorizontal,
    required this.paddingVertical,
    required this.itemGap,
    required this.itemPadding,
    required this.innerGap,
    required this.innerPaddingVertical,
    required this.itemHeight,
    required this.iconSize,
    required this.label2LineBoxHeight,
    required this.borderRadius,
    required this.stateLayerBorderRadius,
    required this.labelStyle,
    required this.transitionDuration,
  });

  final double paddingHorizontal;
  final double paddingVertical;
  final double itemGap;
  final double itemPadding;
  final double innerGap;
  final double innerPaddingVertical;
  final double itemHeight;
  final double iconSize;
  final double label2LineBoxHeight;
  final double borderRadius;
  final double stateLayerBorderRadius;
  final TextStyle labelStyle;
  final Duration transitionDuration;
}

String _heightKeyForLabelType(OneUiBottomNavigationLabelType labelType) {
  return switch (labelType) {
    kOneUiBottomNavLabelNone => 'none',
    kOneUiBottomNavLabel2Line => '2line',
    _ => '1line',
  };
}

String _iconSpacingTail(OneUiBottomNavigationLabelType labelType) {
  return labelType == kOneUiBottomNavLabelNone ? '6' : '5';
}

BottomNavigationResolvedLayout resolveBottomNavigationLayout(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required OneUiBottomNavigationLabelType labelType,
}) {
  final scope = OneUiScope.of(context);
  final typo = OneUiScope.nativeTypographyOf(context);
  final plat = scope.platformId;
  final den = scope.density;
  final pc = scope.platformsFoundationConfig;
  final gaps = <String>[];

  double? px(
    Iterable<String> keys, {
    String? spacingFallback,
    double? relativeToPx,
  }) {
    final v = ds.resolveComponentLengthPxCascade(
      keys,
      gaps: gaps,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
      relativeToPx: relativeToPx,
    );
    if (v != null) return v;
    if (spacingFallback != null) {
      return ds.resolveComponentLengthPxCascade(
        ['--Spacing-$spacingFallback'],
        gaps: gaps,
        platformId: plat,
        density: den,
        platformsConfig: pc,
        nativeTypography: typo,
        relativeToPx: relativeToPx,
      );
    }
    return null;
  }

  final heightKey = _heightKeyForLabelType(labelType);
  final tokenItemHeight = px([
    '--BottomNavItem-height-$heightKey',
    '--BottomNavItem-height',
    '--Spacing-${heightKey == 'none' ? '14' : heightKey == '2line' ? '18' : '16'}',
  ])!;

  final iconTail = _iconSpacingTail(labelType);
  final iconSize = px([
    if (labelType == kOneUiBottomNavLabelNone)
      '--BottomNavItem-iconSize-none'
    else
      '--BottomNavItem-iconSize',
    '--Spacing-$iconTail',
  ])!;

  final borderRadius = px([
        '--BottomNavItem-borderRadius',
        '--BottomNavigation-itemBorderRadius',
        '--Shape-2',
      ], spacingFallback: null) ??
      px(['--Shape-2']) ??
      8;

  final stateLayerRadius = px([
        '--BottomNavItem-stateLayerBorderRadius',
        '--BottomNavigation-itemBorderRadius',
        '--Shape-2',
      ]) ??
      borderRadius;

  final labelStyle = _resolveBottomNavLabelStyle(
    context,
    ds,
    typo: typo,
    px: px,
  );

  final innerGap = px([
        '--BottomNavItem-gap',
        '--Spacing-1-5',
      ]) ??
      6;
  final innerPaddingVertical = px([
        '--BottomNavItem-innerPadding',
        '--Spacing-1',
      ]) ??
      4;
  final itemPadding = px([
        '--BottomNavItem-padding',
        '--Spacing-1',
      ]) ??
      4;
  final label2LineBoxHeight = px([
        '--BottomNavItem-label2LineHeight',
        '--Spacing-6',
      ]) ??
      24;

  final itemHeight = math.max(
    tokenItemHeight,
    _bottomNavMinItemHeight(
      iconSize: iconSize,
      innerGap: innerGap,
      innerPaddingVertical: innerPaddingVertical,
      itemPadding: itemPadding,
      labelStyle: labelStyle,
      labelType: labelType,
      label2LineBoxHeight: label2LineBoxHeight,
    ),
  );

  int durationMs = 150;
  for (final key in [
    '--BottomNavItem-transitionDuration',
    '--Motion-Duration-Discreet-S',
  ]) {
    final raw = ds.rawComponentCascade([key]);
    final synthetic = raw ?? 'var($key)';
    final resolved = ds.resolveCSSValue(
      synthetic,
      platformId: plat,
      density: den,
      platformsConfig: pc,
      nativeTypography: typo,
    );
    final ms =
        durationMsFromConcreteCss(resolved ?? convexMotionCSSValue(key) ?? '');
    if (ms != null) {
      durationMs = ms;
      break;
    }
  }

  return BottomNavigationResolvedLayout(
    paddingHorizontal: px([
          '--BottomNavigation-paddingHorizontal',
          '--Spacing-4',
        ]) ??
        16,
    paddingVertical: px([
          '--BottomNavigation-paddingVertical',
          '--Spacing-0',
        ]) ??
        0,
    itemGap: px([
          '--BottomNavigation-itemGap',
          '--Spacing-0',
        ]) ??
        0,
    itemPadding: itemPadding,
    innerGap: innerGap,
    innerPaddingVertical: innerPaddingVertical,
    itemHeight: itemHeight,
    iconSize: iconSize,
    label2LineBoxHeight: label2LineBoxHeight,
    borderRadius: borderRadius,
    stateLayerBorderRadius: stateLayerRadius,
    labelStyle: labelStyle,
    transitionDuration: Duration(milliseconds: durationMs.round()),
  );
}

TextStyle _resolveBottomNavLabelStyle(
  BuildContext context,
  NativeDesignSystemPayload ds, {
  required NativeTypographySnapshot? typo,
  required double? Function(Iterable<String> keys, {double? relativeToPx}) px,
}) {
  final scope = OneUiScope.of(context);
  final base = typo?.emphasisStyle('label', 'XS', emphasis: 'medium') ??
      const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, height: 1);

  final fontSize = px([
        '--BottomNavItem-labelFontSize',
        '--Label-XS-FontSize',
      ]) ??
      base.fontSize ??
      12;

  final lineHeightPx = px([
    '--BottomNavItem-labelLineHeight',
    '--Label-XS-LineHeight',
  ], relativeToPx: fontSize);

  final heightMult = (lineHeightPx != null && fontSize > 0)
      ? lineHeightPx / fontSize
      : base.height ?? 1;

  final fontWeightRaw = ds.resolveCSSValue(
    ds.rawComponentCascade(['--BottomNavItem-labelFontWeight']) ??
        ds.rawComponentCascade(['--Label-FontWeight-Medium']) ??
        'var(--Label-FontWeight-Medium)',
    platformId: scope.platformId,
    density: scope.density,
    platformsConfig: scope.platformsFoundationConfig,
    nativeTypography: typo,
  );

  FontWeight? fontWeight;
  if (fontWeightRaw != null) {
    final parsed =
        int.tryParse(fontWeightRaw.replaceAll(RegExp(r'[^0-9]'), ''));
    if (parsed != null) {
      fontWeight = FontWeight.values.firstWhere(
        (w) => w.value == parsed,
        orElse: () => FontWeight.w500,
      );
    }
  }

  return base.copyWith(
    fontSize: fontSize,
    height: heightMult,
    fontWeight: fontWeight ?? base.fontWeight,
  );
}

double _bottomNavLabelBlockHeight(
  TextStyle labelStyle,
  OneUiBottomNavigationLabelType labelType,
  double label2LineBoxHeight,
) {
  if (labelType == kOneUiBottomNavLabel2Line) return label2LineBoxHeight;
  final fontSize = labelStyle.fontSize ?? 12;
  final lineHeightMult = labelStyle.height ?? 1;
  return fontSize * lineHeightMult;
}

/// Grows the shell when typography tokens exceed the default 1-line box.
double _bottomNavMinItemHeight({
  required double iconSize,
  required double innerGap,
  required double innerPaddingVertical,
  required double itemPadding,
  required TextStyle labelStyle,
  required OneUiBottomNavigationLabelType labelType,
  required double label2LineBoxHeight,
}) {
  var inner = iconSize;
  if (labelType != kOneUiBottomNavLabelNone) {
    inner += innerGap +
        _bottomNavLabelBlockHeight(labelStyle, labelType, label2LineBoxHeight);
  }
  return inner + (innerPaddingVertical * 2) + (itemPadding * 2);
}
