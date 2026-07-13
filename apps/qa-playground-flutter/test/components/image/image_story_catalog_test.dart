/// Locks Flutter Storybook nav order to web `Image.stories.tsx`.
///
/// Web exports (order): Default, AspectRatios, ObjectFitModes, States,
/// WithFallback, Interactive, Responsive, CornerRadius, WebHtmlAttributes.
/// Flutter prepends `Docs` and omits the web-only `WebHtmlAttributes` story.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/image_story_catalog.dart';

void main() {
  group('[catalog] Image Storybook parity', () {
    test('[catalog] kImageStoryNavOrder matches the expected export order', () {
      expect(
        kImageStoryNavOrder.map((s) => s.title).toList(),
        [
          'Docs',
          'Default',
          'Aspect Ratios',
          'Object Fit Modes',
          'States',
          'With Fallback',
          'Interactive',
          'Responsive',
          'Corner Radius',
        ],
      );
    });

    test('[catalog] every catalog entry has a non-empty description', () {
      for (final story in kImageStoryNavOrder) {
        expect(story.description, isNotEmpty, reason: story.title);
      }
    });
  });
}
