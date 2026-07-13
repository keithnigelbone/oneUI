import 'package:flutter/material.dart';

import 'circular_progress_indicator_default_story_page.dart';
import 'circular_progress_indicator_interactive_story_page.dart';
import 'circular_progress_indicator_motion_story_page.dart';
import 'circular_progress_indicator_showcase.dart';

enum CircularProgressIndicatorFoundationStory {
  docs,
  defaultStory,
  variants,
  sizes,
  appearances,
  withContent,
  states,
  interactive,
  surfaceContext,
  motion,
}

const List<CircularProgressIndicatorFoundationStory>
    kCircularProgressIndicatorStoryNavOrder = [
  CircularProgressIndicatorFoundationStory.docs,
  CircularProgressIndicatorFoundationStory.defaultStory,
  CircularProgressIndicatorFoundationStory.variants,
  CircularProgressIndicatorFoundationStory.sizes,
  CircularProgressIndicatorFoundationStory.appearances,
  CircularProgressIndicatorFoundationStory.withContent,
  CircularProgressIndicatorFoundationStory.states,
  CircularProgressIndicatorFoundationStory.interactive,
  CircularProgressIndicatorFoundationStory.surfaceContext,
  CircularProgressIndicatorFoundationStory.motion,
];

extension CircularProgressIndicatorFoundationStoryMeta
    on CircularProgressIndicatorFoundationStory {
  String get title => switch (this) {
        CircularProgressIndicatorFoundationStory.docs => 'Docs',
        CircularProgressIndicatorFoundationStory.defaultStory => 'Default',
        CircularProgressIndicatorFoundationStory.variants => 'Variants',
        CircularProgressIndicatorFoundationStory.sizes => 'Sizes',
        CircularProgressIndicatorFoundationStory.appearances => 'Appearances',
        CircularProgressIndicatorFoundationStory.withContent => 'With Content',
        CircularProgressIndicatorFoundationStory.states => 'States',
        CircularProgressIndicatorFoundationStory.interactive => 'Interactive',
        CircularProgressIndicatorFoundationStory.surfaceContext =>
          'Surface Context',
        CircularProgressIndicatorFoundationStory.motion => 'Motion',
      };

  String get description => switch (this) {
        CircularProgressIndicatorFoundationStory.docs =>
          'Determinate and indeterminate circular progress with multi-accent roles.',
        CircularProgressIndicatorFoundationStory.defaultStory =>
          'Default M size, 25% — Controls on Interactive.',
        CircularProgressIndicatorFoundationStory.variants =>
          'Determinate vs indeterminate at 3XL.',
        CircularProgressIndicatorFoundationStory.sizes =>
          'All 10 spacing-index sizes.',
        CircularProgressIndicatorFoundationStory.appearances =>
          'Nine appearance roles.',
        CircularProgressIndicatorFoundationStory.withContent =>
          'Centre text (L+) and icon (XL+) content modes.',
        CircularProgressIndicatorFoundationStory.states =>
          '0%, 25%, 50%, 75%, 100%.',
        CircularProgressIndicatorFoundationStory.interactive =>
          'Tracking, jumping, and indeterminate motion side by side.',
        CircularProgressIndicatorFoundationStory.surfaceContext =>
          'Determinate + indeterminate inside Surface modes.',
        CircularProgressIndicatorFoundationStory.motion =>
          'Motion mode radio (indeterminate / jump / tracking) + entry & exit.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        CircularProgressIndicatorFoundationStory.docs =>
          buildCpiDocsMerged(context),
        CircularProgressIndicatorFoundationStory.defaultStory =>
          buildCpiDefaultPreview(context),
        CircularProgressIndicatorFoundationStory.variants =>
          buildCpiVariantsSection(context),
        CircularProgressIndicatorFoundationStory.sizes =>
          buildCpiSizesSection(context),
        CircularProgressIndicatorFoundationStory.appearances =>
          buildCpiAppearancesSection(context),
        CircularProgressIndicatorFoundationStory.withContent =>
          buildCpiWithContentSection(context),
        CircularProgressIndicatorFoundationStory.states =>
          buildCpiStatesSection(context),
        CircularProgressIndicatorFoundationStory.interactive =>
          const CircularProgressIndicatorInteractiveStoryPage(),
        CircularProgressIndicatorFoundationStory.surfaceContext =>
          buildCpiSurfaceContextSection(context),
        CircularProgressIndicatorFoundationStory.motion =>
          const CircularProgressIndicatorMotionStoryPage(),
      };
}

Widget buildCpiDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      buildCpiDefaultPreview(context),
      SizedBox(height: 32),
      buildCpiVariantsSection(context),
    ],
  );
}
