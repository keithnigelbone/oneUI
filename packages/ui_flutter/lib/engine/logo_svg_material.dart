/// Dart port of `applyLogoSvgMaterial` in `Logo.shared.ts`.
library;

import 'dart:math' as math;

import 'logo_material_resolve.dart';

enum OneUiLogoMaterialTarget { fill, stroke, fillStroke }

enum OneUiLogoMaterialGradientType { linear, radial }

OneUiLogoMaterialTarget parseLogoMaterialTarget(String? raw) {
  switch (raw) {
    case 'fill':
      return OneUiLogoMaterialTarget.fill;
    case 'stroke':
      return OneUiLogoMaterialTarget.stroke;
    case 'fill-stroke':
    default:
      return OneUiLogoMaterialTarget.fillStroke;
  }
}

OneUiLogoMaterialGradientType parseLogoMaterialGradientType(String? raw) {
  return raw == 'radial'
      ? OneUiLogoMaterialGradientType.radial
      : OneUiLogoMaterialGradientType.linear;
}

bool _preserveSvgPaint(String value) {
  final t = value.trim();
  return RegExp(
    r'^(none|transparent|inherit|white|#fff|#ffffff|rgb\(255,\s*255,\s*255\)|url\()',
    caseSensitive: false,
  ).hasMatch(t);
}

String _replaceSvgPaintDeclarations(
  String css,
  String paint,
  OneUiLogoMaterialTarget target,
) {
  return css.replaceAllMapped(
    RegExp(r'\b(fill|stroke)\s*:\s*([^;}!]+)(\s*!important)?',
        caseSensitive: false),
    (match) {
      final prop = match.group(1)!;
      final value = match.group(2)!;
      final bang = match.group(3) ?? '';
      final normalizedProp = prop.toLowerCase();
      final shouldReplace = target == OneUiLogoMaterialTarget.fillStroke ||
          (target == OneUiLogoMaterialTarget.fill &&
              normalizedProp == 'fill') ||
          (target == OneUiLogoMaterialTarget.stroke &&
              normalizedProp == 'stroke');
      if (!shouldReplace || _preserveSvgPaint(value)) return match.group(0)!;
      return '$prop: $paint$bang';
    },
  );
}

int normalizeLogoMaterialGradientAngle(num? value) {
  if (value == null || !value.isFinite) return 135;
  var normalized = value % 360;
  if (normalized < 0) normalized += 360;
  return normalized.round();
}

String _formatPercent(double value) {
  final pct = value * 100;
  final rounded = pct == pct.roundToDouble()
      ? pct.round()
      : double.parse(pct.toStringAsFixed(3));
  return '$rounded%';
}

String _linearGradientAttrs(int angle) {
  final radians = angle * math.pi / 180;
  final dx = math.sin(radians);
  final dy = -math.cos(radians);
  final scale = 0.5 / [dx.abs(), dy.abs(), 0.0001].reduce(math.max);
  final x1 = 0.5 - dx * scale;
  final y1 = 0.5 - dy * scale;
  final x2 = 0.5 + dx * scale;
  final y2 = 0.5 + dy * scale;
  return 'x1="${_formatPercent(x1)}" y1="${_formatPercent(y1)}" x2="${_formatPercent(x2)}" y2="${_formatPercent(y2)}"';
}

String _radialGradientAttrs(int angle) {
  if (angle < 22.5 || angle >= 337.5) {
    return 'cx="50%" cy="0%" r="100%" fx="50%" fy="0%"';
  }
  if (angle < 67.5) return 'cx="100%" cy="0%" r="100%" fx="100%" fy="0%"';
  if (angle < 112.5) return 'cx="100%" cy="50%" r="100%" fx="100%" fy="50%"';
  if (angle < 157.5) return 'cx="100%" cy="100%" r="100%" fx="100%" fy="100%"';
  if (angle < 202.5) return 'cx="50%" cy="100%" r="100%" fx="50%" fy="100%"';
  if (angle < 247.5) return 'cx="0%" cy="100%" r="100%" fx="0%" fy="100%"';
  if (angle < 292.5) return 'cx="0%" cy="50%" r="100%" fx="0%" fy="50%"';
  return 'cx="0%" cy="0%" r="100%" fx="0%" fy="0%"';
}

String _injectMetallicGradientDef(
  String svgContent,
  LogoMetallicGradientColors colors,
  String gradientId,
  OneUiLogoMaterialGradientType gradientType,
  int gradientAngle,
) {
  final isRadial = gradientType == OneUiLogoMaterialGradientType.radial;
  final gradientTag = isRadial ? 'radialGradient' : 'linearGradient';
  final gradientAttrs = isRadial
      ? _radialGradientAttrs(gradientAngle)
      : _linearGradientAttrs(gradientAngle);
  final gradient = [
    '<$gradientTag id="$gradientId" $gradientAttrs>',
    '<stop offset="0%" stop-color="${colors.shadow}" />',
    '<stop offset="15%" stop-color="${colors.base}" />',
    '<stop offset="30%" stop-color="${colors.baseLight}" />',
    '<stop offset="45%" stop-color="${colors.highlight}" />',
    '<stop offset="55%" stop-color="${colors.baseLight}" />',
    '<stop offset="70%" stop-color="${colors.base}" />',
    '<stop offset="85%" stop-color="${colors.baseLight}" />',
    '<stop offset="100%" stop-color="${colors.shadow}" />',
    '</$gradientTag>',
  ].join('');

  final defsMatch =
      RegExp(r'<defs\b([^>]*)>', caseSensitive: false).firstMatch(svgContent);
  if (defsMatch != null) {
    return svgContent.replaceFirst(
      defsMatch.group(0)!,
      '<defs${defsMatch.group(1)!}>$gradient',
    );
  }
  final svgMatch =
      RegExp(r'<svg\b([^>]*)>', caseSensitive: false).firstMatch(svgContent);
  if (svgMatch == null) return svgContent;
  return svgContent.replaceFirst(
    svgMatch.group(0)!,
    '<svg${svgMatch.group(1)!}><defs>$gradient</defs>',
  );
}

/// Applies metallic material paint to inline SVG — React `applyLogoSvgMaterial` parity.
String applyLogoSvgMaterial(
  String svgContent, {
  required LogoMetallicGradientColors colors,
  required String gradientId,
  OneUiLogoMaterialTarget target = OneUiLogoMaterialTarget.fillStroke,
  OneUiLogoMaterialGradientType gradientType =
      OneUiLogoMaterialGradientType.linear,
  int? gradientAngle,
}) {
  if (!RegExp(r'<svg\b', caseSensitive: false).hasMatch(svgContent))
    return svgContent;

  final paint = 'url(#$gradientId)';
  var result = svgContent.replaceAll(
    RegExp(
      r'''<rect[^>]*\bfill=["'](?:#fff(?:fff)?|#FFFFFF|white|rgb\(255,\s*255,\s*255\))["'][^>]*\/?\s*>''',
      caseSensitive: false,
    ),
    '',
  );

  result = result.replaceAllMapped(
    RegExp(r'<style\b([^>]*)>([\s\S]*?)<\/style>', caseSensitive: false),
    (match) {
      final attrs = match.group(1)!;
      final css = match.group(2)!;
      return '<style$attrs>${_replaceSvgPaintDeclarations(css, paint, target)}</style>';
    },
  );

  result = result.replaceAllMapped(
    RegExp(r'''\b(fill|stroke)=(["'])([^"']+)\2''', caseSensitive: false),
    (match) {
      final attr = match.group(1)!;
      final quote = match.group(2)!;
      final value = match.group(3)!;
      final normalizedAttr = attr.toLowerCase();
      final shouldReplace = target == OneUiLogoMaterialTarget.fillStroke ||
          (target == OneUiLogoMaterialTarget.fill &&
              normalizedAttr == 'fill') ||
          (target == OneUiLogoMaterialTarget.stroke &&
              normalizedAttr == 'stroke');
      if (!shouldReplace || _preserveSvgPaint(value)) return match.group(0)!;
      return '$attr=$quote$paint$quote';
    },
  );

  result = result.replaceAllMapped(
    RegExp(r'''style=(["'])([^"']*)\1''', caseSensitive: false),
    (match) {
      final quote = match.group(1)!;
      final styles = match.group(2)!;
      return 'style=$quote${_replaceSvgPaintDeclarations(styles, paint, target)}$quote';
    },
  );

  return _injectMetallicGradientDef(
    result,
    colors,
    gradientId,
    gradientType,
    normalizeLogoMaterialGradientAngle(gradientAngle),
  );
}
