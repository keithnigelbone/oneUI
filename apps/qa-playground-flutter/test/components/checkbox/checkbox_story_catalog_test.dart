/// Locks Flutter Storybook nav order to web `Checkbox.stories.tsx`.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/checkbox_story_catalog.dart';

void main() {
  group('[catalog] Checkbox Storybook parity', () {
    test('[catalog] kCheckboxStoryNavOrder matches web export order', () {
      expect(
        kCheckboxStoryNavOrder.map((s) => s.title).toList(),
        [
          'Docs',
          'Default',
          'Sizes',
          'States',
          'Focus State',
          'Appearances',
          'Appearance (fill roles)',
          'Surface Context',
          'Themes',
          'With Label',
          'Interactive',
          'Motion',
          'Responsive',
          'Density',
          'Read Only',
        ],
      );
    });

    test('[catalog] every catalog entry has a non-empty description', () {
      for (final story in kCheckboxStoryNavOrder) {
        expect(story.description, isNotEmpty, reason: story.title);
      }
    });
  });
}
