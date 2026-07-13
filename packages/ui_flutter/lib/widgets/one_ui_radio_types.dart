/// Radio types — `Radio.shared.ts` / native `interface.ts`.
library;

import 'package:flutter/widgets.dart';

import '../theme/surface_scope.dart';

typedef OneUiRadioSize = String;
typedef OneUiRadioAppearance = String;

/// Figma API row sizes (S / M / L).
const List<OneUiRadioSize> kOneUiRadioSizes = ['s', 'm', 'l'];

/// Figma / web appearance roles (`auto` resolves at runtime).
const List<OneUiRadioAppearance> kOneUiRadioAppearances = [
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

/// @deprecated Ignored at runtime — use [appearance].
const List<String> kOneUiRadioAccents = ['primary', 'secondary', 'sparkle'];

const Map<String, OneUiRadioSize> kRadioSizeAliases = {
  'small': 's',
  'medium': 'm',
  'large': 'l',
};

/// Body label tier — RN `RADIO_LABEL_BODY_SIZE`.
const Map<OneUiRadioSize, String> kRadioLabelBodySize = {
  's': 'S',
  'm': 'M',
  'l': 'L',
};

OneUiRadioSize resolveRadioSize(OneUiRadioSize? size) {
  if (size == null || size.isEmpty) return 'm';
  final aliased = kRadioSizeAliases[size] ?? size;
  return kOneUiRadioSizes.contains(aliased) ? aliased : 'm';
}

/// Field label stack tier — web `radioSizeToLabelSize`.
OneUiRadioSize radioSizeToLabelSize(OneUiRadioSize? size) =>
    resolveRadioSize(size);

/// Maps Radio S/M/L to Input numeric sizes for [OneUiInputFeedback].
int radioFieldSizeToInputNumeric(OneUiRadioSize? size) {
  final s = resolveRadioSize(size);
  if (s == 's') return 8;
  if (s == 'l') return 12;
  return 10;
}

class OneUiRadioState {
  const OneUiRadioState({
    required this.isDisabled,
    required this.isReadOnly,
    required this.isChecked,
    required this.resolvedAppearance,
    required this.resolvedSize,
  });

  final bool isDisabled;
  final bool isReadOnly;
  final bool isChecked;
  final String resolvedAppearance;
  final OneUiRadioSize resolvedSize;
}

OneUiRadioState resolveOneUiRadioState({
  OneUiRadioSize size = 'm',
  OneUiRadioAppearance appearance = 'auto',
  bool disabled = false,
  bool readOnly = false,
  required bool isChecked,
  OneUiRadioSize? groupSize,
  OneUiRadioAppearance? groupAppearance,
  bool groupDisabled = false,
  bool groupReadOnly = false,
}) {
  final rawAppearance = appearance != 'auto' ? appearance : groupAppearance;
  final resolvedAppearance = rawAppearance == null || rawAppearance == 'auto'
      ? 'secondary'
      : rawAppearance;

  return OneUiRadioState(
    isDisabled: disabled || groupDisabled,
    isReadOnly: readOnly || groupReadOnly,
    isChecked: isChecked,
    resolvedAppearance: resolvedAppearance,
    resolvedSize: resolveRadioSize(
      size.isNotEmpty ? size : (groupSize ?? 'm'),
    ),
  );
}

/// Unchecked border role — web `data-unchecked-appearance` / `useSurfaceAppearance`.
String resolveOneUiRadioUncheckedAppearance(
  BuildContext context, {
  required bool readOnly,
}) {
  if (readOnly) return 'neutral';
  final surface = OneUiSurfaceScope.maybeOf(context);
  if (surface != null && surface.surfaceDepth > 0) {
    return normalizeAppearanceRoleKey(surface.parentAppearance);
  }
  return 'neutral';
}

/// RN `useRadioState` `dataAttrs` — mirrors web CSS selectors.
Map<String, String> oneUiRadioDataAttrs({
  required OneUiRadioSize resolvedSize,
  required String resolvedAppearance,
  required bool isReadOnly,
  required bool isChecked,
  required String uncheckedAppearance,
  bool isDisabled = false,
  bool errorHighlight = false,
}) {
  return {
    'data-size': resolvedSize,
    'data-appearance': resolvedAppearance,
    'data-unchecked-appearance': uncheckedAppearance,
    if (isReadOnly) 'data-readonly': '',
    if (isChecked) 'data-checked': '' else 'data-unchecked': '',
    if (isDisabled) 'data-disabled': '',
    if (errorHighlight) 'data-invalid': '',
  };
}

/// Stable QA harness key from [oneUiRadioDataAttrs].
String oneUiRadioDataPayloadKey(Map<String, String> attrs) {
  final buffer = StringBuffer('oneui-radio');
  for (final entry in attrs.entries) {
    buffer.write('|${entry.key}');
    if (entry.value.isNotEmpty) {
      buffer.write('=${entry.value}');
    }
  }
  return buffer.toString();
}
