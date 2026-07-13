/// Story catalog parity with React `LinearProgressIndicator.stories.tsx`.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/linear_progress_indicator_story_catalog.dart';

void main() {
  group('[catalog] LinearProgressIndicator', () {
    test('[catalog] nav order includes all React story names', () {
      final titles =
          kLinearProgressIndicatorStoryNavOrder.map((s) => s.title).toList();
      expect(titles, contains('Default'));
      expect(titles, contains('Determinate'));
      expect(titles, contains('Indeterminate'));
      expect(titles, contains('Sizes'));
      expect(titles, contains('Appearances'));
      expect(titles, contains('Surface Context'));
      expect(titles, contains('All Variants'));
    });
  });
}
