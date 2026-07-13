/// Locks Flutter Storybook nav order to web `Chip.stories.tsx`.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/chip_story_catalog.dart';

void main() {
  group('[catalog] Chip Storybook parity', () {
    test('[catalog] kChipStoryNavOrder matches web export order', () {
      expect(
        kChipStoryNavOrder.map((s) => s.title).toList(),
        [
          'Docs',
          'Default',
          'Attention Levels',
          'Sizes',
          'States',
          'Focus State',
          'With Slots',
          'Interactive',
          'Appearances',
          'Surface Context',
          'Motion',
        ],
      );
    });

    test('[catalog] every catalog entry has a non-empty description', () {
      for (final story in kChipStoryNavOrder) {
        expect(story.description, isNotEmpty, reason: story.title);
      }
    });
  });
}
