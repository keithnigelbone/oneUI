import 'package:flutter/foundation.dart';

/// Web `Button.module.css` — `text-transform` is case-insensitive in CSS.
String buttonDisplayLabelForTextTransform(
    String resolvedCss, String plainLabel) {
  switch (resolvedCss.trim().toLowerCase()) {
    case 'uppercase':
      return plainLabel.toUpperCase();
    case 'none':
    case 'normal':
    case 'capitalize':
    case 'lowercase':
      return plainLabel;
    default:
      if (kDebugMode && resolvedCss.trim().isNotEmpty) {
        debugPrint(
          'OneUiButton: unsupported --Button-textTransform "$resolvedCss"; treating as normal.',
        );
      }
      return plainLabel;
  }
}

/// Parses `--Button-letterSpacing` — CSS units `normal`, `em`, `px`, `rem`, `ch`.
double? buttonLetterSpacingPxFromCss(
  String resolvedCss, {
  required double fontSizePx,
  double remBasePx = 14,
}) {
  final t = resolvedCss.trim().toLowerCase();
  if (t.isEmpty || t == 'normal') return null;

  final unitMatch = RegExp(r'^(-?[\d.]+)\s*(em|px|rem|ch)$').firstMatch(t);
  if (unitMatch == null) {
    if (kDebugMode) {
      debugPrint(
        'OneUiButton: unsupported --Button-letterSpacing "$resolvedCss"; using typography default.',
      );
    }
    return null;
  }

  final value = double.tryParse(unitMatch.group(1)!);
  if (value == null) return null;

  return switch (unitMatch.group(2)) {
    'em' => value * fontSizePx,
    'px' => value,
    'rem' => value * remBasePx,
    // CSS `ch` ≈ width of "0" — reasonable approximation for label tracking.
    'ch' => value * fontSizePx * 0.5,
    _ => null,
  };
}
