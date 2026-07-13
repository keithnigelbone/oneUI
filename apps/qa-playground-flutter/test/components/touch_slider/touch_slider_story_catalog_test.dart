/// Locks Flutter Storybook nav order to web `TouchSlider.stories.tsx`.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/touch_slider_story_catalog.dart';

void main() {
  group('[catalog] TouchSlider Storybook parity', () {
    test('[catalog] kTouchSliderStoryNavOrder matches web export order', () {
      expect(
        kTouchSliderStoryNavOrder.map((s) => s.title).toList(),
        [
          'Docs',
          'Default',
          'Progress Styles',
          'Slot Position Matrix',
          'With Icon Slots',
          'Appearances',
          'States',
          'Focus State',
          'Vertical',
          'Surface Context',
          'Motion',
          'Interactive',
        ],
      );
    });

    test('[catalog] every catalog entry has a non-empty description', () {
      for (final story in kTouchSliderStoryNavOrder) {
        expect(story.description, isNotEmpty, reason: story.title);
      }
    });
  });
}
