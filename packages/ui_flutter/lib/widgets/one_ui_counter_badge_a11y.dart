/// CounterBadge accessibility — `CounterBadge` web `role="status"`.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

class OneUiCounterBadgeA11y {
  const OneUiCounterBadgeA11y({
    required this.accessible,
    this.label,
  });

  final bool accessible;
  final String? label;
}

OneUiCounterBadgeA11y resolveOneUiCounterBadgeSemantics({
  String? semanticsLabel,
  required String displayValue,
  bool isDotMode = false,
}) {
  if (semanticsLabel != null && semanticsLabel.trim().isEmpty) {
    assert(() {
      debugPrint(
        'OneUiCounterBadge: `semanticsLabel` must not be whitespace-only.',
      );
      return true;
    }());
  }

  final explicit = semanticsLabel?.trim();
  if (isDotMode && (explicit == null || explicit.isEmpty)) {
    assert(() {
      debugPrint(
        'OneUiCounterBadge: dot-mode (xs + high) requires a non-empty '
        '`semanticsLabel` — numerals are hidden visually.',
      );
      return true;
    }());
    return const OneUiCounterBadgeA11y(accessible: false);
  }

  final label = (explicit != null && explicit.isNotEmpty)
      ? explicit
      : (displayValue.isNotEmpty ? displayValue : null);
  if (label == null || label.isEmpty) {
    return const OneUiCounterBadgeA11y(accessible: false);
  }
  return OneUiCounterBadgeA11y(accessible: true, label: label);
}
