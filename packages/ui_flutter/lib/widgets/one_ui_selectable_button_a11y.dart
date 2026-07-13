/// SelectableButton accessibility — web Toggle `aria-pressed`.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

class OneUiSelectableButtonSemantics {
  const OneUiSelectableButtonSemantics({
    required this.label,
    this.hint,
    required this.selected,
    required this.enabled,
    required this.busy,
  });

  final String label;
  final String? hint;
  final bool selected;
  final bool enabled;
  final bool busy;
}

String? resolveSelectableButtonAccessibilityLabel({
  String? semanticsLabel,
  String? ariaLabel,
  String? label,
  Widget? child,
}) {
  final explicit = semanticsLabel ?? ariaLabel;
  if (explicit != null && explicit.trim().isNotEmpty) return explicit.trim();
  if (label != null && label.trim().isNotEmpty) return label.trim();
  if (child != null) {
    if (child is String) {
      final s = (child as String).trim();
      if (s.isNotEmpty) return s;
    }
  }
  return null;
}

OneUiSelectableButtonSemantics resolveOneUiSelectableButtonSemantics({
  String? semanticsLabel,
  String? ariaLabel,
  String? label,
  Widget? child,
  String? semanticsHint,
  required bool selected,
  required bool disabled,
  required bool loading,
}) {
  final resolvedLabel = resolveSelectableButtonAccessibilityLabel(
        semanticsLabel: semanticsLabel,
        ariaLabel: ariaLabel,
        label: label,
        child: child,
      );
  if (resolvedLabel == null) {
    assert(() {
      debugPrint(
        'OneUiSelectableButton: no accessible label — provide semanticsLabel, '
        'ariaLabel, label, or a text child.',
      );
      return true;
    }());
  }

  return OneUiSelectableButtonSemantics(
    label: resolvedLabel ?? 'Selectable button',
    hint: semanticsHint,
    selected: selected,
    enabled: !disabled && !loading,
    busy: loading,
  );
}
