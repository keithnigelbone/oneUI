/// Checkbox types — `Checkbox.shared.ts` / native `interface.ts`.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import '../theme/surface_scope.dart';
import '../tokens/appearance_roles.dart';

typedef OneUiCheckboxSize = String;
typedef OneUiCheckboxAppearance = String;

/// Figma API row sizes (S / M / L).
const List<OneUiCheckboxSize> kOneUiCheckboxSizes = ['s', 'm', 'l'];

/// Figma / web appearance roles (`auto` resolves at runtime).
const List<OneUiCheckboxAppearance> kOneUiCheckboxAppearances = [
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
const List<String> kOneUiCheckboxAccents = ['primary', 'secondary', 'sparkle'];

const Map<String, OneUiCheckboxSize> kCheckboxSizeAliases = {
  'small': 's',
  'medium': 'm',
  'large': 'l',
};

const Map<OneUiCheckboxSize, String> kCheckboxLabelBodySize = {
  's': 'S',
  'm': 'M',
  'l': 'L',
};

OneUiCheckboxSize resolveCheckboxSize(OneUiCheckboxSize? size) {
  if (size == null || size.isEmpty) return 'm';
  final aliased = kCheckboxSizeAliases[size] ?? size;
  return kOneUiCheckboxSizes.contains(aliased) ? aliased : 'm';
}

OneUiCheckboxSize checkboxSizeToLabelSize(OneUiCheckboxSize? size) =>
    resolveCheckboxSize(size);

int checkboxFieldSizeToInputNumeric(OneUiCheckboxSize? size) {
  final s = resolveCheckboxSize(size);
  if (s == 's') return 8;
  if (s == 'l') return 12;
  return 10;
}

class OneUiCheckboxState {
  const OneUiCheckboxState({
    required this.isDisabled,
    required this.isReadOnly,
    required this.isChecked,
    required this.isIndeterminate,
    required this.resolvedAppearance,
    required this.resolvedSize,
  });

  final bool isDisabled;
  final bool isReadOnly;
  final bool isChecked;
  final bool isIndeterminate;
  final String resolvedAppearance;
  final OneUiCheckboxSize resolvedSize;
}

/// Resolves explicit appearance — web `ComponentAppearance` / RN `useCheckboxState`.
///
/// `auto`, null, and empty resolve to `secondary`. Unknown roles log in debug
/// and fall back to `secondary` (web typed union prevents typos at compile time).
String resolveOneUiCheckboxAppearance(String? appearance) {
  final raw = appearance?.trim();
  if (raw == null || raw.isEmpty || raw == 'auto') return 'secondary';
  final key = normalizeAppearanceRoleKey(raw).toLowerCase();
  if (kOneUiCheckboxAppearances.contains(key) && key != 'auto') return key;
  assert(() {
    FlutterError.reportError(
      FlutterErrorDetails(
        exception: FlutterError(
          'OneUiCheckbox: unknown appearance "$appearance"; falling back to '
          '"secondary".',
        ),
        library: 'ui_flutter',
        context: ErrorDescription('while resolving OneUiCheckbox appearance'),
      ),
    );
    return true;
  }());
  return 'secondary';
}

OneUiCheckboxState resolveOneUiCheckboxState({
  OneUiCheckboxSize size = '',
  OneUiCheckboxAppearance appearance = 'auto',
  bool disabled = false,
  bool readOnly = false,
  required bool isChecked,
  bool indeterminate = false,
  OneUiCheckboxSize? groupSize,
  OneUiCheckboxAppearance? groupAppearance,
  bool groupDisabled = false,
  bool groupReadOnly = false,
}) {
  final rawAppearance = appearance.isNotEmpty && appearance != 'auto'
      ? appearance
      : groupAppearance;
  final resolvedAppearance = resolveOneUiCheckboxAppearance(rawAppearance);

  return OneUiCheckboxState(
    isDisabled: disabled || groupDisabled,
    isReadOnly: readOnly || groupReadOnly,
    isChecked: isChecked,
    isIndeterminate: indeterminate,
    resolvedAppearance: resolvedAppearance,
    resolvedSize: resolveCheckboxSize(
      size.isNotEmpty ? size : (groupSize ?? 'm'),
    ),
  );
}

/// Unchecked border role — web `data-unchecked-appearance` / `useSurfaceAppearance`.
String resolveOneUiCheckboxUncheckedAppearance(
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

/// Web `Checkbox.tsx` + RN `useCheckboxState` `dataAttrs`.
Map<String, String> oneUiCheckboxDataAttrs({
  required OneUiCheckboxSize resolvedSize,
  required String resolvedAppearance,
  required String uncheckedAppearance,
  required bool isReadOnly,
  required bool isChecked,
  required bool isIndeterminate,
  bool isDisabled = false,
  bool errorHighlight = false,
}) {
  return {
    'data-size': resolvedSize,
    'data-appearance': resolvedAppearance,
    'data-unchecked-appearance': uncheckedAppearance,
    if (isReadOnly) 'data-readonly': '',
    if (isIndeterminate)
      'data-indeterminate': ''
    else if (isChecked)
      'data-checked': ''
    else
      'data-unchecked': '',
    if (isDisabled) 'data-disabled': '',
    if (errorHighlight) 'data-invalid': '',
  };
}

/// Stable QA harness key from [oneUiCheckboxDataAttrs].
String oneUiCheckboxDataPayloadKey(Map<String, String> attrs) {
  final buffer = StringBuffer('oneui-checkbox');
  for (final entry in attrs.entries) {
    buffer.write('|${entry.key}');
    if (entry.value.isNotEmpty) {
      buffer.write('=${entry.value}');
    }
  }
  return buffer.toString();
}
