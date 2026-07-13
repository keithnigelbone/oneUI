/// Types for [OneUiSelectableIconButton] — `SelectableIconButton.shared.ts` parity.
library;

import 'package:flutter/widgets.dart';

import '../theme/surface_scope.dart';
import 'one_ui_button_types.dart';

/// Figma attention — drives **selected** visual prominence only.
enum OneUiSelectableIconButtonAttention { high, medium, low }

/// Web `shape` — square (`1:1`) or wide (`2:3`).
enum OneUiSelectableIconButtonShape { square, wide }

const Set<int> kOneUiSelectableIconButtonValidSizes = {4, 6, 8, 10, 12, 14};

const Map<String, int> kOneUiSelectableIconButtonSizeAliases = {
  '2xs': 4,
  'xs': 6,
  's': 8,
  'm': 10,
  'l': 12,
  'xl': 14,
};

const List<String> kOneUiSelectableIconButtonAppearances = kOneUiButtonAppearances;

int oneUiResolveSelectableIconButtonSize({
  int size = 10,
  String? sizeAlias,
}) {
  var s = size;
  final a = sizeAlias?.trim().toLowerCase();
  if (a != null && a.isNotEmpty) {
    s = kOneUiSelectableIconButtonSizeAliases[a] ?? s;
  }
  if (kOneUiSelectableIconButtonValidSizes.contains(s)) return s;
  return 10;
}

String oneUiSelectableIconButtonShapeDataValue(
    OneUiSelectableIconButtonShape shape) {
  return shape == OneUiSelectableIconButtonShape.wide ? '2:3' : '1:1';
}

String oneUiSelectableIconButtonIconSizeIndex(int numericSize) {
  return switch (numericSize) {
    4 => '2-5',
    6 => '3',
    8 => '4',
    10 => '5',
    12 => '6',
    14 => '7',
    _ => '5',
  };
}

class OneUiSelectableIconButtonResolvedState {
  const OneUiSelectableIconButtonResolvedState({
    required this.isDisabled,
    required this.attention,
    required this.appearance,
    required this.numericSize,
    required this.contained,
    required this.effectiveCondensed,
    required this.effectiveFullWidth,
    required this.dataAttrs,
    required this.dataPayloadKey,
  });

  final bool isDisabled;
  final OneUiSelectableIconButtonAttention attention;
  final String appearance;
  final int numericSize;
  final bool contained;
  final bool effectiveCondensed;
  final bool effectiveFullWidth;
  final Map<String, String?> dataAttrs;
  final String dataPayloadKey;
}

Map<String, String?> oneUiSelectableIconButtonDataAttrs({
  required int numericSize,
  required OneUiSelectableIconButtonAttention attention,
  required bool contained,
  required bool condensed,
  required OneUiSelectableIconButtonShape shape,
  required bool loading,
  required bool selected,
}) {
  return {
    'data-oneui-component': 'SelectableIconButton',
    'data-size': '$numericSize',
    'data-attention': switch (attention) {
      OneUiSelectableIconButtonAttention.high => 'high',
      OneUiSelectableIconButtonAttention.medium => 'medium',
      OneUiSelectableIconButtonAttention.low => 'low',
    },
    'data-contained': contained ? 'true' : 'false',
    if (condensed && contained) 'data-condensed': '',
    if (shape == OneUiSelectableIconButtonShape.wide) 'data-shape': '2:3',
    if (loading) 'data-loading': '',
    if (selected) 'data-pressed': '',
  };
}

String oneUiSelectableIconButtonDataPayloadKey(Map<String, String?> attrs) {
  final buffer = StringBuffer('oneui-sib');
  for (final entry in attrs.entries) {
    final value = entry.value;
    if (value == null) continue;
    buffer.write('|${entry.key}');
    if (value.isNotEmpty) {
      buffer.write('=$value');
    }
  }
  return buffer.toString();
}

OneUiSelectableIconButtonResolvedState resolveOneUiSelectableIconButtonState({
  required BuildContext context,
  OneUiSelectableIconButtonAttention attention =
      OneUiSelectableIconButtonAttention.high,
  String appearance = 'auto',
  int size = 10,
  String? sizeAlias,
  bool condensed = false,
  OneUiSelectableIconButtonShape shape =
      OneUiSelectableIconButtonShape.square,
  bool contained = true,
  bool fullWidth = false,
  bool disabled = false,
  bool loading = false,
  bool selected = false,
}) {
  final isDisabled = disabled || loading;
  final resolvedAppearance = resolveOneUiButtonAppearance(context, appearance);
  final numericSize =
      oneUiResolveSelectableIconButtonSize(size: size, sizeAlias: sizeAlias);
  final effectiveCondensed = contained && condensed;
  final effectiveFullWidth = contained && fullWidth;
  final dataAttrs = oneUiSelectableIconButtonDataAttrs(
    numericSize: numericSize,
    attention: attention,
    contained: contained,
    condensed: effectiveCondensed,
    shape: shape,
    loading: loading,
    selected: selected,
  );

  return OneUiSelectableIconButtonResolvedState(
    isDisabled: isDisabled,
    attention: attention,
    appearance: resolvedAppearance,
    numericSize: numericSize,
    contained: contained,
    effectiveCondensed: effectiveCondensed,
    effectiveFullWidth: effectiveFullWidth,
    dataAttrs: dataAttrs,
    dataPayloadKey: oneUiSelectableIconButtonDataPayloadKey(dataAttrs),
  );
}

bool isOneUiSelectableIconButtonAppearanceConfigured(
  BuildContext context,
  String appearance,
) =>
    isOneUiButtonAppearanceConfigured(context, appearance);
