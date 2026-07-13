/// Pure SVG helpers for button ornaments — Dart port of
/// `packages/shared/src/utils/ornamentSvg.ts` (extractSvgContent, getOpenStrokePath, mirrorSvg).
library;

import 'dart:ui' show Color;

/// Parsed `viewBox="min-x min-y width height"`.
class OrnamentViewBox {
  const OrnamentViewBox({
    required this.x,
    required this.y,
    required this.width,
    required this.height,
  });

  final double x;
  final double y;
  final double width;
  final double height;

  String get cssString {
    String f(double n) => n == n.roundToDouble() ? '${n.round()}' : '$n';
    return '${f(x)} ${f(y)} ${f(width)} ${f(height)}';
  }
}

OrnamentViewBox? extractOrnamentViewBox(String svgContent) {
  final match = RegExp(
    r'''viewBox\s*=\s*(["'])([^"']*)\1''',
    caseSensitive: false,
  ).firstMatch(svgContent);
  if (match == null) return null;
  final parts = match.group(2)!.trim().split(RegExp(r'[\s,]+'));
  if (parts.length != 4) return null;
  final nums = parts.map(double.tryParse).toList();
  if (nums.any((n) => n == null)) return null;
  return OrnamentViewBox(
    x: nums[0]!,
    y: nums[1]!,
    width: nums[2]!,
    height: nums[3]!,
  );
}

/// Inner SVG markup (between `<svg>` and `</svg>`) with source paint stripped.
class ExtractedOrnamentSvg {
  const ExtractedOrnamentSvg(
      {required this.innerMarkup, required this.viewBox});

  final String innerMarkup;
  final String viewBox;
}

final RegExp _paintAttributeRegex = RegExp(
  r'''\s(?:fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-miterlimit|stroke-dasharray|stroke-dashoffset|fill-opacity|stroke-opacity|paint-order|vector-effect|opacity)\s*=\s*["'][^"']*["']''',
  caseSensitive: false,
);
final RegExp _styleBlockRegex =
    RegExp(r'<style\b[^>]*>[\s\S]*?<\/style>', caseSensitive: false);
final RegExp _styleAttributeRegex = RegExp(
  r'''\sstyle\s*=\s*(["'])(.*?)\1''',
  caseSensitive: false,
  dotAll: true,
);
final RegExp _classAttributeRegex = RegExp(
  r'''\sclass\s*=\s*["'][^"']*["']''',
  caseSensitive: false,
);
final RegExp _paintStylePropertyRegex = RegExp(
  r'^(?:fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-miterlimit|stroke-dasharray|stroke-dashoffset|fill-opacity|stroke-opacity|paint-order|vector-effect|opacity)\s*:',
  caseSensitive: false,
);

String _stripOrnamentSourcePaint(String markup) {
  var s = markup.replaceAll(_styleBlockRegex, '');
  s = s.replaceAllMapped(_styleAttributeRegex, (m) {
    final quote = m.group(1)!;
    final rawStyle = m.group(2)!;
    final declarations = rawStyle
        .split(';')
        .map((d) => d.trim())
        .where((d) => d.isNotEmpty)
        .where((d) => !_paintStylePropertyRegex.hasMatch(d))
        .toList();
    if (declarations.isEmpty) return '';
    return ' style=$quote${declarations.join('; ')};$quote';
  });
  s = s.replaceAll(_paintAttributeRegex, '');
  s = s.replaceAll(_classAttributeRegex, '');
  return s;
}

ExtractedOrnamentSvg? extractOrnamentSvgContent(String svgContent) {
  final vb = extractOrnamentViewBox(svgContent);
  if (vb == null) return null;
  final innerMatch = RegExp(r'<svg[^>]*>([\s\S]*)<\/svg>', caseSensitive: false)
      .firstMatch(svgContent);
  if (innerMatch == null) return null;
  final inner = _stripOrnamentSourcePaint(innerMatch.group(1)!);
  return ExtractedOrnamentSvg(innerMarkup: inner, viewBox: vb.cssString);
}

/// First `<path d="...">` with closing `Z` removed — open silhouette for fill/stroke (web `getOpenStrokePath`).
String? getOrnamentOpenStrokePath(String svgContent) {
  final m = RegExp(
    r'''<path\b[^>]*\bd\s*=\s*(["'])([^"']*)\1''',
    caseSensitive: false,
  ).firstMatch(svgContent);
  if (m == null) return null;
  return m.group(2)!.replaceAll(RegExp(r'\s*[Zz]\s*'), ' ').trim();
}

/// Wrap inner content in `<g transform="translate(width,0) scale(-1,1)">` (web / RN left edge).
String mirrorOrnamentSvg(String svgContent) {
  final vb = extractOrnamentViewBox(svgContent);
  if (vb == null) return svgContent;
  final w = vb.width;
  return svgContent.replaceFirstMapped(
    RegExp(r'(<svg[^>]*>)([\s\S]*)(<\/svg>)', caseSensitive: false),
    (m) =>
        '${m[1]}<g transform="translate($w,0) scale(-1,1)">${m[2]}</g>${m[3]}',
  );
}

/// Flutter `Color` → SVG/CSS hex (with alpha when not opaque).
///
/// Transparent fills must serialize as **`#RRGGBBAA`** (`a = 00`) — emitting `#RRGGBB`
/// for `Colors.transparent` becomes **`#000000`** (opaque black) and ghost ornaments paint black.
String svgCssColorHex(Color color) {
  final v = color.toARGB32();
  final a = (v >> 24) & 0xff;
  final r = (v >> 16) & 0xff;
  final g = (v >> 8) & 0xff;
  final b = v & 0xff;
  String h2(int n) => n.toRadixString(16).padLeft(2, '0').toUpperCase();
  if (a == 0xff) {
    return '#${h2(r)}${h2(g)}${h2(b)}';
  }
  // CSS/SVG `#RRGGBBAA`
  return '#${h2(r)}${h2(g)}${h2(b)}${h2(a)}';
}
