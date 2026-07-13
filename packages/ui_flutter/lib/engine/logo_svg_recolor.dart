import 'package:flutter/widgets.dart';

import '../theme/one_ui_scope.dart';
import '../utils/one_ui_hex_color.dart';
import 'color_math.dart';
import 'logo_figma_svg_normalize.dart';
import 'native_design_system_payload.dart';

/// Result of [prepareLogoSvgForRender] — whether to apply [SvgTheme.currentColor].
class LogoSvgPrepareResult {
  const LogoSvgPrepareResult({
    required this.svg,
    required this.recolored,
    required this.applyCurrentColorTheme,
  });

  final String svg;
  final bool recolored;

  /// When true, [SvgPicture] should use [SvgTheme] so `currentColor` paths pick up
  /// [resolveOneUiLogoColor]. Baked brand marks (Reliance gold, Swadesh gradient) stay false.
  final bool applyCurrentColorTheme;
}

bool _isPreservedPaint(String raw) {
  final t = raw.trim().toLowerCase();
  if (t.isEmpty ||
      t == 'none' ||
      t == 'transparent' ||
      t == 'currentcolor' ||
      t == 'inherit') {
    return true;
  }
  return t.startsWith('url(');
}

/// Mirrors platform `recolorSvgToCurrentColor` — only when appearance config sets `--Logo-color`.
String recolorLogoSvgToCurrentColor(String svg) {
  const preserved = {'none', 'transparent', 'currentcolor', 'inherit'};

  bool keepValue(String value) {
    final t = value.trim().toLowerCase();
    return preserved.contains(t) || t.startsWith('url(');
  }

  String replaceCssDecls(String css) {
    return css.replaceAllMapped(
      RegExp(r'\b(fill|stroke)\s*:\s*([^;}!]+)(\s*!important)?',
          caseSensitive: false),
      (m) {
        final value = m.group(2)!;
        if (keepValue(value)) return m.group(0)!;
        return '${m.group(1)}: currentColor${m.group(3) ?? ''}';
      },
    );
  }

  var result = svg.replaceAllMapped(
    RegExp(r'<style\b([^>]*)>([\s\S]*?)<\/style>', caseSensitive: false),
    (m) => '<style${m.group(1)}>${replaceCssDecls(m.group(2)!)}</style>',
  );

  result = result.replaceAllMapped(
    RegExp(r'\b(fill|stroke)=(["\x27])([^"\x27]+)\2', caseSensitive: false),
    (m) {
      if (keepValue(m.group(3)!)) return m.group(0)!;
      return '${m.group(1)}=${m.group(2)}currentColor${m.group(2)}';
    },
  );

  result = result.replaceAllMapped(
    RegExp(r'''style=(["'])([^"']*)\1''', caseSensitive: false),
    (m) => 'style=${m.group(1)}${replaceCssDecls(m.group(2)!)}${m.group(1)}',
  );

  return result;
}

final RegExp _paintAttrPattern = RegExp(
  r'\b(fill|stroke)=(["\x27])([^"\x27]+)\2',
  caseSensitive: false,
);

final RegExp _paintCssPattern = RegExp(
  r'\b(fill|stroke)\s*:\s*([^;}!\s]+)',
  caseSensitive: false,
);

/// True when the SVG has baked fill/stroke colours (excluding currentColor / gradients).
bool logoSvgHasExplicitPaint(String svg) {
  for (final m in _paintAttrPattern.allMatches(svg)) {
    if (!_isPreservedPaint(m.group(3)!)) return true;
  }
  for (final m in _paintCssPattern.allMatches(svg)) {
    if (!_isPreservedPaint(m.group(2)!)) return true;
  }
  return false;
}

/// Swadesh / metallic marks — `fill="url(#…)"` or `<linearGradient>` in `<defs>`.
bool logoSvgHasGradientPaints(String svg) {
  if (RegExp(r'<(linear|radial)Gradient\b', caseSensitive: false)
      .hasMatch(svg)) {
    return true;
  }
  for (final m in _paintAttrPattern.allMatches(svg)) {
    if (m.group(3)!.trim().toLowerCase().startsWith('url(')) return true;
  }
  for (final m in _paintCssPattern.allMatches(svg)) {
    if (m.group(2)!.trim().toLowerCase().startsWith('url(')) return true;
  }
  return false;
}

bool logoSvgUsesCurrentColorOnly(String svg) {
  return !logoSvgHasExplicitPaint(svg) && !logoSvgHasGradientPaints(svg);
}

/// SVG/CSS named solids — One UI Theme uses `fill="black"`.
const Map<String, String> kLogoCssNamedSolidColors = {
  'black': '#000000',
  'white': '#ffffff',
};

String _normalizePaintColor(String raw) {
  final t = raw.trim();
  if (t.isEmpty) return t;
  final named = kLogoCssNamedSolidColors[t.toLowerCase()];
  if (named != null) return named;
  try {
    final c = oneUiHexColor(t.startsWith('#') ? t : '#$t');
    return rgbToHex(c.red, c.green, c.blue).toLowerCase();
  } on FormatException {
    return t.toLowerCase();
  }
}

/// Distinct solid fill/stroke colours in the SVG (gradients / currentColor excluded).
Set<String> logoSvgDistinctPaintColors(String svg) {
  final colors = <String>{};
  void add(String? raw) {
    if (raw == null) return;
    if (_isPreservedPaint(raw)) return;
    colors.add(_normalizePaintColor(raw));
  }

  for (final m in _paintAttrPattern.allMatches(svg)) {
    add(m.group(3));
  }
  for (final m in _paintCssPattern.allMatches(svg)) {
    add(m.group(2));
  }
  return colors;
}

/// Monochrome baked marks (e.g. Tira red) on a bold tint need `currentColor` when
/// the baked hue matches the painted surface. Multicolour / gradient marks are untouched.
bool logoSvgMonochromeNeedsContrastRecolor({
  required String svg,
  required String surfaceBackgroundHex,
  double minContrastRatio = 3.0,
}) {
  if (logoSvgHasGradientPaints(svg)) return false;
  if (logoSvgUsesCurrentColorOnly(svg)) return false;

  final paints = logoSvgDistinctPaintColors(svg);
  if (paints.isEmpty || paints.length > 1) return false;

  final fg = hexToRgbTuple(paints.first);
  final bg = hexToRgbTuple(surfaceBackgroundHex);
  return getContrastRatioRgb(fg, bg) < minContrastRatio;
}

/// Web Storybook passes `logoSvg` verbatim unless the brand sets `--Logo-color`.
bool hasLogoColorOverride(NativeDesignSystemPayload? ds) {
  if (ds == null) return false;
  final raw = ds.rawComponentCascade(const ['--Logo-color']);
  return raw != null && raw.trim().isNotEmpty;
}

bool hasLogoColorOverrideFromContext(BuildContext context) {
  return hasLogoColorOverride(OneUiScope.designSystemOf(context));
}

/// Strip XML prolog before [SvgPicture.string].
///
/// Also normalizes Figma `foreignObject` exports (Swadesh gold mark) into
/// `linearGradient` fills [flutter_svg] can paint.
String normalizeLogoSvgMarkup(String svg) {
  var s = svg.trim();
  if (s.startsWith('<?xml')) {
    final end = s.indexOf('?>');
    if (end != -1) s = s.substring(end + 2).trimLeft();
  }
  return normalizeFigmaLogoSvg(s);
}

/// Prepare brand SVG — parity with web `Logo.tsx` (`dangerouslySetInnerHTML` as-is).
///
/// Recolour only when the brand configures `--Logo-color` (platform overview) or the
/// asset is already `currentColor`-based (Tira). Never flatten baked gold / gradients.
LogoSvgPrepareResult prepareLogoSvgForRender(
  String raw, {
  bool hasLogoColorOverride = false,
  String? nestedSurfaceBackgroundHex,
}) {
  final normalized = normalizeLogoSvgMarkup(raw);

  if (logoSvgUsesCurrentColorOnly(normalized)) {
    return LogoSvgPrepareResult(
      svg: normalized,
      recolored: false,
      applyCurrentColorTheme: true,
    );
  }

  if (hasLogoColorOverride) {
    return LogoSvgPrepareResult(
      svg: recolorLogoSvgToCurrentColor(normalized),
      recolored: true,
      applyCurrentColorTheme: true,
    );
  }

  if (nestedSurfaceBackgroundHex != null &&
      logoSvgMonochromeNeedsContrastRecolor(
        svg: normalized,
        surfaceBackgroundHex: nestedSurfaceBackgroundHex,
      )) {
    return LogoSvgPrepareResult(
      svg: recolorLogoSvgToCurrentColor(normalized),
      recolored: true,
      applyCurrentColorTheme: true,
    );
  }

  return LogoSvgPrepareResult(
    svg: normalized,
    recolored: false,
    applyCurrentColorTheme: false,
  );
}
