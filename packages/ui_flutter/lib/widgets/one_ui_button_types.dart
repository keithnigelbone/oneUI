import 'package:flutter/widgets.dart';

import '../theme/surface_scope.dart';

/// Web `type` on `<button>` — [OneUiButton] participates in [Form] validation or reset.
enum OneUiSemanticButtonType {
  button,
  submit,
  reset,
}

const Set<int> _kOneUiValidSizeSteps = {6, 8, 10, 12};

/// Figma / web [ButtonSize] — f-step or t-shirt / legacy alias (`Button.shared.ts`).
int oneUiResolveButtonSizeStep({
  int size = 10,
  String? sizeAlias,
}) {
  var s = size;
  final a = sizeAlias?.trim().toLowerCase();
  if (a != null && a.isNotEmpty) {
    const alias = <String, int>{
      'xs': 6,
      's': 8,
      'm': 10,
      'l': 12,
      'small': 8,
      'medium': 10,
      'large': 12,
      '2xs': 6,
      'xl': 12,
      '2xl': 12,
    };
    s = alias[a] ?? s;
  }
  if (_kOneUiValidSizeSteps.contains(s)) return s;
  const deprecated = <int, int>{7: 8, 14: 12, 16: 12};
  return deprecated[s] ?? 10;
}

/// Figma / API appearance roles (+ `auto` → parent / `primary`).
const List<String> kOneUiButtonAppearances = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'informative',
  'warning',
  'brand-bg',
];

/// Web `resolveButtonStateBase` — `auto` inherits surface parent, else `primary`.
String resolveOneUiButtonAppearance(BuildContext context, String appearance) {
  final surface = OneUiSurfaceScope.maybeOf(context);
  if (surface == null) {
    final key = appearance.trim().toLowerCase();
    if (key.isEmpty || key == 'auto') return 'primary';
    return key;
  }
  return OneUiSurfaceScope.effectiveSurfaceAppearance(surface, appearance);
}

/// `auto` is always valid; explicit roles must exist on the brand theme.
bool isOneUiButtonAppearanceConfigured(
    BuildContext context, String appearance) {
  final raw = appearance.trim().toLowerCase();
  if (raw.isEmpty || raw == 'auto') return true;
  return OneUiSurfaceScope.isAppearanceConfigured(context, appearance);
}

/// Shared types for token-backed [OneUiButton] (web `Button` / `LinkButton` attention model).
/// Figma attention levels — maps to [OneUiButtonVariant] like web `attention` prop.
enum OneUiButtonAttention { high, medium, low }

/// Web `variant` / CSS `data-variant` (`bold` / `subtle` / `ghost`).
enum OneUiButtonVariant { bold, subtle, ghost }

OneUiButtonVariant oneUiVariantFromAttention(OneUiButtonAttention a) {
  switch (a) {
    case OneUiButtonAttention.high:
      return OneUiButtonVariant.bold;
    case OneUiButtonAttention.medium:
      return OneUiButtonVariant.subtle;
    case OneUiButtonAttention.low:
      return OneUiButtonVariant.ghost;
  }
}

String oneUiLabelSizeCssKey(int size) {
  switch (size) {
    case 6:
      return 'XS';
    case 8:
      return 'S';
    case 10:
      return 'M';
    case 12:
      return 'L';
  }
  return 'M';
}

String oneUiVariantCssSuffix(OneUiButtonVariant v) {
  switch (v) {
    case OneUiButtonVariant.bold:
      return 'bold';
    case OneUiButtonVariant.subtle:
      return 'subtle';
    case OneUiButtonVariant.ghost:
      return 'ghost';
  }
}
