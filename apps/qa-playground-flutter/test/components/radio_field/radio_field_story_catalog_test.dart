/// Locks Flutter Storybook nav order to web `RadioField.stories.tsx`.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/radio_field_story_catalog.dart';

void main() {
  group('[catalog] RadioField Storybook parity', () {
    test('[catalog] kRadioFieldStoryNavOrder matches web export order', () {
      expect(
        kRadioFieldStoryNavOrder.map((s) => s.title).toList(),
        [
          'Docs',
          'Default',
          'MultiOptions',
          'MultiOptionsWithDescription',
          'MultiOptionsFragment',
          'MultiOptionsHorizontal',
          'WithFeedback',
          'WithDynamicText',
          'Required',
          'Disabled',
          'SingleOptionWithDescription',
          'WithInfoIcon',
        ],
      );
    });

    test('[catalog] every catalog entry has a non-empty description', () {
      for (final story in kRadioFieldStoryNavOrder) {
        expect(story.description, isNotEmpty, reason: story.title);
      }
    });
  });
}
