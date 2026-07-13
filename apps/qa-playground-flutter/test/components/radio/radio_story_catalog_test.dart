/// Locks Flutter Storybook nav order to web `Radio.stories.tsx`.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/radio_story_catalog.dart';

void main() {
  group('[catalog] Radio Storybook parity', () {
    test('[catalog] kRadioStoryNavOrder matches web export order', () {
      expect(
        kRadioStoryNavOrder.map((s) => s.title).toList(),
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
          'Read Only',
        ],
      );
    });

    test('[catalog] every catalog entry has a non-empty description', () {
      for (final story in kRadioStoryNavOrder) {
        expect(story.description, isNotEmpty, reason: story.title);
      }
    });
  });
}
