import 'package:flutter/material.dart';

/// Bundled **`JioTypeVar.ttf`** registration in `pubspec.yaml` (`flutter.fonts.family`).
///
/// Mirrors `packages/shared/src/data/fonts.ts` → `jiotype-var` → `name: 'JioType Variable'`.
const String kJioTypeVariableFontFamily = 'JioType Variable';

/// Curated id for the bundled variable font (`typography.config.fontSelection.textFontId`).
const String kJioTypeVariableFontId = 'jiotype-var';

/// Whether [name] refers to JioType (variable or RN/Android static cuts baked in snapshots).
bool isJioTypeFamilyName(String? name) {
  if (name == null || name.trim().isEmpty) return false;
  final n = name.trim().toLowerCase();
  return n == 'jiotype var' ||
      n == 'jiotype variable' ||
      n == 'jiotype' ||
      n.startsWith('jiotype-') ||
      n.startsWith('jiotypeui');
}

/// Maps Convex / RN static cut names to the bundled Flutter family string.
String normalizeJioTypeFamilyName(String? name) {
  if (name == null || name.trim().isEmpty) return kJioTypeVariableFontFamily;
  if (isJioTypeFamilyName(name)) return kJioTypeVariableFontFamily;
  return name.trim();
}

/// Derives [FontWeight] from RN static family names (`JioType-Medium`, …).
FontWeight? jioStaticFamilyToWeight(String? staticFamily,
    {FontWeight? fallback}) {
  if (staticFamily == null || staticFamily.trim().isEmpty) return fallback;
  final n = staticFamily.trim().toLowerCase();
  if (n.contains('hairline')) return FontWeight.w100;
  if (n.contains('light')) return FontWeight.w300;
  if (n.contains('medium')) return FontWeight.w500;
  if (n.contains('extrablack') ||
      (n.contains('black') && !n.contains('bold'))) {
    return FontWeight.w900;
  }
  if (n.contains('bold')) return FontWeight.w700;
  if (n == 'jiotype' || n.endsWith('-regular')) return FontWeight.w400;
  return fallback;
}

/// Rewrites Jio static cuts → bundled **JioType Variable** + weight axis.
TextStyle applyJioVariableFontFallback(TextStyle style) {
  if (!isJioTypeFamilyName(style.fontFamily)) return style;
  return style.copyWith(
    fontFamily: kJioTypeVariableFontFamily,
    fontWeight: style.fontWeight ?? jioStaticFamilyToWeight(style.fontFamily),
  );
}
