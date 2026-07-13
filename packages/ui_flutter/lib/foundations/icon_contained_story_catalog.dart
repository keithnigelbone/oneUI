import 'package:flutter/material.dart';

import 'icon_contained_default_story_page.dart';
import 'icon_contained_showcase.dart';

/// Sidebar order — parity with web `Components/Media/IconContained`.
enum IconContainedFoundationStory {
  docs,
  defaultStory,
  attentionLevels,
  sizes,
  states,
  withIcons,
  interactive,
  surfaceContext,
  appearances,
}

const List<IconContainedFoundationStory> kIconContainedStoryNavOrder = [
  IconContainedFoundationStory.docs,
  IconContainedFoundationStory.defaultStory,
  IconContainedFoundationStory.attentionLevels,
  IconContainedFoundationStory.sizes,
  IconContainedFoundationStory.states,
  IconContainedFoundationStory.withIcons,
  IconContainedFoundationStory.interactive,
  IconContainedFoundationStory.surfaceContext,
  IconContainedFoundationStory.appearances,
];

extension IconContainedFoundationStoryMeta on IconContainedFoundationStory {
  String get title => switch (this) {
        IconContainedFoundationStory.docs => 'Docs',
        IconContainedFoundationStory.defaultStory => 'Default',
        IconContainedFoundationStory.attentionLevels => 'Attention Levels',
        IconContainedFoundationStory.sizes => 'Sizes',
        IconContainedFoundationStory.states => 'States',
        IconContainedFoundationStory.withIcons => 'With Icons',
        IconContainedFoundationStory.interactive => 'Interactive',
        IconContainedFoundationStory.surfaceContext => 'Surface Context',
        IconContainedFoundationStory.appearances => 'Appearances',
      };

  String get description => switch (this) {
        IconContainedFoundationStory.docs =>
          'Merged documentation — all IconContained stories on one page.',
        IconContainedFoundationStory.defaultStory =>
          'Live preview with Controls (size, attention, appearance, disabled, a11y).',
        IconContainedFoundationStory.attentionLevels =>
          'High (bold fill) and Medium (subtle fill).',
        IconContainedFoundationStory.sizes =>
          'XS–XL container and inner icon spacing tokens.',
        IconContainedFoundationStory.states =>
          'Enabled and disabled at both attention levels.',
        IconContainedFoundationStory.withIcons =>
          'Semantic icons from the Jio catalog.',
        IconContainedFoundationStory.interactive =>
          'Same as Default with full controls (web Interactive story).',
        IconContainedFoundationStory.surfaceContext =>
          'High / medium on each surface mode inside [OneUiSurface].',
        IconContainedFoundationStory.appearances =>
          'Nine colour roles × high and medium attention.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        IconContainedFoundationStory.docs =>
          buildIconContainedDocsMerged(context),
        IconContainedFoundationStory.defaultStory =>
          buildIconContainedDefaultPreview(context),
        IconContainedFoundationStory.attentionLevels =>
          buildIconContainedAttentionLevelsSection(context),
        IconContainedFoundationStory.sizes =>
          buildIconContainedSizesSection(context),
        IconContainedFoundationStory.states =>
          buildIconContainedStatesSection(context),
        IconContainedFoundationStory.withIcons =>
          buildIconContainedWithIconsSection(context),
        IconContainedFoundationStory.interactive =>
          const IconContainedDefaultStoryPage(),
        IconContainedFoundationStory.surfaceContext =>
          buildIconContainedSurfaceContextSection(context),
        IconContainedFoundationStory.appearances =>
          buildIconContainedAppearancesSection(context),
      };
}

Widget buildIconContainedDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kIconContainedStoryNavOrder)
        if (story != IconContainedFoundationStory.docs &&
            story != IconContainedFoundationStory.defaultStory &&
            story != IconContainedFoundationStory.interactive) ...[
          Text(
            story.title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(story.description, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 16),
          story.buildSection(context),
          const SizedBox(height: 32),
        ],
    ],
  );
}
