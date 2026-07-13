/// Types for [OneUiIconContained] — parity with `IconContained.shared.ts`.
library;

import 'package:flutter/widgets.dart';

import '../theme/surface_scope.dart';

/// High (bold fill) · Medium (subtle fill).
enum OneUiIconContainedAttention {
  high,
  medium,
}

typedef OneUiIconContainedSize = String;

const List<OneUiIconContainedSize> kOneUiIconContainedSizes = [
  'xs',
  's',
  'm',
  'l',
  'xl',
];

/// Nine appearance roles + `auto` (resolves to `primary`).
typedef OneUiIconContainedAppearance = String;

const List<OneUiIconContainedAppearance> kOneUiIconContainedAppearances = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
];

class OneUiIconContainedResolvedState {
  const OneUiIconContainedResolvedState({
    required this.size,
    required this.attention,
    required this.appearance,
    required this.isDisabled,
  });

  final OneUiIconContainedSize size;
  final OneUiIconContainedAttention attention;
  final OneUiIconContainedAppearance appearance;
  final bool isDisabled;

  Map<String, String> get dataAttributes => {
        'data-size': size,
        'data-attention': attention.name,
        'data-appearance': appearance,
      };
}

/// Validates Figma t-shirt size; unknown values fall back to `'m'`.
OneUiIconContainedSize oneUiResolveIconContainedSize(
    OneUiIconContainedSize size) {
  final t = size.trim().toLowerCase();
  if (kOneUiIconContainedSizes.contains(t)) return t;
  return 'm';
}

/// Pure resolver — web `useIconContainedState` (no BuildContext).
/// Unset → `secondary`; `auto` → `primary` for `data-appearance`.
///
/// `brand-bg` is preserved as its own Figma appearance role (not aliased to
/// `primary`) so paint uses Brand-Bg tokens via [resolveOneUiIconContainedAppearance].
String resolveOneUiIconContainedAppearanceStatic(
  OneUiIconContainedAppearance? appearance,
) {
  final raw = appearance?.trim().toLowerCase();
  if (raw == null || raw.isEmpty) return 'secondary';
  if (raw == 'auto') return 'primary';
  if (kOneUiIconContainedAppearances.contains(raw)) return raw;
  assert(() {
    debugPrint(
      'OneUiIconContained: unknown appearance "$raw"; falling back to "primary".',
    );
    return true;
  }());
  return 'primary';
}

/// Runtime paint path — omitted / empty / `auto` inherit surface parent role
/// (Figma variable mode; mirrors [resolveOneUiAvatarAppearance] + Button `auto`).
///
/// Explicit `brand-bg` resolves through [OneUiSurfaceScope.tokensForAppearance]
/// to real Brand-Bg surface/onBold maps (web `appearanceBrandBg` parity).
String resolveOneUiIconContainedAppearance(
  BuildContext context,
  OneUiIconContainedAppearance? appearance,
) {
  final raw = appearance?.trim().toLowerCase();
  if (raw == null || raw.isEmpty || raw == 'auto') {
    final surface = OneUiSurfaceScope.maybeOf(context);
    if (surface != null) {
      final effective =
          OneUiSurfaceScope.effectiveSurfaceAppearance(surface, 'auto');
      return resolveOneUiIconContainedAppearanceStatic(effective);
    }
    return 'primary';
  }
  return resolveOneUiIconContainedAppearanceStatic(appearance);
}

OneUiIconContainedResolvedState resolveOneUiIconContainedState({
  OneUiIconContainedSize size = 'm',
  OneUiIconContainedAttention attention = OneUiIconContainedAttention.medium,
  OneUiIconContainedAppearance? appearance,
  bool disabled = false,
}) {
  return OneUiIconContainedResolvedState(
    size: oneUiResolveIconContainedSize(size),
    attention: attention,
    appearance: resolveOneUiIconContainedAppearanceStatic(appearance),
    isDisabled: disabled,
  );
}
