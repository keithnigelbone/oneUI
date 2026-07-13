/// Types for [OneUiSelectableSingleTextButton] — `SelectableSingleTextButton.shared.ts`.
library;

import 'package:flutter/widgets.dart';

import 'one_ui_button_types.dart';

/// Figma attention — drives **selected** visual prominence only.
enum OneUiSelectableSingleTextButtonAttention { high, medium, low }

/// S / M / L only (no XS) — `SelectableSingleTextButtonSize`.
typedef OneUiSelectableSingleTextButtonSize = String;

const List<String> kOneUiSelectableSingleTextButtonSizes = ['s', 'm', 'l'];

const Set<String> kOneUiSelectableSingleTextButtonValidSizes = {'s', 'm', 'l'};

const List<String> kOneUiSelectableSingleTextButtonAppearances =
    kOneUiButtonAppearances;

String oneUiNormalizeSelectableSingleTextButtonSize(String size) {
  final s = size.trim().toLowerCase();
  if (kOneUiSelectableSingleTextButtonValidSizes.contains(s)) return s;
  return 'm';
}

String oneUiSelectableSingleTextButtonAttentionDataValue(
  OneUiSelectableSingleTextButtonAttention attention,
) {
  return switch (attention) {
    OneUiSelectableSingleTextButtonAttention.high => 'high',
    OneUiSelectableSingleTextButtonAttention.medium => 'medium',
    OneUiSelectableSingleTextButtonAttention.low => 'low',
  };
}

/// Truncate to max 2 characters — circular label constraint (Figma + web dev warn).
String oneUiSelectableSingleTextButtonLabel(String raw) {
  final t = raw.trim();
  if (t.length <= 2) return t;
  assert(() {
    // ignore: avoid_print
    print(
      'OneUiSelectableSingleTextButton: label "$t" exceeds 2 characters. '
      'Truncating to "${t.substring(0, 2)}".',
    );
    return true;
  }());
  return t.substring(0, 2);
}

class OneUiSelectableSingleTextButtonResolvedState {
  const OneUiSelectableSingleTextButtonResolvedState({
    required this.isDisabled,
    required this.attention,
    required this.appearance,
    required this.size,
    required this.effectiveCondensed,
    required this.effectiveFullWidth,
    required this.dataAttrs,
    required this.dataPayloadKey,
  });

  final bool isDisabled;
  final OneUiSelectableSingleTextButtonAttention attention;
  final String appearance;
  final String size;
  final bool effectiveCondensed;
  final bool effectiveFullWidth;
  final Map<String, String?> dataAttrs;
  final String dataPayloadKey;
}

Map<String, String?> oneUiSelectableSingleTextButtonDataAttrs({
  required String size,
  required OneUiSelectableSingleTextButtonAttention attention,
  required bool condensed,
  required bool loading,
  required bool selected,
}) {
  return {
    'data-oneui-component': 'SelectableSingleTextButton',
    'data-size': size,
    'data-attention': oneUiSelectableSingleTextButtonAttentionDataValue(attention),
    if (condensed) 'data-condensed': '',
    if (loading) 'data-loading': '',
    if (selected) 'data-pressed': '',
  };
}

String oneUiSelectableSingleTextButtonDataPayloadKey(
  Map<String, String?> attrs,
) {
  final buffer = StringBuffer('oneui-sstb');
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

OneUiSelectableSingleTextButtonResolvedState
    resolveOneUiSelectableSingleTextButtonState({
  required BuildContext context,
  OneUiSelectableSingleTextButtonAttention attention =
      OneUiSelectableSingleTextButtonAttention.high,
  String appearance = 'auto',
  String size = 'm',
  bool condensed = false,
  bool fullWidth = false,
  bool disabled = false,
  bool loading = false,
  bool selected = false,
}) {
  final isDisabled = disabled || loading;
  final resolvedAppearance = resolveOneUiButtonAppearance(context, appearance);
  final normalizedSize = oneUiNormalizeSelectableSingleTextButtonSize(size);
  final dataAttrs = oneUiSelectableSingleTextButtonDataAttrs(
    size: normalizedSize,
    attention: attention,
    condensed: condensed,
    loading: loading,
    selected: selected,
  );

  return OneUiSelectableSingleTextButtonResolvedState(
    isDisabled: isDisabled,
    attention: attention,
    appearance: resolvedAppearance,
    size: normalizedSize,
    effectiveCondensed: condensed,
    effectiveFullWidth: fullWidth,
    dataAttrs: dataAttrs,
    dataPayloadKey: oneUiSelectableSingleTextButtonDataPayloadKey(dataAttrs),
  );
}

bool isOneUiSelectableSingleTextButtonAppearanceConfigured(
  BuildContext context,
  String appearance,
) =>
    isOneUiButtonAppearanceConfigured(context, appearance);
