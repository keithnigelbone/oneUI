/// Locks Flutter Storybook nav order — Figma validation sections included.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/slider_story_catalog.dart';

void main() {
  group('[catalog] Slider Storybook parity', () {
    test('[catalog] kSliderStoryNavOrder includes Figma sections', () {
      expect(
        kSliderStoryNavOrder.map((s) => s.title).toList(),
        [
          'Docs',
          'Default',
          'Appearances',
          'States',
          'Types',
          'Sizes',
          'Knob Styles',
          'Knob States',
          'With Steps',
          'With Slots',
          'Figma Matrix',
          'Vertical',
          'Surface Context',
          'Motion',
          'Interactive',
        ],
      );
    });

    test('[catalog] every catalog entry has a non-empty description', () {
      for (final story in kSliderStoryNavOrder) {
        expect(story.description, isNotEmpty, reason: story.title);
      }
    });
  });
}
