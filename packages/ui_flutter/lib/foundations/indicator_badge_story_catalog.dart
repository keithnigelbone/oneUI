import 'package:flutter/material.dart';

import 'indicator_badge_default_story_page.dart';
import 'indicator_badge_showcase.dart';

enum IndicatorBadgeFoundationStory {
  docs,
  defaultStory,
  sizes,
  appearances,
  edgeCases,
  surfaceContext,
  interactive,
  responsive,
  themes,
  motion,
  withComponents,
}

const List<IndicatorBadgeFoundationStory> kIndicatorBadgeStoryNavOrder = [
  IndicatorBadgeFoundationStory.docs,
  IndicatorBadgeFoundationStory.defaultStory,
  IndicatorBadgeFoundationStory.sizes,
  IndicatorBadgeFoundationStory.appearances,
  IndicatorBadgeFoundationStory.edgeCases,
  IndicatorBadgeFoundationStory.surfaceContext,
  IndicatorBadgeFoundationStory.interactive,
  IndicatorBadgeFoundationStory.responsive,
  IndicatorBadgeFoundationStory.themes,
  IndicatorBadgeFoundationStory.motion,
  IndicatorBadgeFoundationStory.withComponents,
];

extension IndicatorBadgeFoundationStoryMeta on IndicatorBadgeFoundationStory {
  String get title => switch (this) {
        IndicatorBadgeFoundationStory.docs => 'Docs',
        IndicatorBadgeFoundationStory.defaultStory => 'Default',
        IndicatorBadgeFoundationStory.sizes => 'Sizes',
        IndicatorBadgeFoundationStory.appearances => 'Appearances',
        IndicatorBadgeFoundationStory.edgeCases => 'Edge Cases',
        IndicatorBadgeFoundationStory.surfaceContext => 'Surface Context',
        IndicatorBadgeFoundationStory.interactive => 'Interactive',
        IndicatorBadgeFoundationStory.responsive => 'Responsive',
        IndicatorBadgeFoundationStory.themes => 'Themes',
        IndicatorBadgeFoundationStory.motion => 'Motion',
        IndicatorBadgeFoundationStory.withComponents => 'With Components',
      };

  String get description => switch (this) {
        IndicatorBadgeFoundationStory.docs =>
          'Status/presence dot — web autodocs parity.',
        IndicatorBadgeFoundationStory.defaultStory =>
          'Size M, primary appearance.',
        IndicatorBadgeFoundationStory.sizes => 'XS through XL.',
        IndicatorBadgeFoundationStory.appearances => 'Multi-accent roles.',
        IndicatorBadgeFoundationStory.edgeCases =>
          'Invalid appearance, empty semanticsLabel, auto on Surface.',
        IndicatorBadgeFoundationStory.surfaceContext =>
          'Token remapping on Surface containers.',
        IndicatorBadgeFoundationStory.interactive => 'Live Controls panel.',
        IndicatorBadgeFoundationStory.responsive =>
          'All sizes — mobile viewport.',
        IndicatorBadgeFoundationStory.themes => 'Surface modes × roles.',
        IndicatorBadgeFoundationStory.motion => 'Entry / exit animation demo.',
        IndicatorBadgeFoundationStory.withComponents =>
          'Badge slots and overlaid Avatar / icon examples.',
      };

  Widget buildSection(BuildContext context) => switch (this) {
        IndicatorBadgeFoundationStory.docs =>
          buildIndicatorBadgeDocsMerged(context),
        IndicatorBadgeFoundationStory.defaultStory =>
          buildIndicatorBadgeDefaultPreview(context),
        IndicatorBadgeFoundationStory.sizes =>
          buildIndicatorBadgeSizesSection(context),
        IndicatorBadgeFoundationStory.appearances =>
          buildIndicatorBadgeAppearancesSection(context),
        IndicatorBadgeFoundationStory.edgeCases =>
          buildIndicatorBadgeEdgeCasesSection(context),
        IndicatorBadgeFoundationStory.surfaceContext =>
          buildIndicatorBadgeSurfaceContextSection(context),
        IndicatorBadgeFoundationStory.interactive =>
          const IndicatorBadgeDefaultStoryPage(),
        IndicatorBadgeFoundationStory.responsive =>
          buildIndicatorBadgeResponsiveSection(context),
        IndicatorBadgeFoundationStory.themes =>
          buildIndicatorBadgeThemesSection(context),
        IndicatorBadgeFoundationStory.motion =>
          buildIndicatorBadgeMotionSection(context),
        IndicatorBadgeFoundationStory.withComponents =>
          buildIndicatorBadgeWithComponentsSection(context),
      };
}

Widget buildIndicatorBadgeDocsMerged(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      for (final story in kIndicatorBadgeStoryNavOrder)
        if (story != IndicatorBadgeFoundationStory.docs &&
            story != IndicatorBadgeFoundationStory.defaultStory &&
            story != IndicatorBadgeFoundationStory.interactive)
          Padding(
            padding: const EdgeInsets.only(bottom: 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  story.title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 8),
                Text(story.description,
                    style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: 16),
                story.buildSection(context),
              ],
            ),
          ),
    ],
  );
}
