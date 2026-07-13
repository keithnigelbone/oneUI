import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/bottom_navigation_story_catalog.dart';

/// Locks Flutter Storybook nav order to web `BottomNavigation.stories.tsx`.
void main() {
  test('kBottomNavigationStoryNavOrder matches web export order', () {
    expect(
      kBottomNavigationStoryNavOrder.map((s) => s.title).toList(),
      [
        'Docs',
        'Default',
        'Label Types',
        'Item Counts (2–5)',
        'States',
        'Focus State',
        'With Icons',
        'Interactive',
        'Responsive (phone vs tablet)',
        'Surface Modes',
        'Appearances',
        'Default (Showcase)',
      ],
    );
  });

  test('every catalog entry has a non-empty description', () {
    for (final story in kBottomNavigationStoryNavOrder) {
      expect(story.description, isNotEmpty, reason: story.title);
    }
  });
}
