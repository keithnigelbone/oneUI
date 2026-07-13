/// Storybook nav order parity with React `LinearProgressIndicator.stories.tsx`.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/linear_progress_indicator_story_catalog.dart';

void main() {
  group('[catalog] LinearProgressIndicator story nav', () {
    test('[catalog] nav order matches React stories', () {
      final titles =
          kLinearProgressIndicatorStoryNavOrder.map((s) => s.title).toList();
      expect(titles, [
        'Docs',
        'Default',
        'Determinate',
        'Indeterminate',
        'Sizes',
        'Appearances',
        'Round Caps',
        'Flat Caps',
        'Progress Values',
        'Surface Context',
        'All Variants',
        'Interactive',
      ]);
    });
  });
}
