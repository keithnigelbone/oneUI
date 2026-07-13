import 'package:flutter_test/flutter_test.dart';
import 'package:ui_flutter/foundations/checkbox_field_story_catalog.dart';

/// Locks Flutter Storybook nav order to web `CheckboxField.stories.tsx`.
void main() {
  test('kCheckboxFieldStoryNavOrder matches web export order', () {
    expect(
      kCheckboxFieldStoryNavOrder.map((s) => s.title).toList(),
      [
        'Docs',
        'Default',
        'MultiOptions',
        'MultiOptionsFragment',
        'WithDescription',
        'FeedbackOnly',
        'Required',
        'WithInfoIcon',
        'Disabled',
        'Invalid',
        'MultiOptionsWithFeedback',
        'WithDynamicText',
        'FullExample',
        'Sizes',
        'States',
        'SurfaceContext',
        'OnGhostSurface',
      ],
    );
    expect(kCheckboxFieldStoryNavOrder.length, 17);
  });

  test('sidebarTitle matches React Storybook sidebar labels', () {
    expect(
      kCheckboxFieldStoryNavOrder.map((s) => s.sidebarTitle).toList(),
      [
        'Docs',
        'Default',
        'Multi Options',
        'Multi Options Fragment',
        'With Description',
        'Feedback Only',
        'Required',
        'With Info Icon',
        'Disabled',
        'Invalid',
        'Multi Options With Feedback',
        'With Dynamic Text',
        'Full Example',
        'Sizes',
        'States',
        'Surface Context',
        'On Ghost Surface',
      ],
    );
  });
}
