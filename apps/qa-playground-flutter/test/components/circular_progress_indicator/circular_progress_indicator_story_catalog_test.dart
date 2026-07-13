/// Locks Flutter Storybook nav order to web `CircularProgressIndicator.stories.tsx`.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/circular_progress_indicator_story_catalog.dart';

void main() {
  group('[catalog] CircularProgressIndicator Storybook parity', () {
    test('[catalog] kCircularProgressIndicatorStoryNavOrder matches web export order', () {
      expect(
        kCircularProgressIndicatorStoryNavOrder.map((s) => s.title).toList(),
        [
          'Docs',
          'Default',
          'Variants',
          'Sizes',
          'Appearances',
          'With Content',
          'States',
          'Interactive',
          'Surface Context',
          'Motion',
        ],
      );
    });

    test('[catalog] every catalog entry has a non-empty description', () {
      for (final story in kCircularProgressIndicatorStoryNavOrder) {
        expect(story.description, isNotEmpty, reason: story.title);
      }
    });
  });
}
