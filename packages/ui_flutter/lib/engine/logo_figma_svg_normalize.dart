import 'dart:convert';

import 'color_math.dart';

/// Figma SVG exports use `foreignObject` + HTML `conic-gradient` and
/// `data-figma-gradient-fill` metadata. Browsers paint them via [dangerouslySetInnerHTML];
/// [flutter_svg] ignores `foreignObject` and inherits `fill="none"` from the root — invisible.
bool logoSvgNeedsFigmaNormalization(String svg) {
  if (svg.contains('foreignObject')) return true;
  if (svg.contains('data-figma-gradient-fill')) return true;
  if (svg.contains('GRADIENT_ANGULAR')) return true;
  return false;
}

String _decodeHtmlEntities(String raw) {
  return raw
      .replaceAll('&#34;', '"')
      .replaceAll('&quot;', '"')
      .replaceAll('&#39;', "'")
      .replaceAll('&amp;', '&');
}

String _rgbaToHex(int r, int g, int b) => rgbToHex(r, g, b);

String _figmaGradientId(String svg) => 'oneui-figma-logo-${svg.hashCode.abs()}';

/// One gradient stop for SVG `<stop>` emission.
class _FigmaGradientStop {
  const _FigmaGradientStop({required this.offset, required this.colorHex});

  final double offset;
  final String colorHex;
}

List<_FigmaGradientStop>? _parseConicGradientStops(String svg) {
  final conic = RegExp(
    r'conic-gradient\s*\(\s*from\s+[\d.]+deg\s*,\s*([^)]+)\)',
    caseSensitive: false,
  ).firstMatch(svg);
  if (conic == null) return null;

  final body = conic.group(1)!;
  final stopPattern = RegExp(
    r'rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)\s*([\d.]+)deg',
    caseSensitive: false,
  );

  final stops = <_FigmaGradientStop>[];
  for (final m in stopPattern.allMatches(body)) {
    final deg = double.tryParse(m.group(4)!);
    if (deg == null) continue;
    stops.add(
      _FigmaGradientStop(
        offset: (deg / 360).clamp(0.0, 1.0),
        colorHex: _rgbaToHex(
          int.parse(m.group(1)!),
          int.parse(m.group(2)!),
          int.parse(m.group(3)!),
        ),
      ),
    );
  }
  if (stops.isEmpty) return null;
  stops.sort((a, b) => a.offset.compareTo(b.offset));
  return stops;
}

List<_FigmaGradientStop>? _parseFigmaJsonGradientStops(String svg) {
  final attr = RegExp(
    r'data-figma-gradient-fill="([^"]+)"',
    caseSensitive: false,
  ).firstMatch(svg);
  if (attr == null) return null;

  try {
    final json =
        jsonDecode(_decodeHtmlEntities(attr.group(1)!)) as Map<String, dynamic>;
    final rawStops = json['stops'];
    if (rawStops is! List) return null;

    final stops = <_FigmaGradientStop>[];
    for (final entry in rawStops) {
      if (entry is! Map) continue;
      final color = entry['color'];
      final position = entry['position'];
      if (color is! Map || position is! num) continue;
      final r = ((color['r'] as num?) ?? 0) * 255;
      final g = ((color['g'] as num?) ?? 0) * 255;
      final b = ((color['b'] as num?) ?? 0) * 255;
      stops.add(
        _FigmaGradientStop(
          offset: position.toDouble().clamp(0.0, 1.0),
          colorHex: _rgbaToHex(r.round(), g.round(), b.round()),
        ),
      );
    }
    if (stops.isEmpty) return null;
    stops.sort((a, b) => a.offset.compareTo(b.offset));
    return stops;
  } catch (_) {
    return null;
  }
}

String? _extractLogoPathD(String svg) {
  final dataPath = RegExp(
    r'<path\b[^>]*\bdata-figma-gradient-fill="[^"]*"[^>]*\bd="([^"]+)"',
    caseSensitive: false,
    dotAll: true,
  ).firstMatch(svg);
  if (dataPath != null) return dataPath.group(1);

  final dataPathAlt = RegExp(
    r'<path\b[^>]*\bd="([^"]+)"[^>]*\bdata-figma-gradient-fill="[^"]*"',
    caseSensitive: false,
    dotAll: true,
  ).firstMatch(svg);
  if (dataPathAlt != null) return dataPathAlt.group(1);

  final clipPath = RegExp(
    r'<clipPath[^>]*>\s*<path\b[^>]*\bd="([^"]+)"',
    caseSensitive: false,
    dotAll: true,
  ).firstMatch(svg);
  return clipPath?.group(1);
}

String? _extractViewBox(String svg) {
  final m = RegExp(r'''viewBox=["']([^"']+)["']''', caseSensitive: false)
      .firstMatch(svg);
  return m?.group(1);
}

String _buildLinearGradientDef(String id, List<_FigmaGradientStop> stops) {
  final stopXml = stops
      .map(
        (s) =>
            '<stop offset="${(s.offset * 100).toStringAsFixed(2)}%" stop-color="${s.colorHex}"/>',
      )
      .join();
  return '<linearGradient id="$id" x1="0%" y1="0%" x2="100%" y2="100%">$stopXml</linearGradient>';
}

/// Converts Figma `foreignObject` / angular-gradient exports into plain SVG
/// `linearGradient` fills that [flutter_svg] can rasterize.
String normalizeFigmaLogoSvg(String svg) {
  if (!logoSvgNeedsFigmaNormalization(svg)) return svg;

  final pathD = _extractLogoPathD(svg);
  if (pathD == null || pathD.trim().isEmpty) return svg;

  final stops =
      _parseConicGradientStops(svg) ?? _parseFigmaJsonGradientStops(svg);
  if (stops == null || stops.isEmpty) return svg;

  final viewBox = _extractViewBox(svg) ?? '0 0 100 100';
  final gradientId = _figmaGradientId(svg);
  final gradientDef = _buildLinearGradientDef(gradientId, stops);

  return '<svg viewBox="$viewBox" xmlns="http://www.w3.org/2000/svg">'
      '<defs>$gradientDef</defs>'
      '<path d="$pathD" fill="url(#$gradientId)"/>'
      '</svg>';
}
