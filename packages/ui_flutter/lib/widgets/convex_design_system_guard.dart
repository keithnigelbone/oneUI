import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import 'convex_gap_card.dart';

/// Debug-only Convex gap card when prerequisites are missing or token chains break.
/// Release builds render nothing — no diagnostic UI for end users.
Widget oneUiConvexGapPlaceholder(List<String> gaps) {
  if (kDebugMode) {
    return ConvexGapCard(gaps: gaps);
  }
  return const SizedBox.shrink();
}

/// Convenience when [OneUiScope.designSystem] is missing.
Widget oneUiMissingDesignSystemPlaceholder([List<String>? gaps]) {
  return oneUiConvexGapPlaceholder(
    gaps ??
        const [
          'OneUiScope.designSystem missing',
        ],
  );
}
