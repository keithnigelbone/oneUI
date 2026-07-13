/// Locks Flutter Logo Storybook nav order to web `Logo.stories.tsx`.
///
/// Flutter prepends `Docs` and extends the web set with Flutter-relevant
/// foundation stories (Variants / Content Sources / Surface Context / Image
/// Fallback / Themes). This test pins the sidebar order + non-empty docs so the
/// QA showcase navigation never silently drifts.
library;

import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/logo_story_catalog.dart';

void main() {
  group('[catalog] Logo Storybook parity', () {
    test('[catalog] kLogoStoryNavOrder matches the expected sidebar order', () {
      expect(
        kLogoStoryNavOrder.map((s) => s.title).toList(),
        [
          'Docs',
          'Default',
          'Variants',
          'Sizes',
          'Content Sources',
          'Surface Context',
          'Image Fallback',
          'Interactive',
          'Themes',
        ],
      );
    });

    test('[catalog] every catalog entry has a non-empty description', () {
      for (final story in kLogoStoryNavOrder) {
        expect(story.description, isNotEmpty, reason: story.title);
      }
    });
  });
}
