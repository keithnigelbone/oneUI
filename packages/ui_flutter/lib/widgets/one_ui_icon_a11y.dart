/// Accessibility helpers for [OneUiIcon] — parity with
/// `packages/ui-native/src/icons/interface.ts` (`formatIconName`, shell props).
library;

import 'package:flutter/foundation.dart';

/// Formats catalog / semantic icon ids into a human-readable default label.
String formatOneUiIconName(String iconName) {
  if (iconName.startsWith('Ic')) {
    final words = RegExp(r'[A-Z][a-z]+').allMatches(iconName.substring(2));
    if (words.isNotEmpty) {
      return '${words.map((m) => m.group(0)!.toLowerCase()).join(' ')} icon';
    }
    return iconName;
  }
  if (iconName.startsWith('ic_')) {
    final words = iconName.substring(3).split('_');
    if (words.isNotEmpty) {
      return '${words.join(' ').toLowerCase()} icon';
    }
    return iconName;
  }
  if (RegExp(r'^[a-z][a-zA-Z0-9]*$').hasMatch(iconName)) {
    return iconName
        .replaceAllMapped(
          RegExp(r'([a-z])([A-Z])'),
          (m) => '${m[1]} ${m[2]}',
        )
        .toLowerCase();
  }
  return iconName
      .replaceAll(RegExp(r'[-_]+'), ' ')
      .split(' ')
      .map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}')
      .join(' ')
      .trim();
}

/// Whether the icon is exposed to assistive tech (web `role="img"` + label).
bool oneUiIconIsExposedToA11y({
  String? ariaLabel,
  bool? ariaHidden,
}) {
  if (ariaHidden == true) return false;
  final label = ariaLabel?.trim();
  return label != null && label.isNotEmpty;
}

/// Whether [label] contains at least one visible glyph after stripping
/// zero-width / format characters that screen readers cannot announce.
bool oneUiIconLabelHasVisibleGlyphs(String label) {
  final withoutInvisible = label.replaceAll(
    RegExp(r'[\u200B-\u200D\uFEFF\u2060\u00AD\u180E]'),
    '',
  );
  return withoutInvisible.trim().isNotEmpty;
}

String? oneUiIconEffectiveLabel({
  String? ariaLabel,
  bool? ariaHidden,
  String? semanticIconName,
}) {
  if (ariaHidden == true) return null;

  if (ariaLabel != null && ariaLabel.trim().isEmpty) {
    assert(() {
      FlutterError.reportError(
        FlutterErrorDetails(
          exception: FlutterError(
            'OneUiIcon: `semanticsLabel` must not be empty or whitespace-only; '
            'icon is treated as decorative.',
          ),
          library: 'ui_flutter',
          context:
              ErrorDescription('while resolving OneUiIcon accessibility label'),
        ),
      );
      return true;
    }());
    return null;
  }

  if (ariaLabel != null &&
      ariaLabel.trim().isNotEmpty &&
      !oneUiIconLabelHasVisibleGlyphs(ariaLabel)) {
    assert(() {
      FlutterError.reportError(
        FlutterErrorDetails(
          exception: FlutterError(
            'OneUiIcon: `semanticsLabel` contains no visible glyphs after '
            'stripping zero-width / format characters; icon is treated as '
            'decorative.',
          ),
          library: 'ui_flutter',
          context:
              ErrorDescription('while resolving OneUiIcon accessibility label'),
        ),
      );
      return true;
    }());
    return null;
  }

  if (!oneUiIconIsExposedToA11y(ariaLabel: ariaLabel, ariaHidden: ariaHidden)) {
    return null;
  }
  final explicit = ariaLabel?.trim();
  if (explicit != null && explicit.isNotEmpty) return explicit;
  if (semanticIconName != null && semanticIconName.isNotEmpty) {
    return formatOneUiIconName(semanticIconName);
  }
  return null;
}
