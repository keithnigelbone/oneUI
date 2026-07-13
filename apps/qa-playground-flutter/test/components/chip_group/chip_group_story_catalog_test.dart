/// Locks Flutter Storybook nav order to web `ChipGroup.stories.tsx`.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/chip_group_story_catalog.dart';

void main() {
  group('[catalog] ChipGroup Storybook parity', () {
    test('[catalog] kChipGroupStoryNavOrder matches web export order', () {
      expect(
        kChipGroupStoryNavOrder.map((s) => s.title).toList(),
        [
          'Docs',
          'Default',
          'Variants',
          'Sizes',
          'States',
          'Multi Select',
          'Interactive',
          'Responsive',
          'Surface Context',
        ],
      );
    });

    test('[catalog] every catalog entry has a non-empty description', () {
      for (final story in kChipGroupStoryNavOrder) {
        expect(story.description, isNotEmpty, reason: story.title);
      }
    });
  });
}
