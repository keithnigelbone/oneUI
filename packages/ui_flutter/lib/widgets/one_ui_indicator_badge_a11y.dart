/// IndicatorBadge accessibility — web `role="status"` + required `aria-label`.
library;

import 'package:flutter/foundation.dart';

class OneUiIndicatorBadgeA11y {
  const OneUiIndicatorBadgeA11y({
    required this.accessible,
    this.label,
  });

  final bool accessible;
  final String? label;
}

OneUiIndicatorBadgeA11y resolveOneUiIndicatorBadgeSemantics({
  required String semanticsLabel,
}) {
  final label = semanticsLabel.trim();
  if (label.isEmpty) {
    assert(() {
      debugPrint(
        'OneUiIndicatorBadge: `semanticsLabel` is required for accessibility.',
      );
      return true;
    }());
    return const OneUiIndicatorBadgeA11y(accessible: false);
  }
  return OneUiIndicatorBadgeA11y(accessible: true, label: label);
}
