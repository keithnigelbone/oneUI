/// Chip types — `Chip.shared.ts` / native `interface.ts`.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import '../theme/surface_scope.dart';
import '../tokens/appearance_roles.dart';

typedef OneUiChipSize = String;
typedef OneUiChipVariant = String;
typedef OneUiChipAttention = String;
typedef OneUiChipAppearance = String;

/// Figma API row sizes (S / M / L).
const List<OneUiChipSize> kOneUiChipSizes = ['s', 'm', 'l'];

/// Alias for Figma / Convex validation tables.
const List<OneUiChipSize> kOneUiChipFigmaSizes = kOneUiChipSizes;

/// Figma API appearance roles (`auto` resolves at runtime).
const List<OneUiChipAppearance> kOneUiChipAppearances = [
  'auto',
  ...appearanceRoles,
];

/// Explicit appearance roles accepted by Chip (excludes `auto`).
const Set<String> kOneUiChipCanonicalAppearances = {
  ...appearanceRoles,
};

/// Validates an explicit chip appearance — mirrors Avatar/Badge debug guards.
String oneUiResolveChipExplicitAppearance(
  BuildContext context,
  String appearance, {
  String fallback = 'secondary',
}) {
  final key = normalizeAppearanceRoleKey(appearance);
  if (key.isEmpty || key == 'auto') return key;
  if (kOneUiChipCanonicalAppearances.contains(key) ||
      OneUiSurfaceScope.isAppearanceConfigured(context, key)) {
    return key;
  }
  assert(() {
    FlutterError.reportError(
      FlutterErrorDetails(
        exception: FlutterError(
          'OneUiChip: unknown appearance "$appearance"; falling back to "$fallback".',
        ),
        library: 'ui_flutter',
        context: ErrorDescription('while resolving OneUiChip appearance'),
      ),
    );
    return true;
  }());
  return fallback;
}

const Map<OneUiChipAttention, OneUiChipVariant> kChipAttentionToVariant = {
  'high': 'bold',
  'medium': 'subtle',
  'low': 'ghost',
};

const Map<String, OneUiChipSize> kChipSizeAliases = {
  'small': 's',
  'medium': 'm',
  'large': 'l',
};

const Map<OneUiChipSize, String> kChipSizeToLabel = {
  's': 'XS',
  'm': 'S',
  'l': 'M',
};

OneUiChipSize resolveChipSize(OneUiChipSize? size) {
  if (size == null || size.isEmpty) return 'm';
  final aliased = kChipSizeAliases[size] ?? size;
  return kOneUiChipSizes.contains(aliased) ? aliased : 'm';
}

/// Semantic icon size in start/end slots — web `ChipWithSlots` (`3` / `4` / `5`).
String chipSlotIconSizeForChip(OneUiChipSize chipSize) => switch (chipSize) {
      's' => '3',
      'm' => '4',
      'l' => '5',
      _ => '4',
    };

class OneUiChipState {
  const OneUiChipState({
    required this.size,
    required this.isDisabled,
    required this.resolvedVariant,
    required this.resolvedAppearance,
    required this.unselectedAppearance,
    required this.dataAttrs,
  });

  final OneUiChipSize size;
  final bool isDisabled;
  final OneUiChipVariant resolvedVariant;
  final OneUiChipAppearance resolvedAppearance;

  /// Web `data-unselected-appearance` — parent surface role or neutral.
  final String unselectedAppearance;

  /// Web `useChipState` `dataAttrs` + `data-unselected-appearance` / `data-pressed`.
  final Map<String, String> dataAttrs;

  /// Stable QA harness key — mirrors web `Chip.test.tsx` selectors.
  String get dataPayloadKey => oneUiChipDataPayloadKey(dataAttrs);
}

String? _resolveChipParentAppearance(BuildContext context) {
  final surface = OneUiSurfaceScope.maybeOf(context);
  if (surface == null || surface.surfaceDepth == 0) return null;
  return normalizeAppearanceRoleKey(surface.parentAppearance);
}

OneUiChipState resolveOneUiChipState({
  OneUiChipSize size = '',
  OneUiChipVariant? variant,
  OneUiChipAttention? attention,
  OneUiChipAppearance? appearance,
  bool disabled = false,
  String? groupSize,
  OneUiChipVariant? groupVariant,
  OneUiChipAppearance? groupAppearance,
  bool groupDisabled = false,
  String? parentAppearanceForAuto,
  String unselectedAppearance = 'neutral',
  bool isSelected = false,
}) {
  final resolvedSize = resolveChipSize(
    size.isNotEmpty ? size : groupSize,
  );
  final resolvedVariant = variant ??
      groupVariant ??
      (attention != null ? kChipAttentionToVariant[attention] : null) ??
      'bold';

  final rawAppearance = appearance ?? groupAppearance;
  final resolvedAppearance = rawAppearance != null && rawAppearance != 'auto'
      ? normalizeAppearanceRoleKey(rawAppearance)
      : (parentAppearanceForAuto ?? 'secondary');

  final dataAttrs = oneUiChipDataAttrs(
    resolvedSize: resolvedSize,
    resolvedVariant: resolvedVariant,
    resolvedAppearance: resolvedAppearance,
    unselectedAppearance: unselectedAppearance,
    isSelected: isSelected,
    isDisabled: disabled || groupDisabled,
  );

  return OneUiChipState(
    size: resolvedSize,
    isDisabled: disabled || groupDisabled,
    resolvedVariant: resolvedVariant,
    resolvedAppearance: resolvedAppearance,
    unselectedAppearance: unselectedAppearance,
    dataAttrs: dataAttrs,
  );
}

OneUiChipState resolveOneUiChipStateInContext(
  BuildContext context, {
  OneUiChipSize size = '',
  OneUiChipVariant? variant,
  OneUiChipAttention? attention,
  OneUiChipAppearance? appearance,
  bool disabled = false,
  String? groupSize,
  OneUiChipVariant? groupVariant,
  OneUiChipAppearance? groupAppearance,
  bool groupDisabled = false,
  bool isSelected = false,
}) {
  final parentAppearance = _resolveChipParentAppearance(context);
  final validatedAppearance =
      appearance != null && appearance.isNotEmpty && appearance != 'auto'
          ? oneUiResolveChipExplicitAppearance(context, appearance)
          : appearance;
  final validatedGroupAppearance = groupAppearance != null &&
          groupAppearance.isNotEmpty &&
          groupAppearance != 'auto'
      ? oneUiResolveChipExplicitAppearance(context, groupAppearance)
      : groupAppearance;
  return resolveOneUiChipState(
    size: size,
    variant: variant,
    attention: attention,
    appearance: validatedAppearance,
    disabled: disabled,
    groupSize: groupSize,
    groupVariant: groupVariant,
    groupAppearance: validatedGroupAppearance,
    groupDisabled: groupDisabled,
    parentAppearanceForAuto: parentAppearance,
    unselectedAppearance: parentAppearance ?? 'neutral',
    isSelected: isSelected,
  );
}

/// Web `Chip.tsx` + Base UI Toggle `data-*` on the root button.
Map<String, String> oneUiChipDataAttrs({
  required OneUiChipSize resolvedSize,
  required OneUiChipVariant resolvedVariant,
  required String resolvedAppearance,
  required String unselectedAppearance,
  required bool isSelected,
  bool isDisabled = false,
}) {
  return {
    'data-size': resolvedSize,
    'data-variant': resolvedVariant,
    'data-appearance': resolvedAppearance,
    'data-unselected-appearance': unselectedAppearance,
    if (isSelected) 'data-pressed': '',
    if (isDisabled) 'data-disabled': '',
  };
}

/// Stable QA harness key from [oneUiChipDataAttrs].
String oneUiChipDataPayloadKey(Map<String, String> attrs) {
  final buffer = StringBuffer('oneui-chip');
  for (final entry in attrs.entries) {
    buffer.write('|${entry.key}');
    if (entry.value.isNotEmpty) {
      buffer.write('=${entry.value}');
    }
  }
  return buffer.toString();
}

/// Role for selected-state / accent tokens.
///
/// Web: `appearance="auto"` does not add `.appearancePrimary` — `.chip` defaults
/// to Secondary (`--_ch-bold`, etc.). RN historically used `primary` here; Flutter
/// follows web/CSS so surface-context stories match React Storybook.
String chipRoleAppearanceForTokens({
  OneUiChipAppearance? appearanceProp,
  required String resolvedAppearance,
}) {
  return resolvedAppearance;
}

String? chipSlotSurfaceMode({
  required bool selected,
  required OneUiChipVariant variant,
}) {
  if (!selected) return null;
  return switch (variant) {
    'bold' => 'bold',
    'subtle' => 'subtle',
    _ => null,
  };
}
