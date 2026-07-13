import 'package:flutter/widgets.dart';

import '../theme/surface_scope.dart';

/// Portable Input API — mirrors `Input.shared.ts` / RN `interface.ts`.

/// Figma API size tiers (`xs` → f6 on native; web coerces `xs` → `s`).
const List<String> kOneUiInputFigmaSizes = ['xs', 's', 'm', 'l'];

/// Figma API appearance roles (+ `auto`). `brand-bg` is not wired in Input CSS.
const List<String> kOneUiInputFigmaAppearances = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'informative',
  'warning',
];

enum OneUiInputAppearance {
  auto,
  primary,
  secondary,
  neutral,
  sparkle,
  positive,
  negative,
  warning,
  informative,
}

enum OneUiInputShape { defaultShape, pill }

enum OneUiInputAttention { medium, high }

/// Web `labelAssociation` — `field` skips the built-in label stack (InputField owns it).
enum OneUiInputLabelAssociation { native, field }

/// Figma XS / S / M / L → f6 / f8 / f10 / f12 (RN `InputNumericSize`).
typedef OneUiInputNumericSize = int;

/// T-shirt tiers — RN `InputSize` / web `InputSize` (native ships XS; web coerces XS→S).
enum OneUiInputSize { xs, s, m, l }

enum OneUiInputLabelSize { s, m, l }

const kOneUiInputNumericSizes = [6, 8, 10, 12];

const kOneUiInputAppearances = [
  OneUiInputAppearance.primary,
  OneUiInputAppearance.secondary,
  OneUiInputAppearance.neutral,
  OneUiInputAppearance.sparkle,
  OneUiInputAppearance.positive,
  OneUiInputAppearance.negative,
  OneUiInputAppearance.warning,
  OneUiInputAppearance.informative,
];

extension OneUiInputAppearanceX on OneUiInputAppearance {
  String get wireValue => switch (this) {
        OneUiInputAppearance.auto => 'auto',
        OneUiInputAppearance.primary => 'primary',
        OneUiInputAppearance.secondary => 'secondary',
        OneUiInputAppearance.neutral => 'neutral',
        OneUiInputAppearance.sparkle => 'sparkle',
        OneUiInputAppearance.positive => 'positive',
        OneUiInputAppearance.negative => 'negative',
        OneUiInputAppearance.warning => 'warning',
        OneUiInputAppearance.informative => 'informative',
      };
}

extension OneUiInputShapeX on OneUiInputShape {
  String get wireValue => this == OneUiInputShape.pill ? 'pill' : 'default';
}

extension OneUiInputAttentionX on OneUiInputAttention {
  String get wireValue => name;
}

/// Accepts [OneUiInputSize], f-step ints (`6|8|10|12`), or string aliases.
OneUiInputNumericSize resolveOneUiInputNumericSize(Object? size) {
  if (size is OneUiInputSize) {
    return switch (size) {
      OneUiInputSize.xs => 6,
      OneUiInputSize.s => 8,
      OneUiInputSize.m => 10,
      OneUiInputSize.l => 12,
    };
  }
  if (size is int) {
    if (size == 6 || size == 8 || size == 10 || size == 12) return size;
    return 10;
  }
  if (size is String) {
    switch (size) {
      case 'xs':
        return 6;
      case 's':
      case 'small':
        return 8;
      case 'm':
      case 'medium':
        return 10;
      case 'l':
      case 'large':
        return 12;
    }
  }
  return 10;
}

OneUiInputLabelSize oneUiInputSizeToLabelSize(OneUiInputNumericSize numeric) {
  if (numeric <= 8) return OneUiInputLabelSize.s;
  if (numeric <= 10) return OneUiInputLabelSize.m;
  return OneUiInputLabelSize.l;
}

/// Web `useInputState` — `auto` inherits nearest Surface role, else `secondary`.
/// `brand-bg` falls back to `secondary` (no input affordance tokens).
String resolveOneUiInputAppearance(
  OneUiInputAppearance? appearance, {
  String? parentAppearance,
}) {
  if (appearance != null && appearance != OneUiInputAppearance.auto) {
    return appearance.wireValue;
  }
  final parent = parentAppearance?.trim().toLowerCase();
  if (parent != null && parent.isNotEmpty && parent != 'brand-bg') {
    return parent;
  }
  return 'secondary';
}

String? resolveOneUiInputParentAppearance(BuildContext context) {
  final surface = OneUiSurfaceScope.maybeOf(context);
  if (surface != null && surface.surfaceDepth > 0) {
    return surface.parentAppearance;
  }
  return null;
}
