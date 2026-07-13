/// Badge types — `Badge.shared.ts` / `interface.ts` in web + RN.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import '../theme/surface_scope.dart';
import 'one_ui_appearance_validate.dart';

typedef OneUiBadgeSize = String;
typedef OneUiBadgeVariant = String;
typedef OneUiBadgeAttention = String;
typedef OneUiBadgeAppearance = String;

const List<OneUiBadgeSize> kOneUiBadgeSizes = ['xs', 's', 'm', 'l', 'xl'];

/// Figma API table appearance roles (+ `auto`). Code also supports `brand-bg`.
const List<String> kOneUiBadgeFigmaAppearances = [
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

/// Canonical roles accepted by [OneUiBadge.appearance] (includes `brand-bg`).
final Set<String> kOneUiBadgeCanonicalAppearances =
    kOneUiBadgeFamilyCanonicalAppearances;

/// Validates an explicit appearance role — see [oneUiResolveExplicitAppearanceRole].
String oneUiResolveBadgeExplicitAppearance(
  BuildContext context,
  String appearance,
) {
  return oneUiResolveExplicitAppearanceRole(
    context,
    appearance,
    componentName: 'OneUiBadge',
  );
}

/// Figma code-only `accent` (primary | secondary | sparkle) — no separate prop;
/// use [appearance] for the same role colours.
const List<String> kOneUiBadgeFigmaAccentRoles = [
  'primary',
  'secondary',
  'sparkle',
];

const Map<OneUiBadgeAttention, OneUiBadgeVariant> kBadgeAttentionToVariant = {
  'high': 'bold',
  'medium': 'subtle',
  'low': 'ghost',
};

const Map<OneUiBadgeVariant, OneUiBadgeAttention> kBadgeVariantToAttention = {
  'bold': 'high',
  'subtle': 'medium',
  'ghost': 'low',
};

/// Validates t-shirt size; unknown values fall back to `'m'`.
String oneUiResolveBadgeSize(String size) {
  final t = size.trim().toLowerCase();
  if (kOneUiBadgeSizes.contains(t)) return t;
  return 'm';
}

const Map<OneUiBadgeSize, String> kBadgeSizeToLabel = {
  'xs': '3XS',
  's': '2XS',
  'm': 'XS',
  'l': 'S',
  'xl': 'M',
};

class OneUiBadgeState {
  const OneUiBadgeState({
    required this.resolvedVariant,
    required this.resolvedAppearance,
    required this.resolvedAttention,
    required this.size,
    required this.dataSize,
    required this.dataVariant,
    required this.dataAttention,
    required this.dataAppearance,
  });

  final OneUiBadgeVariant resolvedVariant;
  final OneUiBadgeAppearance resolvedAppearance;
  final OneUiBadgeAttention resolvedAttention;
  final OneUiBadgeSize size;
  final String dataSize;
  final String dataVariant;
  final String dataAttention;
  final String dataAppearance;
}

OneUiBadgeState resolveOneUiBadgeState({
  OneUiBadgeSize size = 'm',
  OneUiBadgeVariant? variant,
  OneUiBadgeAttention? attention,
  OneUiBadgeAppearance appearance = 'auto',
  String? surfaceAppearance,
}) {
  final resolvedSize = oneUiResolveBadgeSize(size);
  final resolvedVariant = variant ??
      (attention != null ? kBadgeAttentionToVariant[attention] : null) ??
      'bold';
  final resolvedAttention =
      attention ?? kBadgeVariantToAttention[resolvedVariant] ?? 'high';

  final resolvedAppearance =
      appearance != 'auto' ? appearance : (surfaceAppearance ?? 'sparkle');

  return OneUiBadgeState(
    resolvedVariant: resolvedVariant,
    resolvedAppearance: resolvedAppearance,
    resolvedAttention: resolvedAttention,
    size: resolvedSize,
    dataSize: resolvedSize,
    dataVariant: resolvedVariant,
    dataAttention: resolvedAttention,
    dataAppearance: resolvedAppearance,
  );
}

OneUiBadgeState resolveOneUiBadgeStateInContext(
  BuildContext context, {
  OneUiBadgeSize size = 'm',
  OneUiBadgeVariant? variant,
  OneUiBadgeAttention? attention,
  OneUiBadgeAppearance appearance = 'auto',
}) {
  final surface = OneUiSurfaceScope.maybeOf(context);
  // Web/RN: `useSurfaceAppearance()` is undefined outside `<Surface>` → auto falls
  // back to sparkle. Flutter always has [OneUiSurfaceBootstrap], so only inherit
  // the nearest surface role when nested inside [OneUiSurface] (depth > 0).
  //
  // Test harness note: isolated widget tests without [OneUiSurfaceBootstrap] leave
  // [OneUiSurfaceScope] null — `isAppearanceConfigured` then returns false and
  // appearance="auto" logs a dev warning before falling back to neutral. Wrap badges
  // in `OneUiSurfaceBootstrap` (see qa badge_harness.dart / pumpBadgeQaApp).
  final String? surfaceAppearance = surface != null && surface.surfaceDepth > 0
      ? surface.parentAppearance
      : null;
  final state = resolveOneUiBadgeState(
    size: size,
    variant: variant,
    attention: attention,
    appearance: appearance,
    surfaceAppearance: surfaceAppearance,
  );

  var resolvedAppearance = state.resolvedAppearance;

  if (appearance == 'auto' &&
      !OneUiSurfaceScope.isAppearanceConfigured(context, resolvedAppearance)) {
    assert(() {
      FlutterError.reportError(
        FlutterErrorDetails(
          exception: FlutterError(
            'OneUiBadge: appearance="auto" resolved to "$resolvedAppearance" '
            'but that role is not configured on this brand; falling back to '
            '"neutral".',
          ),
          library: 'ui_flutter',
          context: ErrorDescription('while resolving OneUiBadge appearance'),
        ),
      );
      return true;
    }());
    resolvedAppearance = 'neutral';
    return OneUiBadgeState(
      resolvedVariant: state.resolvedVariant,
      resolvedAppearance: resolvedAppearance,
      resolvedAttention: state.resolvedAttention,
      size: state.size,
      dataSize: state.dataSize,
      dataVariant: state.dataVariant,
      dataAttention: state.dataAttention,
      dataAppearance: resolvedAppearance,
    );
  }

  if (appearance == 'auto') return state;

  final validatedAppearance =
      oneUiResolveBadgeExplicitAppearance(context, appearance);
  if (validatedAppearance == state.resolvedAppearance) return state;

  return OneUiBadgeState(
    resolvedVariant: state.resolvedVariant,
    resolvedAppearance: validatedAppearance,
    resolvedAttention: state.resolvedAttention,
    size: state.size,
    dataSize: state.dataSize,
    dataVariant: state.dataVariant,
    dataAttention: state.dataAttention,
    dataAppearance: validatedAppearance,
  );
}

/// Telemetry key for [KeyedSubtree] — mirrors web `data-*` attrs on `Badge.tsx`.
///
/// Web exposes `data-size`, `data-variant`, and `data-appearance` only. When
/// [explicitVariant] is set, `attention` is an alias and must not churn the key.
String oneUiBadgeDataPayloadKey(
  OneUiBadgeState state, {
  required bool includeAttention,
}) {
  final attentionPart =
      includeAttention ? 'data-attention=${state.dataAttention}|' : '';
  return 'oneui-badge|data-size=${state.dataSize}|data-variant=${state.dataVariant}|'
      '${attentionPart}data-appearance=${state.dataAppearance}';
}
