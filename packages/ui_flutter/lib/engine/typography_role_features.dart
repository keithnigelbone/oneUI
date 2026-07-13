import 'dart:ui' show FontFeature, FontVariation;

import 'static_weight_families.dart';

/// Font feature slot for a typography role — mirrors web `Text.module.css`.
String typographyFeaturesSlotForRole(String role) {
  if (role == 'code') return 'code';
  if (role == 'display' || role == 'headline' || role == 'title') {
    return 'secondary';
  }
  return 'primary';
}

/// Per-role letter-spacing in px from brand config (`letterSpacing` em × fontSize).
double? resolveTypographyLetterSpacingPx({
  Map<String, dynamic>? typographyConfig,
  required String role,
  required double fontSize,
  double? snapshotLetterSpacing,
}) {
  if (snapshotLetterSpacing != null) return snapshotLetterSpacing;
  if (typographyConfig == null || fontSize <= 0) return null;
  final cfg = unwrapNativeTypographyConfig(typographyConfig);
  final ls = cfg['letterSpacing'];
  if (ls is! Map) return null;
  final em = ls[role];
  if (em is! num || em == 0) return null;
  return em.toDouble() * fontSize;
}

/// Manual opsz axis — web `--{Role}-OpszVariation: 'opsz' N`.
List<FontVariation>? resolveTypographyFontVariations({
  Map<String, dynamic>? typographyConfig,
  required String role,
}) {
  if (typographyConfig == null) return null;
  final cfg = unwrapNativeTypographyConfig(typographyConfig);
  final os = cfg['opticalSizing'];
  if (os is! Map) return null;
  final entry = os[role];
  if (entry is! Map) return null;
  final mode = entry['mode'];
  if (mode != 'manual') return null;
  final opsz = entry['opszValue'];
  if (opsz is! num) return null;
  return [FontVariation('opsz', opsz.toDouble())];
}

List<FontFeature>? _fontFeaturesFromSlotConfig(Map<String, dynamic> features) {
  final out = <FontFeature>[];
  if (features['ligatures'] == false) {
    out.add(const FontFeature.disable('liga'));
    out.add(const FontFeature.disable('clig'));
  }
  if (features['contextualAlternates'] == false) {
    out.add(const FontFeature.disable('calt'));
  }
  return out.isEmpty ? null : out;
}

/// OpenType features per font slot — web `--Typography-Features-{Primary|Secondary|Code}`.
List<FontFeature>? resolveTypographyFontFeatures({
  Map<String, dynamic>? typographyConfig,
  required String role,
}) {
  if (typographyConfig == null) return null;
  final cfg = unwrapNativeTypographyConfig(typographyConfig);
  final ff = cfg['fontFeatures'];
  if (ff is! Map) return null;
  final slot = typographyFeaturesSlotForRole(role);
  final slotCfg = ff[slot];
  if (slotCfg is! Map) return null;
  return _fontFeaturesFromSlotConfig(Map<String, dynamic>.from(slotCfg));
}
