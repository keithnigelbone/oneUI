/// Types and state — `Avatar.shared.ts` / RN `interface.ts`.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import '../theme/surface_scope.dart';
import 'one_ui_slot_parent_appearance.dart';

/// Figma `content` property.
enum OneUiAvatarContent { image, icon, text }

/// High / medium / low attention.
enum OneUiAvatarAttention { high, medium, low }

const List<String> kOneUiAvatarSizes = [
  '2xs',
  'xs',
  's',
  'm',
  'l',
  'xl',
  '2xl',
  'custom',
];

const Set<String> kOneUiAvatarTextFallbackSizes = {'2xs', 'xs'};

/// Figma API table appearance roles (+ `auto`). Code also supports `brand-bg`.
const List<String> kOneUiAvatarFigmaAppearances = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'brand-bg',
  'negative',
  'positive',
  'informative',
  'warning',
];

/// Figma code-only `accent` (primary | secondary | sparkle) — no separate prop;
/// use [appearance] for the same role colours (see QA accent stand-in band).
const List<String> kOneUiAvatarFigmaAccentRoles = [
  'primary',
  'secondary',
  'sparkle',
];

/// Validates t-shirt size; unknown values fall back to `'m'`.
String oneUiResolveAvatarSize(String size) {
  final t = size.trim().toLowerCase();
  if (kOneUiAvatarSizes.contains(t)) return t;
  assert(() {
    FlutterError.reportError(
      FlutterErrorDetails(
        exception: FlutterError(
          'OneUiAvatar: unknown size "$size"; falling back to "m". '
          'Valid sizes: ${kOneUiAvatarSizes.join(", ")}.',
        ),
        library: 'ui_flutter',
        context: ErrorDescription('while resolving OneUiAvatar size'),
      ),
    );
    return true;
  }());
  return 'm';
}

/// Web `useAvatarState` — explicit role wins; `auto`/unset → slot parent → `primary`.
String resolveOneUiAvatarAppearance(
  BuildContext context, {
  String? appearance,
}) {
  final raw = appearance?.trim().toLowerCase();
  if (raw != null && raw.isNotEmpty && raw != 'auto') {
    if (kOneUiAvatarFigmaAppearances.contains(raw)) {
      return raw;
    }
    assert(() {
      FlutterError.reportError(
        FlutterErrorDetails(
          exception: FlutterError(
            'OneUiAvatar: unknown appearance "$raw"; falling back to "primary".',
          ),
          library: 'ui_flutter',
          context: ErrorDescription('while resolving OneUiAvatar appearance'),
        ),
      );
      return true;
    }());
    return 'primary';
  }
  final slotParent = OneUiSlotParentAppearanceScope.maybeOf(context);
  if (slotParent != null) {
    return slotParent;
  }
  final surface = OneUiSurfaceScope.maybeOf(context);
  if (surface != null) {
    return OneUiSurfaceScope.effectiveSurfaceAppearance(surface, 'auto');
  }
  return 'primary';
}

/// Same sample as web `Avatar.showcase.tsx` `SAMPLE_IMAGE`.
const String kOneUiAvatarSampleImageUrl =
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';

/// Extract initials — web `getInitials`.
String oneUiAvatarGetInitials(String name) {
  if (name.isEmpty) return '';
  return name
      .split(RegExp(r'\s+'))
      .where((p) => p.isNotEmpty)
      .map((p) => p[0])
      .take(2)
      .join()
      .toUpperCase();
}

class OneUiAvatarResolvedState {
  const OneUiAvatarResolvedState({
    required this.resolvedContent,
    required this.resolvedSize,
    required this.resolvedAttention,
    required this.resolvedAppearance,
    required this.isDisabled,
    required this.dataContent,
    required this.dataSize,
    required this.dataAttention,
    required this.dataAppearance,
  });

  final OneUiAvatarContent resolvedContent;
  final String resolvedSize;
  final OneUiAvatarAttention resolvedAttention;
  final String resolvedAppearance;
  final bool isDisabled;
  final String dataContent;
  final String dataSize;
  final String dataAttention;
  final String dataAppearance;
}

OneUiAvatarResolvedState resolveOneUiAvatarStateInContext(
  BuildContext context, {
  OneUiAvatarContent content = OneUiAvatarContent.image,
  String size = 'm',
  OneUiAvatarAttention attention = OneUiAvatarAttention.high,
  String? appearance,
  String alt = '',
  bool disabled = false,
}) {
  final resolvedSize = oneUiResolveAvatarSize(size);
  final resolvedAppearance = resolveOneUiAvatarAppearance(
    context,
    appearance: appearance,
  );

  var resolvedContent = content;
  if (content == OneUiAvatarContent.text &&
      (kOneUiAvatarTextFallbackSizes.contains(resolvedSize) ||
          oneUiAvatarGetInitials(alt).isEmpty)) {
    resolvedContent = OneUiAvatarContent.icon;
  }

  return OneUiAvatarResolvedState(
    resolvedContent: resolvedContent,
    resolvedSize: resolvedSize,
    resolvedAttention: attention,
    resolvedAppearance: resolvedAppearance,
    isDisabled: disabled,
    dataContent: resolvedContent.name,
    dataSize: resolvedSize,
    dataAttention: attention.name,
    dataAppearance: resolvedAppearance,
  );
}
