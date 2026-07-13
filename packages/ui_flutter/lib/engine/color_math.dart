// ignore_for_file: public_member_api_docs
//
// Dart port of `packages/shared/src/engine/colorMath.ts` — subset needed for
// `surfaceNew.ts` resolution (hex RGB, WCAG contrast, alpha blend, dynamic dir).

import 'dart:math' as math;

import '../utils/one_ui_hex_color.dart';

/// Step → hex — keys are 100, 200, … 2500 (same as TS `ColorPalette`).
typedef ColorPalette = Map<int, String>;

/// [r, g, b] 0–255
typedef Rgb = List<int>;

typedef RgbPalette = Map<int, Rgb>;

final Rgb rgbGray = [128, 128, 128];
final Rgb rgbBlack = [0, 0, 0];
final Rgb rgbWhite = [255, 255, 255];

/// Canonical `#rrggbb` for engine palettes — mirrors TS `normalizeSolidCssHex`.
///
/// Convex / Android sometimes ship **8-digit** `#AARRGGBB` (e.g. Jio `#FF0053C8`).
/// Feeding those strings into contrast math without disambiguation skews every
/// nested `[data-surface-step]` resolution vs web CSS gen.
String normalizePaletteHexForEngine(String hex) {
  final c = oneUiHexColor(hex.trim());
  return rgbToHex(c.red, c.green, c.blue);
}

Rgb hexToRgbTuple(String hex) {
  // Mirrors TS `parseRgbFromHexLoose` / Convex 8‑digit `#AARRGGBB` exports.
  // Regex-only 6-digit parsing returned grey for 8-digit strings → whole
  // `rgbPalette` became (128,128,128) and broke contrast + walk-for-contrast
  // so BoldResolve failed while Ghost/Subtle could still look OK.
  try {
    final c = oneUiHexColor(hex.trim());
    return [c.red, c.green, c.blue];
  } on FormatException {
    final m = RegExp(
      r'^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$',
      caseSensitive: false,
    ).firstMatch(hex);
    if (m == null) return rgbGray;
    return [
      int.parse(m.group(1)!, radix: 16),
      int.parse(m.group(2)!, radix: 16),
      int.parse(m.group(3)!, radix: 16),
    ];
  }
}

String rgbToHex(int r, int g, int b) {
  String h(int n) => n.clamp(0, 255).round().toRadixString(16).padLeft(2, '0');
  return '#${h(r)}${h(g)}${h(b)}';
}

/// Parse every entry of [palette] to RGB once (TS `preParseRGBPalette` without WeakMap).
RgbPalette preParseRGBPalette(ColorPalette palette) {
  final out = <int, Rgb>{};
  for (final e in palette.entries) {
    out[e.key] = hexToRgbTuple(e.value);
  }
  return out;
}

double sRgbToLinear(double value) {
  final normalized = value / 255;
  if (normalized <= 0.03928) {
    return normalized / 12.92;
  }
  return math.pow((normalized + 0.055) / 1.055, 2.4).toDouble();
}

double getRelativeLuminance(int r, int g, int b) {
  final rL = sRgbToLinear(r.toDouble());
  final gL = sRgbToLinear(g.toDouble());
  final bL = sRgbToLinear(b.toDouble());
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}

/// WCAG contrast from two RGB tuples — truncated to 2 decimals like TS.
double getContrastRatioRgb(Rgb rgb1, Rgb rgb2) {
  final l1 = getRelativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
  final l2 = getRelativeLuminance(rgb2[0], rgb2[1], rgb2[2]);
  final lighter = math.max(l1, l2);
  final darker = math.min(l1, l2);
  final ratio = (lighter + 0.05) / (darker + 0.05);
  return (ratio * 100).floorToDouble() / 100;
}

({Rgb rgb, String hex}) blendWithAlphaRgb(Rgb fg, Rgb bg, double alpha) {
  final r = (fg[0] * alpha + bg[0] * (1 - alpha)).round();
  final g = (fg[1] * alpha + bg[1] * (1 - alpha)).round();
  final b = (fg[2] * alpha + bg[2] * (1 - alpha)).round();
  return (rgb: [r, g, b], hex: rgbToHex(r, g, b));
}

/// Binary search (24 iterations) — TS `solveOpacity` in `surfaceNew.ts`.
double solveOpacity(Rgb fgRgb, Rgb bgRgb, double targetContrast) {
  final fullContrast = getContrastRatioRgb(fgRgb, bgRgb);
  if (fullContrast < targetContrast) return 1;

  var lo = 0.0;
  var hi = 1.0;
  for (var i = 0; i < 24; i++) {
    final alpha = (lo + hi) / 2;
    final blended = blendWithAlphaRgb(fgRgb, bgRgb, alpha);
    final contrast = getContrastRatioRgb(blended.rgb, bgRgb);
    if (contrast < targetContrast) {
      lo = alpha;
    } else {
      hi = alpha;
    }
  }
  return hi;
}

/// `'light'` → toward step 2500, `'dark'` → toward 100 (TS naming).
String getDynamicContrastDirectionRgb(Rgb surfaceRgb, RgbPalette rgbPalette) {
  final c2500 = getContrastRatioRgb(rgbPalette[2500] ?? rgbWhite, surfaceRgb);
  final c200 = getContrastRatioRgb(rgbPalette[200] ?? rgbBlack, surfaceRgb);
  return c2500 > c200 ? 'light' : 'dark';
}
