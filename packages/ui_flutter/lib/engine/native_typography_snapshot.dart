import 'package:flutter/material.dart';

import '../tokens/jio_type_font.dart';
import 'static_weight_families.dart';

/// Parsed `buildNativeTheme` → `typography` JSON (`NativeTypography` in TS).
///
/// Same numeric resolution as React Native: sizes and line heights were computed
/// in TypeScript for the snapshot’s platform and density.
class NativeTypographySnapshot {
  NativeTypographySnapshot._(this._raw);

  final Map<String, dynamic> _raw;

  /// Returns null if [raw] is missing or not a typography tree.
  static NativeTypographySnapshot? tryParse(Object? raw) {
    if (raw is! Map) return null;
    final m = Map<String, dynamic>.from(raw as Map);
    if (m['label'] is! Map && m['body'] is! Map) return null;
    return NativeTypographySnapshot._(m);
  }

  /// Body / Label / Code: base size from `sizes[size]` with `weights[emphasis]`.
  TextStyle? emphasisStyle(String role, String size,
      {String emphasis = 'medium'}) {
    final roleMap = _raw[role];
    if (roleMap is! Map) return null;
    final sizes = roleMap['sizes'];
    if (sizes is! Map) return null;
    final styleMap = sizes[size];
    if (styleMap is! Map) return null;
    var base = _typeStyleFromJson(Map<String, dynamic>.from(styleMap as Map));
    if (role != 'code') {
      final ff = base.fontFamily;
      if (ff == null || ff.isEmpty) {
        base = base.copyWith(fontFamily: fontFamilyPrimaryOrBundled);
      }
    }
    final weights = roleMap['weights'];
    if (weights is Map && emphasis != 'medium') {
      final w = weights[emphasis];
      if (w is num) {
        return base.copyWith(fontWeight: _fontWeight(w.round()));
      }
    }
    return base;
  }

  /// Display / Headline / Title — fixed per-size weights only.
  TextStyle? fixedRoleStyle(String role, String size) {
    final roleMap = _raw[role];
    if (roleMap is! Map) return null;
    final sizes = roleMap['sizes'];
    if (sizes is! Map) return null;
    final styleMap = sizes[size];
    if (styleMap is! Map) return null;
    var base = _typeStyleFromJson(Map<String, dynamic>.from(styleMap as Map));
    if (role != 'code') {
      final ff = base.fontFamily;
      if (ff == null || ff.isEmpty) {
        base = base.copyWith(fontFamily: fontFamilyPrimaryOrBundled);
      }
    }
    return base;
  }

  String? get fontFamilyPrimary => (_raw['fontFamilies'] is Map)
      ? (_raw['fontFamilies'] as Map)['primary'] as String?
      : null;

  String? get fontFamilyCode => (_raw['fontFamilies'] is Map)
      ? (_raw['fontFamilies'] as Map)['code'] as String?
      : null;

  /// Primary stack (`fontFamilies.primary`) or bundled **`JioType Variable`** when Convex omits it.
  ///
  /// Matches Storybook/component expectation: never render label text with the platform fallback sans
  /// when the brand snapshot is incomplete — same family string as CSS `var(--Typography-Font-Text)`.
  String get fontFamilyPrimaryOrBundled {
    final p = fontFamilyPrimary;
    if (p != null && p.trim().isNotEmpty) return normalizeJioTypeFamilyName(p);
    return kJioTypeVariableFontFamily;
  }

  /// Per-slot static weight cuts from `buildNativeTypography` (Android parity).
  StaticWeightFamiliesBySlot? get staticWeightFamilies =>
      parseStaticWeightFamilies(_raw['staticWeightFamilies']);

  /// `--Typography-Font-Script` / `fontFamilies.script` from Convex.
  String? get fontFamilyScript {
    if (_raw['fontFamilies'] is! Map) return null;
    final script = (_raw['fontFamilies'] as Map)['script'];
    if (script is! String || script.trim().isEmpty) return null;
    return script.trim();
  }

  /// Script overlay from `buildNativeTypography` → `scriptVariants`.
  ///
  /// Returns partial style (font family + line height) for [scriptId] × [mode] × role × size.
  TextStyle? scriptVariantOverlay({
    required String scriptId,
    required String scriptMode,
    required String role,
    required String size,
  }) {
    final variants = _raw['scriptVariants'];
    if (variants is! Map) return null;
    final scriptMap = variants[scriptId];
    if (scriptMap is! Map) return null;
    final modeMap = scriptMap[scriptMode];
    if (modeMap is! Map) return null;
    final roleMap = modeMap[role];
    if (roleMap is! Map) return null;
    final sizeMap = roleMap[size];
    if (sizeMap is! Map) return null;
    return _typeStyleFromJson(Map<String, dynamic>.from(sizeMap));
  }
}

/// Resolve V2 typography role tokens referenced by Convex component maps (e.g. Button
/// `--Button-fontSize-*` → `var(--Label-M-FontSize)`), using values baked into
/// `getNativeThemeSnapshot.typography` — parity with global `typography.css` on web.
extension NativeTypographyConvexVarResolution on NativeTypographySnapshot {
  /// Returns concrete CSS-ish values (`14px`, `700`, …) when [name] is a `--Label-*` alias.
  String? resolveV2LabelCssCustomProperty(String name) {
    final nn = name.startsWith('--') ? name : '--$name';

    final fwRole =
        RegExp(r'^--Label-FontWeight-(High|Medium|Low)$').firstMatch(nn);
    if (fwRole != null) {
      final emphasis = switch (fwRole.group(1)!) {
        'High' => 'high',
        'Medium' => 'medium',
        'Low' => 'low',
        _ => null,
      };
      if (emphasis == null) return null;
      // typography.css emits a single `--Label-FontWeight-*` per emphasis (no size suffix).
      final style = emphasisStyle('label', 'M', emphasis: emphasis);
      final w = style?.fontWeight;
      if (w == null) return null;
      return '${_fontWeightToCssUnit(w)}';
    }

    final fsRole = RegExp(r'^--Label-(.+)-FontSize$').firstMatch(nn);
    if (fsRole != null) {
      final sizeKey = fsRole.group(1)!;
      final style = emphasisStyle('label', sizeKey);
      final fs = style?.fontSize;
      if (fs == null || fs <= 0) return null;
      return _formatPxCss(fs);
    }

    final lhRole = RegExp(r'^--Label-(.+)-LineHeight$').firstMatch(nn);
    if (lhRole != null) {
      final sizeKey = lhRole.group(1)!;
      final style = emphasisStyle('label', sizeKey);
      final fs = style?.fontSize;
      if (fs == null || fs <= 0) return null;
      final mult = style!.height ?? 1.0;
      return _formatPxCss(fs * mult);
    }

    return null;
  }
}

String _formatPxCss(double px) =>
    ((px - px.roundToDouble()).abs() < 1e-9) ? '${px.round()}px' : '${px}px';

int _fontWeightToCssUnit(FontWeight w) {
  if (w == FontWeight.w100) return 100;
  if (w == FontWeight.w200) return 200;
  if (w == FontWeight.w300) return 300;
  if (w == FontWeight.w400 || w == FontWeight.normal) return 400;
  if (w == FontWeight.w500) return 500;
  if (w == FontWeight.w600) return 600;
  if (w == FontWeight.w700 || w == FontWeight.bold) return 700;
  if (w == FontWeight.w800) return 800;
  if (w == FontWeight.w900) return 900;
  return 400;
}

TextStyle _typeStyleFromJson(Map<String, dynamic> m) {
  final fs = (m['fontSize'] as num?)?.toDouble();
  final lh = (m['lineHeight'] as num?)?.toDouble();
  final fw = (m['fontWeight'] as num?)?.round() ?? 400;
  final ff = m['fontFamily'] as String?;
  final ls = (m['letterSpacing'] as num?)?.toDouble();
  if (fs == null || lh == null) {
    return TextStyle(
        fontFamily: ff, fontWeight: _fontWeight(fw), letterSpacing: ls);
  }
  final heightMult = fs > 0 ? lh / fs : 1.0;
  return TextStyle(
    fontSize: fs,
    height: heightMult,
    fontWeight: _fontWeight(fw),
    fontFamily: ff,
    letterSpacing: ls,
  );
}

FontWeight _fontWeight(int w) {
  final v = (w.clamp(100, 900) ~/ 100) * 100;
  switch (v) {
    case 100:
      return FontWeight.w100;
    case 200:
      return FontWeight.w200;
    case 300:
      return FontWeight.w300;
    case 400:
      return FontWeight.w400;
    case 500:
      return FontWeight.w500;
    case 600:
      return FontWeight.w600;
    case 700:
      return FontWeight.w700;
    case 800:
      return FontWeight.w800;
    case 900:
      return FontWeight.w900;
    default:
      return FontWeight.w400;
  }
}
