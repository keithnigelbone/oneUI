import 'package:flutter/material.dart';

/// Parses Convex / design-tool hex strings into [Color] (`0xAARRGGBB`).
///
/// Supports:
/// - `#RGB` → expanded
/// - `#RRGGBB` opaque
/// - **8 digits** — disambiguates:
///   - **CSS** *Color Module* `#RRGGBBAA` (red first, alpha last) — e.g. `#E62828FF`
///   - **Flutter / Skia packed int** `#AARRGGBB` (alpha first) — e.g. `#FFE62828` ==
///     [`Color(0xFFE62828)`] (**opaque brand red `#E62828`**)
///
/// Without disambiguation, `#FFE62828` read as `#RRGGBBAA` makes **alpha = 0x28**
/// (~15% opaque) so **Bold** buttons disappear for brands whose pipeline stores the
/// Flutter-style word (Tira / Reliance / many Android exports).
///
/// Blues (`#FF0053C8` etc.) also break if “CSS alpha must be `< 0x40`” alone — misread alpha is
/// the **blue channel** and is often ≥ 0x40. Prefer `#AARRGGBB` for full leading alpha (`0xFF…`)
/// unless the tail matches **pastel translucent CSS** (see `_oneUiHexColor8`).
Color oneUiHexColor(String hex) {
  var h = hex.replaceFirst('#', '').trim();
  if (h.length == 3) {
    final b = StringBuffer();
    for (var i = 0; i < 3; i++) {
      b.write(h[i]);
      b.write(h[i]);
    }
    h = b.toString();
  }
  if (h.length == 6) {
    final rgb = int.parse(h, radix: 16);
    return Color(0xFF000000 | rgb);
  }
  if (h.length == 8) {
    return _oneUiHexColor8(h);
  }

  throw FormatException(
      'oneUiHexColor: expected #RGB, #RRGGBB or 8-digit #hex, got "$hex"');
}

/// [h] — 8 hex digits, no `#`.
Color _oneUiHexColor8(String h) {
  final lower = h.toLowerCase();

  /// Opaque suffix = canonical CSS `#RRGGBBFF`.
  if (lower.endsWith('ff')) {
    return _colorFromCssRrgbbbaa(h);
  }

  final packed = int.parse(h, radix: 16);
  final rCss = (packed >> 24) & 0xFF;
  final gCss = (packed >> 16) & 0xFF;
  final bCss = (packed >> 8) & 0xFF;
  final aCss = packed & 0xFF;

  final cssColor = Color((aCss << 24) | (rCss << 16) | (gCss << 8) | bCss);
  final flutterWord = Color(packed);

  // Near-white translucent `#FFFFFF??` — keep CSS RR GG BB semantics.
  if (rCss >= 250 && gCss >= 250 && bCss >= 250 && aCss < 254) {
    return cssColor;
  }

  // Light pastel + mid‑range alpha tail (`#FFEEDD80`): canonical translucent CSS `#RRGGBBAA`.
  /// Saturated primaries like `#FF0053C8` fail the pastel thresholds → Android ARGB opaque.
  final isMidAlphaTail = aCss >= 0x40 && aCss <= 0xbf;
  final isPastelRgbHead = rCss >= 248 && gCss >= 216 && bCss >= 216;
  if (flutterWord.alpha >= 0xF8 && isMidAlphaTail && isPastelRgbHead) {
    return cssColor;
  }

  // Remaining `0xFF______` values are overwhelmingly Flutter `#AARRGGBB`.
  if (flutterWord.alpha >= 0xF8) {
    return flutterWord;
  }

  return cssColor;
}

/// Lexical digit order RR GG BB AA → Flutter `AARRGGBB`.
Color _colorFromCssRrgbbbaa(String h) {
  final packed = int.parse(h, radix: 16);
  final r = (packed >> 24) & 0xFF;
  final g = (packed >> 16) & 0xFF;
  final b = (packed >> 8) & 0xFF;
  final a = packed & 0xFF;
  return Color((a << 24) | (r << 16) | (g << 8) | b);
}
