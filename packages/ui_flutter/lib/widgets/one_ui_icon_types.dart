/// Types for [OneUiIcon] — parity with `packages/ui/src/components/Icon/Icon.shared.ts`.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import '../theme/surface_scope.dart';

/// Figma spacing-index sizes (20 presets) → `--Spacing-*` tokens.
typedef OneUiIconSize = String;

const List<OneUiIconSize> kOneUiIconSizes = [
  '2',
  '2.5',
  '3',
  '3.5',
  '4',
  '4.5',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '12',
  '14',
  '16',
  '18',
  '20',
  '24',
  '32',
  '40',
];

/// Eight appearance roles from Figma (no `brand-bg` on the Icon glyph scale).
typedef OneUiIconAppearance = String;

const List<OneUiIconAppearance> kOneUiIconAppearances = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
];

/// On-colour emphasis — maps to `--{Role}-High`, `Medium-Text`, etc.
enum OneUiIconEmphasis {
  high,
  medium,
  low,
  tinted,
  tintedA11y,
}

/// High-contrast accessibility mode promotes low-contrast tinted glyphs to the
/// WCAG-safe tintedA11y token while leaving stronger emphasis levels unchanged.
OneUiIconEmphasis resolveOneUiIconEmphasis(
  BuildContext context,
  OneUiIconEmphasis emphasis,
) {
  final highContrast = MediaQuery.maybeOf(context)?.highContrast ?? false;
  if (highContrast && emphasis == OneUiIconEmphasis.tinted) {
    return OneUiIconEmphasis.tintedA11y;
  }
  return emphasis;
}

/// Resolved state for [OneUiIcon] (web `useIconState` + `data-*` attrs).
class OneUiIconResolvedState {
  const OneUiIconResolvedState({
    required this.size,
    required this.appearance,
    required this.emphasis,
  });

  final OneUiIconSize size;
  final OneUiIconAppearance appearance;
  final OneUiIconEmphasis emphasis;

  /// Web `data-size` / `data-appearance` / `data-emphasis` parity for tests & tooling.
  Map<String, String> get dataAttributes => {
        'data-size': size,
        'data-appearance': appearance,
        'data-emphasis': emphasis.name,
      };
}

OneUiIconAppearance slotRoleToIconAppearance(String slotParentRole) {
  if (slotParentRole == 'brand-bg') return 'primary';
  if (kOneUiIconAppearances.contains(slotParentRole)) {
    return slotParentRole;
  }
  return 'neutral';
}

/// Validates Figma spacing-index size; unknown values fall back to `'5'`.
OneUiIconSize oneUiResolveIconSize(OneUiIconSize size) {
  final t = size.trim();
  if (kOneUiIconSizes.contains(t)) return t;
  assert(() {
    FlutterError.reportError(
      FlutterErrorDetails(
        exception: FlutterError(
          'OneUiIcon: unknown size "$size"; falling back to "5". '
          'Valid sizes: ${kOneUiIconSizes.join(", ")}.',
        ),
        library: 'ui_flutter',
        context: ErrorDescription('while resolving OneUiIcon size'),
      ),
    );
    return true;
  }());
  return '5';
}

/// Figma `appearance` variable mode — `auto` inherits nested surface parent,
/// then [slotParentAppearance], then root surface role; unset uses slot parent
/// then `neutral` (web `useIconState` + RN `appearanceProp ?? slotParent`).
String resolveOneUiIconAppearance(
  BuildContext context, {
  OneUiIconAppearance? appearance,
  OneUiIconAppearance? slotParentAppearance,
}) {
  final raw = appearance?.trim().toLowerCase();
  if (raw != null && raw.isNotEmpty && raw != 'auto') {
    return slotRoleToIconAppearance(raw);
  }

  final isAuto = raw == 'auto';
  final surface = OneUiSurfaceScope.maybeOf(context);

  // `auto` precedence: nested surface (depth > 0) → slot parent → root surface.
  if (isAuto && surface != null && surface.surfaceDepth > 0) {
    return slotRoleToIconAppearance(
      OneUiSurfaceScope.effectiveSurfaceAppearance(surface, 'auto'),
    );
  }

  if (slotParentAppearance != null) {
    return slotRoleToIconAppearance(slotParentAppearance);
  }

  // Depth-0 page surface (Storybook root → primary); only when appearance is `auto`.
  if (isAuto && surface != null) {
    return slotRoleToIconAppearance(
      OneUiSurfaceScope.effectiveSurfaceAppearance(surface, 'auto'),
    );
  }

  return 'neutral';
}

/// `auto` is always valid; explicit roles must exist on the active brand theme.
bool isOneUiIconAppearanceConfigured(
  BuildContext context,
  OneUiIconAppearance? appearance,
) {
  final raw = appearance?.trim().toLowerCase();
  if (raw == null || raw.isEmpty || raw == 'auto') return true;
  return OneUiSurfaceScope.isAppearanceConfigured(context, raw);
}

/// Pure resolver for data attrs — mirrors web `useIconState` (no BuildContext).
///
/// Intentionally narrower than [resolveOneUiIconAppearance]: without a
/// [BuildContext], `auto` cannot walk the nested-surface chain or the depth-0
/// root-surface fallback (page `primary`), so `appearance: auto` + no slot parent
/// resolves to `neutral` here while the widget resolver reads root surface.
/// `appearance: auto` + [slotParentAppearance] uses the slot parent here, while
/// the widget resolver prefers nested [OneUiSurface] first.
/// [OneUiIcon] always paints via [resolveOneUiIconAppearance]; this helper is
/// for unit tests and `data-*` tooling only.
OneUiIconResolvedState resolveOneUiIconState({
  OneUiIconSize size = '5',
  OneUiIconAppearance? appearance,
  OneUiIconEmphasis emphasis = OneUiIconEmphasis.high,
  OneUiIconAppearance? slotParentAppearance,
}) {
  final resolvedSize = oneUiResolveIconSize(size);
  final raw = appearance?.trim().toLowerCase();
  final resolvedAppearance = (raw != null && raw.isNotEmpty && raw != 'auto')
      ? slotRoleToIconAppearance(raw)
      : (slotParentAppearance != null
          ? slotRoleToIconAppearance(slotParentAppearance)
          : 'neutral');
  return OneUiIconResolvedState(
    size: resolvedSize,
    appearance: resolvedAppearance,
    emphasis: emphasis,
  );
}
