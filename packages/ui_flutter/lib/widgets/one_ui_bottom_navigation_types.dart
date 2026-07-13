/// Types for [OneUiBottomNavigation] — Figma API + `BottomNavigation.shared.ts`.
library;

import 'package:flutter/widgets.dart';

import 'one_ui_appearance_validate.dart';

/// Label layout shared by all items in a bottom navigation bar.
typedef OneUiBottomNavigationLabelType = String;

/// Web / RN canonical values.
const String kOneUiBottomNavLabelNone = 'none';
const String kOneUiBottomNavLabel1Line = '1line';
const String kOneUiBottomNavLabel2Line = '2line';

/// Figma BottomNav `label` property values.
const String kOneUiBottomNavFigmaLabel1Line = '1Line';
const String kOneUiBottomNavFigmaLabel2Line = '2Line';

const List<OneUiBottomNavigationLabelType> kOneUiBottomNavLabelTypes = [
  kOneUiBottomNavLabelNone,
  kOneUiBottomNavLabel1Line,
  kOneUiBottomNavLabel2Line,
];

/// Figma BottomNav.Item `type` property values.
const String kOneUiBottomNavItemTypeLabel1Line = 'label1Line';
const String kOneUiBottomNavItemTypeLabel2Line = 'label2Line';
const String kOneUiBottomNavItemTypeLabelFalse = 'labelFalse';

const List<String> kOneUiBottomNavFigmaItemTypes = [
  kOneUiBottomNavItemTypeLabel1Line,
  kOneUiBottomNavItemTypeLabel2Line,
  kOneUiBottomNavItemTypeLabelFalse,
];

/// Figma BottomNav supports 2–5 items.
const int kOneUiBottomNavMinItems = 2;
const int kOneUiBottomNavMaxItems = 5;

const List<int> kOneUiBottomNavFigmaItemCounts = [2, 3, 4, 5];

/// Multi-accent appearance roles (`ComponentAppearance` minus `auto` at resolve time).
typedef OneUiBottomNavigationAppearance = String;

/// Normalise Figma `1Line` / item `label1Line` → canonical `1line` | `2line` | `none`.
OneUiBottomNavigationLabelType normalizeOneUiBottomNavLabelType(String? raw) {
  if (raw == null || raw.isEmpty) return kOneUiBottomNavLabel1Line;
  return switch (raw) {
    kOneUiBottomNavLabelNone ||
    'none' ||
    kOneUiBottomNavItemTypeLabelFalse =>
      kOneUiBottomNavLabelNone,
    kOneUiBottomNavLabel1Line ||
    '1line' ||
    kOneUiBottomNavFigmaLabel1Line ||
    kOneUiBottomNavItemTypeLabel1Line =>
      kOneUiBottomNavLabel1Line,
    kOneUiBottomNavLabel2Line ||
    '2line' ||
    kOneUiBottomNavFigmaLabel2Line ||
    kOneUiBottomNavItemTypeLabel2Line =>
      kOneUiBottomNavLabel2Line,
    _ => kOneUiBottomNavLabel1Line,
  };
}

/// Optional RN `clampBottomNavigationChildren` helper — **not** used by
/// [OneUiBottomNavigation], which matches web and renders all children
/// (with a dev-mode warning when count exceeds [kOneUiBottomNavMaxItems]).
List<Widget> clampOneUiBottomNavChildren(
  List<Widget> children, {
  int max = kOneUiBottomNavMaxItems,
}) {
  if (children.length <= max) return children;
  return children.sublist(0, max);
}

/// Resolve effective appearance — maps `auto` / unset → [parentAppearance] ?? `primary`.
///
/// When [context] is provided, explicit roles are validated like Badge family
/// components (`oneUiResolveExplicitAppearanceRole`).
String resolveOneUiBottomNavigationAppearance(
  String? appearance, {
  String? parentAppearance,
  BuildContext? context,
  String componentName = 'OneUiBottomNavigation',
}) {
  if (appearance != null && appearance != 'auto' && appearance.isNotEmpty) {
    if (context != null) {
      return oneUiResolveExplicitAppearanceRole(
        context,
        appearance,
        componentName: componentName,
        fallback: 'primary',
      );
    }
    return appearance;
  }
  if (parentAppearance != null &&
      parentAppearance.isNotEmpty &&
      parentAppearance != 'auto') {
    return parentAppearance;
  }
  return 'primary';
}

/// Web `BottomNavItem.tsx` — explicit `active` wins; else match parent `value`.
bool resolveOneUiBottomNavItemActive({
  bool? active,
  String? value,
  String? parentValue,
  required bool inNavigationGroup,
}) {
  if (active != null) return active;
  final itemValue = value?.trim();
  final selectedValue = parentValue?.trim();
  return itemValue != null &&
      itemValue.isNotEmpty &&
      selectedValue != null &&
      selectedValue.isNotEmpty &&
      selectedValue == itemValue;
}

Map<String, String> oneUiBottomNavigationDataAttrs({
  required int itemCount,
  required OneUiBottomNavigationLabelType labelType,
  required String appearance,
}) {
  return {
    'data-items': itemCount.toString(),
    'data-label-type': labelType,
    'data-appearance': appearance,
  };
}

Map<String, String> oneUiBottomNavItemDataAttrs({
  required OneUiBottomNavigationLabelType labelType,
  required String appearance,
  required bool isActive,
  required bool disabled,
}) {
  return {
    'data-label-type': labelType,
    'data-appearance': appearance,
    if (isActive) 'data-active': '',
    if (disabled) 'data-disabled': '',
  };
}

String oneUiBottomNavDataPayloadKey(Map<String, String> attrs) {
  final buffer = StringBuffer('oneui-bottom-nav');
  for (final entry in attrs.entries) {
    buffer.write('|${entry.key}');
    if (entry.value.isNotEmpty) {
      buffer.write('=${entry.value}');
    }
  }
  return buffer.toString();
}

String oneUiBottomNavItemDataPayloadKey(Map<String, String> attrs) {
  final buffer = StringBuffer('oneui-bottom-nav-item');
  for (final entry in attrs.entries) {
    buffer.write('|${entry.key}');
    if (entry.value.isNotEmpty) {
      buffer.write('=${entry.value}');
    }
  }
  return buffer.toString();
}

class OneUiBottomNavigationState {
  const OneUiBottomNavigationState({
    required this.labelType,
    required this.resolvedAppearance,
    required this.itemCount,
    required this.dataAttrs,
  });

  final OneUiBottomNavigationLabelType labelType;
  final String resolvedAppearance;
  final int itemCount;
  final Map<String, String> dataAttrs;

  String get dataPayloadKey => oneUiBottomNavDataPayloadKey(dataAttrs);
}

OneUiBottomNavigationState resolveOneUiBottomNavigationState({
  OneUiBottomNavigationLabelType? labelType,
  String? appearance,
  String? parentAppearance,
  required int itemCount,
  BuildContext? context,
}) {
  final resolvedLabel = normalizeOneUiBottomNavLabelType(labelType);
  final resolvedAppearance = resolveOneUiBottomNavigationAppearance(
    appearance,
    parentAppearance: parentAppearance,
    context: context,
  );
  final dataAttrs = oneUiBottomNavigationDataAttrs(
    itemCount: itemCount,
    labelType: resolvedLabel,
    appearance: resolvedAppearance,
  );
  return OneUiBottomNavigationState(
    labelType: resolvedLabel,
    resolvedAppearance: resolvedAppearance,
    itemCount: itemCount,
    dataAttrs: dataAttrs,
  );
}

class OneUiBottomNavItemState {
  const OneUiBottomNavItemState({
    required this.labelType,
    required this.resolvedAppearance,
    required this.isActive,
    required this.disabled,
    required this.dataAttrs,
  });

  final OneUiBottomNavigationLabelType labelType;
  final String resolvedAppearance;
  final bool isActive;
  final bool disabled;
  final Map<String, String> dataAttrs;

  String get dataPayloadKey => oneUiBottomNavItemDataPayloadKey(dataAttrs);
}

OneUiBottomNavItemState resolveOneUiBottomNavItemState({
  OneUiBottomNavigationLabelType? labelType,
  String? type,
  OneUiBottomNavigationLabelType? parentLabelType,
  String? appearance,
  String? parentAppearance,
  String? parentSurfaceAppearance,
  bool? active,
  String? value,
  String? parentValue,
  required bool inNavigationGroup,
  bool disabled = false,
  BuildContext? context,
}) {
  final resolvedLabel = normalizeOneUiBottomNavLabelType(
    labelType ?? type ?? parentLabelType,
  );
  final resolvedAppearance = resolveOneUiBottomNavigationAppearance(
    appearance ?? parentAppearance,
    parentAppearance: parentSurfaceAppearance,
    context: context,
    componentName: 'OneUiBottomNavItem',
  );
  final isActive = resolveOneUiBottomNavItemActive(
    active: active,
    value: value,
    parentValue: parentValue,
    inNavigationGroup: inNavigationGroup,
  );
  final dataAttrs = oneUiBottomNavItemDataAttrs(
    labelType: resolvedLabel,
    appearance: resolvedAppearance,
    isActive: isActive,
    disabled: disabled,
  );
  return OneUiBottomNavItemState(
    labelType: resolvedLabel,
    resolvedAppearance: resolvedAppearance,
    isActive: isActive,
    disabled: disabled,
    dataAttrs: dataAttrs,
  );
}
