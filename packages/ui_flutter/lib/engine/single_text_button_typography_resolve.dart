import 'package:flutter/material.dart';

import '../tokens/platform_foundation_config.dart';
import 'button_typography_parse.dart';
import 'native_design_system_payload.dart';
import 'native_typography_snapshot.dart';

/// Label style with `--SingleTextButton-*` typography overrides (web module.css).
TextStyle applySingleTextButtonTypographyOverrides(
  TextStyle base,
  NativeDesignSystemPayload ds, {
  required String platformId,
  required String density,
  PlatformsFoundationConfig? platformsConfig,
  NativeTypographySnapshot? nativeTypography,
}) {
  final fontWeightRaw = ds.rawComponentCascade(['--SingleTextButton-fontWeight']);
  final fontWeightResolved = fontWeightRaw != null
      ? ds.resolveCSSValue(
          fontWeightRaw,
          platformId: platformId,
          density: density,
          platformsConfig: platformsConfig,
          nativeTypography: nativeTypography,
        )
      : null;
  final fontWeight = _fontWeightFromCss(fontWeightResolved) ?? base.fontWeight;

  final ttRaw = ds.rawComponentCascade(['--SingleTextButton-textTransform']);
  final ttResolved = ttRaw != null
      ? ds.resolveCSSValue(
          ttRaw,
          platformId: platformId,
          density: density,
          platformsConfig: platformsConfig,
          nativeTypography: nativeTypography,
        )
      : null;

  final lsRaw = ds.rawComponentCascade(['--SingleTextButton-letterSpacing']);
  final lsResolved = lsRaw != null
      ? ds.resolveCSSValue(
          lsRaw,
          platformId: platformId,
          density: density,
          platformsConfig: platformsConfig,
          nativeTypography: nativeTypography,
        )
      : null;

  final fontSize = base.fontSize ?? 14;
  final letterSpacing = lsResolved != null
      ? buttonLetterSpacingPxFromCss(lsResolved, fontSizePx: fontSize)
      : base.letterSpacing;

  return base.copyWith(
    fontWeight: fontWeight,
    letterSpacing: letterSpacing,
  );
}

/// Applies [textTransform] to visible label text (caller supplies plain label).
String singleTextButtonDisplayLabel(
  NativeDesignSystemPayload ds, {
  required String plainLabel,
  required String platformId,
  required String density,
  PlatformsFoundationConfig? platformsConfig,
  NativeTypographySnapshot? nativeTypography,
}) {
  final ttRaw = ds.rawComponentCascade(['--SingleTextButton-textTransform']);
  if (ttRaw == null) return plainLabel;
  final resolved = ds.resolveCSSValue(
    ttRaw,
    platformId: platformId,
    density: density,
    platformsConfig: platformsConfig,
    nativeTypography: nativeTypography,
  );
  if (resolved == null) return plainLabel;
  return buttonDisplayLabelForTextTransform(resolved, plainLabel);
}

FontWeight? _fontWeightFromCss(String? resolved) {
  if (resolved == null) return null;
  final t = resolved.trim().toLowerCase();
  return switch (t) {
    '100' || 'thin' => FontWeight.w100,
    '200' || 'extra-light' || 'extralight' => FontWeight.w200,
    '300' || 'light' => FontWeight.w300,
    '400' || 'normal' || 'regular' => FontWeight.w400,
    '500' || 'medium' => FontWeight.w500,
    '600' || 'semibold' || 'semi-bold' => FontWeight.w600,
    '700' || 'bold' => FontWeight.w700,
    '800' || 'extra-bold' || 'extrabold' => FontWeight.w800,
    '900' || 'black' => FontWeight.w900,
    _ => int.tryParse(t) != null
        ? FontWeight.values[(int.parse(t).clamp(1, 9) - 1).clamp(0, 8)]
        : null,
  };
}
