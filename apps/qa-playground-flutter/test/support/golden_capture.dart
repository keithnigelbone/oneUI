/// Shared helpers for deterministic widget golden captures.
///
/// Wrap the widget under test in [wrapOneUiGoldenChild] so `matchesGoldenFile`
/// snapshots the tight [RepaintBoundary] bounds instead of the full 800×600 test
/// surface (which happens when the finder targets a widget with no local
/// repaint boundary).
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

/// Key pinned on every golden capture root.
const Key kOneUiGoldenCaptureKey = Key('oneui-golden-capture');

/// Freezes ticker-driven motion and pins a [RepaintBoundary] for tight captures.
Widget wrapOneUiGoldenChild(Widget child) {
  return TickerMode(
    enabled: false,
    child: RepaintBoundary(
      key: kOneUiGoldenCaptureKey,
      child: child,
    ),
  );
}

/// Finder for the repaint boundary created by [wrapOneUiGoldenChild].
Finder oneUiGoldenCaptureFinder() => find.byKey(kOneUiGoldenCaptureKey);
