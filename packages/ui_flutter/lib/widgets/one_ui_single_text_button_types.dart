import 'package:flutter/widgets.dart';

import '../theme/surface_scope.dart';
import 'one_ui_button_types.dart';

/// Figma / web `SingleTextButtonSize` — S/M/L only (no XS).
typedef OneUiSingleTextButtonSize = String;

const Set<String> kOneUiSingleTextButtonSizes = {'s', 'm', 'l'};

/// Web `SingleTextButtonAppearance` — canonical 9 roles + tertiary/quaternary + auto.
const List<String> kOneUiSingleTextButtonAppearances = [
  'auto',
  'primary',
  'secondary',
  'tertiary',
  'quaternary',
  'neutral',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
];

/// Figma attention — maps to bold / subtle / ghost (`SingleTextButton.shared.ts`).
enum OneUiSingleTextButtonAttention { high, medium, low }

/// Resolved CSS `data-variant` — derived from [OneUiSingleTextButtonAttention].
enum OneUiSingleTextButtonVariant { bold, subtle, ghost }

OneUiSingleTextButtonVariant oneUiSingleTextButtonVariantFromAttention(
  OneUiSingleTextButtonAttention attention,
) {
  return switch (attention) {
    OneUiSingleTextButtonAttention.high => OneUiSingleTextButtonVariant.bold,
    OneUiSingleTextButtonAttention.medium => OneUiSingleTextButtonVariant.subtle,
    OneUiSingleTextButtonAttention.low => OneUiSingleTextButtonVariant.ghost,
  };
}

/// CSS `data-attention` token suffix (`high` / `medium` / `low`).
String oneUiSingleTextButtonAttentionKey(OneUiSingleTextButtonAttention attention) {
  return attention.name;
}

OneUiSingleTextButtonSize oneUiResolveSingleTextButtonSize(String? size) {
  final key = (size ?? 'm').trim().toLowerCase();
  if (kOneUiSingleTextButtonSizes.contains(key)) return key;
  return 'm';
}

String resolveOneUiSingleTextButtonAppearance(
  BuildContext context,
  String appearance,
) {
  return resolveOneUiButtonAppearance(context, appearance);
}

/// Label role key for typography — `Label-S` / `Label-M` / `Label-L`.
String oneUiSingleTextButtonLabelKey(OneUiSingleTextButtonSize size) {
  return switch (size) {
    's' => 'S',
    'l' => 'L',
    _ => 'M',
  };
}

String oneUiTruncateSingleTextButtonLabel(String label) {
  if (label.length <= 2) return label;
  assert(() {
    debugPrint(
      'OneUiSingleTextButton: label "$label" exceeds 2 characters. '
      'Truncating to 2 characters.',
    );
    return true;
  }());
  return label.substring(0, 2);
}
