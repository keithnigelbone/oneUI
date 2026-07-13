import 'package:flutter/material.dart';

import 'linear_progress_indicator_default_story_page.dart';
import 'linear_progress_indicator_interactive_story_page.dart';
import 'linear_progress_indicator_showcase.dart';

enum LinearProgressIndicatorFoundationStory {
  docs,
  defaultStory,
  determinate,
  indeterminate,
  sizes,
  appearances,
  roundCaps,
  flatCaps,
  progressValues,
  surfaceContext,
  allVariants,
  interactive,
}

const List<LinearProgressIndicatorFoundationStory>
    kLinearProgressIndicatorStoryNavOrder = [
  LinearProgressIndicatorFoundationStory.docs,
  LinearProgressIndicatorFoundationStory.defaultStory,
  LinearProgressIndicatorFoundationStory.determinate,
  LinearProgressIndicatorFoundationStory.indeterminate,
  LinearProgressIndicatorFoundationStory.sizes,
  LinearProgressIndicatorFoundationStory.appearances,
  LinearProgressIndicatorFoundationStory.roundCaps,
  LinearProgressIndicatorFoundationStory.flatCaps,
  LinearProgressIndicatorFoundationStory.progressValues,
  LinearProgressIndicatorFoundationStory.surfaceContext,
  LinearProgressIndicatorFoundationStory.allVariants,
  LinearProgressIndicatorFoundationStory.interactive,
];

extension LinearProgressIndicatorFoundationStoryMeta
    on LinearProgressIndicatorFoundationStory {
  String get title => switch (this) {
        LinearProgressIndicatorFoundationStory.docs => 'Docs',
        LinearProgressIndicatorFoundationStory.defaultStory => 'Default',
        LinearProgressIndicatorFoundationStory.determinate => 'Determinate',
        LinearProgressIndicatorFoundationStory.indeterminate => 'Indeterminate',
        LinearProgressIndicatorFoundationStory.sizes => 'Sizes',
        LinearProgressIndicatorFoundationStory.appearances => 'Appearances',
        LinearProgressIndicatorFoundationStory.roundCaps => 'Round Caps',
        LinearProgressIndicatorFoundationStory.flatCaps => 'Flat Caps',
        LinearProgressIndicatorFoundationStory.progressValues =>
          'Progress Values',
        LinearProgressIndicatorFoundationStory.surfaceContext =>
          'Surface Context',
        LinearProgressIndicatorFoundationStory.allVariants => 'All Variants',
        LinearProgressIndicatorFoundationStory.interactive => 'Interactive',
      };

  String get description => switch (this) {
        LinearProgressIndicatorFoundationStory.docs =>
          'Horizontal progress bar with determinate and indeterminate modes.',
        LinearProgressIndicatorFoundationStory.defaultStory =>
          'type=determinate, size=M, value=60 — Controls on Interactive.',
        LinearProgressIndicatorFoundationStory.determinate =>
          'Known percentage fill (value=75).',
        LinearProgressIndicatorFoundationStory.indeterminate =>
          'Sliding segment animation; value ignored.',
        LinearProgressIndicatorFoundationStory.sizes => 'S / M / L track heights.',
        LinearProgressIndicatorFoundationStory.appearances =>
          'Nine multi-accent appearance roles.',
        LinearProgressIndicatorFoundationStory.roundCaps =>
          'Pill track + pill fill (roundCaps: true).',
        LinearProgressIndicatorFoundationStory.flatCaps =>
          'Square track rail; fill stays semicircular (roundCaps: false).',
        LinearProgressIndicatorFoundationStory.progressValues =>
          '0%, 25%, 50%, 75%, 100%.',
        LinearProgressIndicatorFoundationStory.surfaceContext =>
          'Determinate + indeterminate inside Surface modes.',
        LinearProgressIndicatorFoundationStory.allVariants =>
          'Matrix: det/indet × round/flat × S/M/L.',
        LinearProgressIndicatorFoundationStory.interactive =>
          'Live value slider + type toggle.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        LinearProgressIndicatorFoundationStory.docs =>
          buildLpiDocsMerged(context),
        LinearProgressIndicatorFoundationStory.defaultStory =>
          buildLpiDefaultPreview(context),
        LinearProgressIndicatorFoundationStory.determinate =>
          buildLpiDeterminateSection(context),
        LinearProgressIndicatorFoundationStory.indeterminate =>
          buildLpiIndeterminateSection(context),
        LinearProgressIndicatorFoundationStory.sizes =>
          buildLpiSizesSection(context),
        LinearProgressIndicatorFoundationStory.appearances =>
          buildLpiAppearancesSection(context),
        LinearProgressIndicatorFoundationStory.roundCaps =>
          buildLpiRoundCapsSection(context),
        LinearProgressIndicatorFoundationStory.flatCaps =>
          buildLpiFlatCapsSection(context),
        LinearProgressIndicatorFoundationStory.progressValues =>
          buildLpiProgressValuesSection(context),
        LinearProgressIndicatorFoundationStory.surfaceContext =>
          buildLpiSurfaceContextSection(context),
        LinearProgressIndicatorFoundationStory.allVariants =>
          buildLpiAllVariantsSection(context),
        LinearProgressIndicatorFoundationStory.interactive =>
          const LinearProgressIndicatorInteractiveStoryPage(),
      };
}

Widget buildLpiDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      buildLpiDefaultPreview(context),
      SizedBox(height: lpiStoryGap(context, '8')),
      buildLpiDeterminateSection(context),
    ],
  );
}
