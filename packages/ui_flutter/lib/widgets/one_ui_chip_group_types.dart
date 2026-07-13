/// ChipGroup types — `ChipGroup.shared.ts` / native `interface.ts`.
library;

import 'one_ui_chip_types.dart';

typedef OneUiChipGroupOrientation = String;
typedef OneUiChipGroupContainerType = String;

/// Figma API row sizes (S / M / L) — propagated to child chips.
const List<OneUiChipSize> kOneUiChipGroupFigmaSizes = kOneUiChipSizes;

/// Figma API `containerType` values.
const List<OneUiChipGroupContainerType> kOneUiChipGroupContainerTypes = [
  'inline',
  'wrap',
];

class OneUiChipGroupToggleOptions {
  const OneUiChipGroupToggleOptions({
    this.multiple = false,
    this.required = false,
    this.maxSelections,
  });

  final bool multiple;
  final bool required;
  final int? maxSelections;
}

/// Resolved layout + QA `data-*` attrs — web `ChipGroup.tsx` + Figma API.
class OneUiChipGroupResolvedState {
  const OneUiChipGroupResolvedState({
    required this.resolvedSize,
    required this.wrap,
    required this.containerType,
    required this.dataAttrs,
  });

  /// Validated group size when set; `null` lets chips use their own default.
  final OneUiChipSize? resolvedSize;
  final bool wrap;

  /// Figma `containerType` — `inline` (no wrap) or `wrap`.
  final OneUiChipGroupContainerType containerType;
  final Map<String, String> dataAttrs;

  String get dataPayloadKey => oneUiChipGroupDataPayloadKey(dataAttrs);
}

/// Figma `containerType` → web/RN `wrap` boolean.
///
/// `inline` → `wrap: false` (`data-wrap="false"` on web).
/// `wrap`   → `wrap: true` (default).
bool resolveChipGroupWrap({
  OneUiChipGroupContainerType? containerType,
  bool wrap = true,
}) {
  if (containerType == null) return wrap;
  return switch (containerType) {
    'inline' => false,
    'wrap' => true,
    _ => true,
  };
}

OneUiChipGroupContainerType resolveChipGroupContainerType({
  OneUiChipGroupContainerType? containerType,
  bool wrap = true,
}) {
  if (containerType != null &&
      kOneUiChipGroupContainerTypes.contains(containerType)) {
    return containerType;
  }
  return resolveChipGroupWrap(wrap: wrap) ? 'wrap' : 'inline';
}

OneUiChipGroupResolvedState resolveOneUiChipGroupState({
  OneUiChipSize? size,
  OneUiChipGroupContainerType? containerType,
  bool wrap = true,
  OneUiChipGroupOrientation orientation = 'horizontal',
  bool disabled = false,
}) {
  final resolvedSize =
      size != null && size.isNotEmpty ? resolveChipSize(size) : null;
  final resolvedWrap = resolveChipGroupWrap(
    containerType: containerType,
    wrap: wrap,
  );
  final resolvedContainerType = resolveChipGroupContainerType(
    containerType: containerType,
    wrap: resolvedWrap,
  );

  return OneUiChipGroupResolvedState(
    resolvedSize: resolvedSize,
    wrap: resolvedWrap,
    containerType: resolvedContainerType,
    dataAttrs: oneUiChipGroupDataAttrs(
      resolvedSize: resolvedSize,
      orientation: orientation,
      wrap: resolvedWrap,
      containerType: resolvedContainerType,
      disabled: disabled,
    ),
  );
}

/// Web `ChipGroup` root `data-*` + Figma `containerType` for QA harnesses.
Map<String, String> oneUiChipGroupDataAttrs({
  required OneUiChipSize? resolvedSize,
  required OneUiChipGroupOrientation orientation,
  required bool wrap,
  required OneUiChipGroupContainerType containerType,
  bool disabled = false,
}) {
  return {
    if (resolvedSize != null) 'data-size': resolvedSize,
    'data-orientation': orientation,
    'data-container-type': containerType,
    if (!wrap) 'data-wrap': 'false',
    if (disabled) 'data-disabled': '',
  };
}

String oneUiChipGroupDataPayloadKey(Map<String, String> attrs) {
  final buffer = StringBuffer('oneui-chip-group');
  for (final entry in attrs.entries) {
    buffer.write('|${entry.key}');
    if (entry.value.isNotEmpty) {
      buffer.write('=${entry.value}');
    }
  }
  return buffer.toString();
}

/// Pure selection step — `computeNextChipGroupValues` (RN unit tests).
List<String>? computeNextChipGroupValues(
  List<String> current,
  String chipValue,
  OneUiChipGroupToggleOptions options,
) {
  final multiple = options.multiple;
  final required = options.required;
  final maxSelections = options.maxSelections;
  final isOn = current.contains(chipValue);

  late List<String> next;
  if (multiple) {
    if (isOn) {
      if (required && current.length == 1) return null;
      next = current.where((v) => v != chipValue).toList();
    } else {
      if (maxSelections != null && current.length >= maxSelections) return null;
      next = [...current, chipValue];
    }
  } else if (isOn) {
    if (required) return null;
    next = [];
  } else {
    next = [chipValue];
  }

  if (required && next.isEmpty) return null;
  if (maxSelections != null && next.length > maxSelections) return null;
  return next;
}
