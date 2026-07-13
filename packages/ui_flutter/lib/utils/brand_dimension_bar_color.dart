import 'dart:math' as math;

import 'package:flutter/material.dart';

/// Parity with `oklchToHex` in `packages/shared/src/utils/colorScale/oklch.ts`.
Color oklchToColor(double lPercent, double c, double hDegrees) {
  final L = lPercent / 100.0;
  final hRad = hDegrees * math.pi / 180.0;
  final a = c * math.cos(hRad);
  final bLab = c * math.sin(hRad);

  final l_ = L + 0.3963377774 * a + 0.2158037573 * bLab;
  final m_ = L - 0.1055613458 * a - 0.0638541728 * bLab;
  final s_ = L - 0.0894841775 * a - 1.291485548 * bLab;

  final l3 = l_ * l_ * l_;
  final m3 = m_ * m_ * m_;
  final s3 = s_ * s_ * s_;

  var linearR = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  var linearG = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  var linearB = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  linearR = linearR.clamp(0.0, 1.0);
  linearG = linearG.clamp(0.0, 1.0);
  linearB = linearB.clamp(0.0, 1.0);

  double srgb(double v) {
    if (v <= 0.0031308) return 12.92 * v;
    return 1.055 * math.pow(v, 1.0 / 2.4).toDouble() - 0.055;
  }

  final r = srgb(linearR).clamp(0.0, 1.0);
  final g = srgb(linearG).clamp(0.0, 1.0);
  final b = srgb(linearB).clamp(0.0, 1.0);

  return Color.fromARGB(
    255,
    (r * 255).round().clamp(0, 255),
    (g * 255).round().clamp(0, 255),
    (b * 255).round().clamp(0, 255),
  );
}

/// Same anchor table + chroma taper as `fallbackHexForStep` (medium / 500)
/// in `packages/shared/src/engine/compositionDesignMdExporter.ts`.
Color primaryFallbackFromHueChroma(double hue, double chroma) {
  const anchors = <List<num>>[
    [100, 96],
    [200, 90],
    [300, 84],
    [500, 62],
    [700, 48],
    [800, 42],
    [900, 36],
    [1500, 28],
    [1900, 18],
    [2500, 5],
  ];
  const step = 500;
  var loIdx = 0;
  for (var i = 0; i < anchors.length - 1; i++) {
    if (step >= anchors[i][0] && step <= anchors[i + 1][0]) {
      loIdx = i;
      break;
    }
    if (step >= anchors[i + 1][0]) loIdx = i + 1;
  }
  final lo = anchors[math.min(loIdx, anchors.length - 1)];
  final hi = anchors[math.min(loIdx + 1, anchors.length - 1)];
  final loStep = lo[0].toInt();
  final loL = lo[1].toDouble();
  final hiStep = hi[0].toInt();
  final hiL = hi[1].toDouble();
  final span = hiStep - loStep == 0 ? 1 : hiStep - loStep;
  final t = (step - loStep) / span;
  final L = loL + (hiL - loL) * t;

  final distFrom50 = (L - 50).abs() / 50.0;
  final taper = math.max(0.0, 1.0 - distFrom50 * distFrom50);
  final adjustedChroma = chroma * taper;

  return oklchToColor(L, adjustedChroma, hue % 360.0);
}

Color? parseHexColor(String raw) {
  var s = raw.trim();
  if (s.isEmpty) return null;
  if (s.startsWith('#')) s = s.substring(1);
  if (s.length == 6) {
    final n = int.tryParse(s, radix: 16);
    if (n == null) return null;
    return Color(0xFF000000 | n);
  }
  if (s.length == 8) {
    final n = int.tryParse(s, radix: 16);
    if (n == null) return null;
    return Color(n);
  }
  return null;
}

/// Parses `oklch(62% 0.18 280)` style strings (same regex idea as TS `parseOkLCH`).
Color? parseOklchString(String raw) {
  final re = RegExp(r'oklch\(\s*([\d.]+)\s*%\s+([\d.]+)\s+([\d.]+)\s*\)',
      caseSensitive: false);
  final m = re.firstMatch(raw.trim());
  if (m == null) return null;
  final l = double.tryParse(m.group(1)!);
  final c = double.tryParse(m.group(2)!);
  final h = double.tryParse(m.group(3)!);
  if (l == null || c == null || h == null) return null;
  return oklchToColor(l, c, h);
}

Map<String, dynamic>? _asStringKeyedMap(Object? raw) {
  if (raw is Map<String, dynamic>) return raw;
  if (raw is Map) return Map<String, dynamic>.from(raw);
  return null;
}

/// Exact parity with web Dimensions stories: `background: var(--Primary-Bold, …)` at the
/// page root — from Convex `getNativeThemeSnapshot.rootRoles` / `buildNativeTheme`.
Color? primaryBoldFromRootRoles(
  Map<String, dynamic>? rootRoles, {
  String appearance = 'primary',
}) {
  if (rootRoles == null) return null;
  final roleMap = _asStringKeyedMap(rootRoles[appearance]) ??
      _asStringKeyedMap(rootRoles['primary']);
  if (roleMap == null) return null;
  final surfaces = _asStringKeyedMap(roleMap['surfaces']);
  if (surfaces == null) return null;
  final bold = surfaces['bold'];
  if (bold is! String) return null;
  return parseHexColor(bold);
}

/// Web dimension rows use preset primary scale step 700 / 500 when snapshot is unavailable.
Color? _primaryBoldFromPreset(Map<String, dynamic>? overview) {
  if (overview == null) return null;
  final preset = _asStringKeyedMap(overview['presetSelection']);
  if (preset == null) return null;
  final scales = preset['selectedScales'];
  if (scales is! List<dynamic>) return null;

  Map<String, dynamic>? primaryScale;
  for (final item in scales) {
    final itemMap = _asStringKeyedMap(item);
    if (itemMap == null) continue;
    final name = (itemMap['name'] as String?)?.toLowerCase();
    if (name == 'primary') {
      primaryScale = itemMap;
      break;
    }
  }
  if (primaryScale == null) return null;

  final steps = primaryScale['steps'];
  if (steps is! List<dynamic>) return null;

  Map<String, dynamic>? rowForStep(int targetStep) {
    for (final st in steps) {
      final stMap = _asStringKeyedMap(st);
      if (stMap == null) continue;
      final stepVal = stMap['step'];
      final stepNum = switch (stepVal) {
        final int i => i,
        final num n => n.toInt(),
        _ => int.tryParse(stepVal?.toString() ?? ''),
      };
      if (stepNum == targetStep) return stMap;
    }
    return null;
  }

  for (final target in [700, 500]) {
    final row = rowForStep(target);
    if (row == null) continue;
    final hex = row['hex'] as String?;
    if (hex != null) {
      final c = parseHexColor(hex);
      if (c != null) return c;
    }
    final oklch = row['oklch'] as String?;
    if (oklch != null) {
      final c = parseOklchString(oklch);
      if (c != null) return c;
    }
    final l = (row['lightness'] as num?)?.toDouble();
    final cVal = (row['chroma'] as num?)?.toDouble();
    final hVal = (row['hue'] as num?)?.toDouble();
    if (l != null && cVal != null && hVal != null) {
      return oklchToColor(l, cVal, hVal);
    }
  }
  return null;
}

/// Resolves the accent used for dimension foundation bars (Flutter stand-in for CSS `--Primary-Bold`).
///
/// 1. [rootRoles] from `getNativeThemeSnapshot` — **same hex as web** injected `--Primary-Bold`.
/// 2. Preset primary scale (700 / 500) from [brandOverview] (`getBrandOverviewData`).
/// 3. [primaryHue] / [primaryChroma] on the `brands` row (approximate).
Color? resolveDimensionBarAccentColor({
  Map<String, dynamic>? rootRoles,
  Map<String, dynamic>? brandOverview,
  double? primaryHue,
  double? primaryChroma,
}) {
  final fromEngine = primaryBoldFromRootRoles(rootRoles);
  if (fromEngine != null) return fromEngine;
  final fromPreset = _primaryBoldFromPreset(brandOverview);
  if (fromPreset != null) return fromPreset;
  if (primaryHue != null) {
    return primaryFallbackFromHueChroma(primaryHue, primaryChroma ?? 0.15);
  }
  return null;
}
