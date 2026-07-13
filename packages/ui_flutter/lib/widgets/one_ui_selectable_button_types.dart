/// SelectableButton types — `SelectableButton.shared.ts`.
library;

import 'package:flutter/widgets.dart';

import '../theme/surface_scope.dart';
import '../tokens/appearance_roles.dart';

typedef OneUiSelectableButtonSize = String;
typedef OneUiSelectableButtonAttention = String;
typedef OneUiSelectableButtonAppearance = String;

/// Figma / web sizes (XS / S / M / L).
const List<OneUiSelectableButtonSize> kOneUiSelectableButtonSizes = [
  'xs',
  's',
  'm',
  'l',
];

const List<OneUiSelectableButtonAttention> kOneUiSelectableButtonAttentions = [
  'high',
  'medium',
  'low',
];

const List<OneUiSelectableButtonAppearance> kOneUiSelectableButtonAppearances = [
  'auto',
  ...appearanceRoles,
];

const Set<String> kOneUiSelectableButtonCanonicalAppearances = {
  ...appearanceRoles,
};

OneUiSelectableButtonSize resolveSelectableButtonSize(String? size) {
  if (size == null || size.isEmpty) return 'm';
  final key = size.trim().toLowerCase();
  return kOneUiSelectableButtonSizes.contains(key) ? key : 'm';
}

OneUiSelectableButtonAttention resolveSelectableButtonAttention(
  String? attention,
) {
  if (attention == null || attention.isEmpty) return 'high';
  final key = attention.trim().toLowerCase();
  return kOneUiSelectableButtonAttentions.contains(key) ? key : 'high';
}

String resolveOneUiSelectableButtonAppearance(
  BuildContext context,
  String? appearance,
) {
  final raw = appearance?.trim() ?? '';
  if (raw.isEmpty || raw == 'auto') {
    final parent = OneUiSurfaceScope.maybeOf(context);
    if (parent != null && parent.surfaceDepth > 0) {
      final inherited = normalizeAppearanceRoleKey(parent.parentAppearance);
      if (inherited.isNotEmpty) return inherited;
    }
    return 'primary';
  }
  return normalizeAppearanceRoleKey(raw);
}

/// Web `useSelectableButtonState` data attributes.
class OneUiSelectableButtonState {
  const OneUiSelectableButtonState({
    required this.size,
    required this.attention,
    required this.contained,
    required this.condensed,
    required this.loading,
    required this.isDisabled,
    required this.resolvedAppearance,
    required this.dataAttrs,
  });

  final OneUiSelectableButtonSize size;
  final OneUiSelectableButtonAttention attention;
  final bool contained;
  final bool condensed;
  final bool loading;
  final bool isDisabled;
  final String resolvedAppearance;
  final Map<String, String> dataAttrs;
}

OneUiSelectableButtonState resolveOneUiSelectableButtonState(
  BuildContext context, {
  required String? size,
  required String? attention,
  required String? appearance,
  required bool contained,
  required bool condensed,
  required bool disabled,
  required bool loading,
}) {
  final resolvedSize = resolveSelectableButtonSize(size);
  final resolvedAttention = resolveSelectableButtonAttention(attention);
  final resolvedAppearance =
      resolveOneUiSelectableButtonAppearance(context, appearance);
  final isDisabled = disabled || loading;

  final dataAttrs = <String, String>{
    'data-size': resolvedSize,
    'data-attention': resolvedAttention,
    'data-contained': contained.toString(),
    if (condensed && contained) 'data-condensed': '',
    if (loading) 'data-loading': '',
    if (disabled) 'data-disabled': '',
  };

  return OneUiSelectableButtonState(
    size: resolvedSize,
    attention: resolvedAttention,
    contained: contained,
    condensed: condensed && contained,
    loading: loading,
    isDisabled: isDisabled,
    resolvedAppearance: resolvedAppearance,
    dataAttrs: dataAttrs,
  );
}

String selectableButtonSlotIconSize(OneUiSelectableButtonSize size) =>
    switch (size) {
      'xs' => '3-5',
      's' => '4',
      'm' => '5',
      'l' => '6',
      _ => '5',
    };

String selectableButtonLoadingSpinnerSize(OneUiSelectableButtonSize size) =>
    switch (size) {
      'xs' => '2',
      's' => '3',
      'm' => '4',
      'l' => '5',
      _ => '4',
    };
