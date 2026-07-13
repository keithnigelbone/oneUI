library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/radio_field_story_catalog.dart';

/// Ensures Flutter Storybook nav stays 1:1 with `RadioField.stories.tsx`.
void main() {
  test('kRadioFieldStoryNavOrder matches web export names', () {
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
}
