/// Locks Flutter Storybook nav order to web `IconButton.stories.tsx`.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/icon_button_story_catalog.dart';

void main() {
  group('[catalog] IconButton Storybook parity', () {
    test('[catalog] kIconButtonStoryNavOrder matches web export order', () {
      expect(
        kIconButtonStoryNavOrder.map((s) => s.title).toList(),
        [
          'Docs',
          'Default',
          'Attention Levels',
          'Sizes',
          'Condensed',
          'States',
          'Focus State',
          'Appearances',
          'Shape Layouts',
          'Full Width',
          'Interactive',
          'Responsive',
          'Themes',
          'Surface Context',
          'Density',
          'Loading States',
          'Motion',
        ],
      );
    });

    test('[catalog] every catalog entry has a non-empty description', () {
      for (final story in kIconButtonStoryNavOrder) {
        expect(story.description, isNotEmpty, reason: story.title);
      }
    });
  });
}
