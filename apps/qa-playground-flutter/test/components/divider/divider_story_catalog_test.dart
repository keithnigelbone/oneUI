/// Locks Flutter Storybook nav order to web `Divider.stories.tsx`.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/divider_story_catalog.dart';

void main() {
  group('[catalog] Divider Storybook parity', () {
    test('[catalog] kDividerStoryNavOrder matches the expected export order', () {
      expect(
        kDividerStoryNavOrder.map((s) => s.title).toList(),
        [
          'Docs',
          'Default',
          'Orientations',
          'Sizes',
          'Attention Levels',
          'Attention Levels With Icon',
          'Attention Levels With Text',
          'With Icon',
          'With Label',
          'Round Caps',
          'Surface Context',
          'Interactive',
          'Vertical Sizes',
          'Vertical Attention Levels',
          'Vertical With Icon',
          'Vertical With Label',
          'Vertical Inline Usage',
        ],
      );
    });

    test('[catalog] every catalog entry has a non-empty description', () {
      for (final story in kDividerStoryNavOrder) {
        expect(story.description, isNotEmpty, reason: story.title);
      }
    });
  });
}
